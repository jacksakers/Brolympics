import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Resolve the uploads directory path; the directory itself is created
// once at server startup in index.js, not here.
const uploadsDir = path.join(__dirname, '..', 'uploads')

// Map allowed image MIME types to a safe, fixed extension. Using this
// lookup (rather than trusting the client-supplied filename) prevents
// path traversal and disguised-executable uploads (e.g. "photo.php.jpg").
const ALLOWED_MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_EXTENSIONS[file.mimetype] || ''
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_EXTENSIONS[file.mimetype]) {
    const err = new Error('Only JPEG, PNG, GIF, or WebP images are allowed')
    err.code = 'UNSUPPORTED_MEDIA_TYPE'
    cb(err)
    return
  }
  cb(null, true)
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_BYTES } })

const router = Router()

/**
 * POST /api/uploads
 * multipart/form-data with an `image` field. Stores the file under
 * server/uploads and returns its public URL.
 */
router.post('/', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err)
      // Surface user-facing errors (file too large, wrong type);
      // return a generic message for anything unexpected.
      const CLIENT_SAFE_CODES = new Set(['LIMIT_FILE_SIZE', 'UNSUPPORTED_MEDIA_TYPE'])
      const message = CLIENT_SAFE_CODES.has(err.code)
        ? err.message
        : 'Upload failed — check server logs for details'
      return res.status(400).json({ error: message })
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

export default router
