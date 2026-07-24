import { useState } from 'react'
import { compressImage } from '../utils/compressImage.js'
import { uploadImage } from '../lib/api.js'

/**
 * Standardized "compress then upload" flow shared by every photo
 * control in the app (proof photos, player avatars, game images), so
 * compression settings and error handling are consistent everywhere.
 *
 * @returns {{isUploading: boolean, error: string|null, upload: (file: File) => Promise<string|null>}}
 */
export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  async function upload(file) {
    setIsUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      const { url } = await uploadImage(compressed)
      return url
    } catch (err) {
      setError(err.message || 'Photo upload failed')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { isUploading, error, upload }
}
