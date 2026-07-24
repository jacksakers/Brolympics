/**
 * Compresses/resizes an image File in the browser before upload, using
 * an off-screen canvas — phone camera photos are often 5-15MB, and
 * shrinking them client-side keeps uploads fast over Tailscale Funnel
 * (see docs/new_features.txt "Photo Upload Architecture").
 *
 * @param {File} file
 * @param {{maxWidth?: number, quality?: number}} [options]
 * @returns {Promise<File>} a JPEG File, or the original file if it's
 *   already small or isn't a browser-decodable image.
 */
export async function compressImage(file, { maxWidth = 1080, quality = 0.7 } = {}) {
  if (!file || !file.type.startsWith('image/')) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file

    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
  } catch {
    // Decoding failed (unsupported format, corrupt file, etc.) — fall
    // back to uploading the original rather than blocking the user.
    return file
  }
}
