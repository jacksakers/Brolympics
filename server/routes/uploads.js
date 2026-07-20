import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

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
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'))
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
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

export default router
