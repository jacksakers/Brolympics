import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage.js'
import { uploadImage } from '../lib/api.js'
import { Camera, X, Loader2 } from 'lucide-react'

/**
 * Photo-proof attach button: lets the user snap/pick a photo, compresses
 * it client-side (see docs/new_features.txt "Photo Upload Architecture"),
 * uploads it immediately, and reports the resulting `/uploads/...` URL
 * back to the parent for inclusion in a transaction.
 *
 * @param {{imageUrl: string|null, onChange: (url: string|null) => void}} props
 */
export default function PhotoAttach({ imageUrl, onChange }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      const { url } = await uploadImage(compressed)
      onChange(url)
    } catch (err) {
      setError(err.message || 'Photo upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  if (imageUrl) {
    return (
      <div className="relative">
        <img src={imageUrl} alt="Proof" className="w-full max-h-40 rounded-xl object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove photo"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-bright)] px-4 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
      >
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        {isUploading ? 'Uploading…' : 'Attach proof photo'}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
