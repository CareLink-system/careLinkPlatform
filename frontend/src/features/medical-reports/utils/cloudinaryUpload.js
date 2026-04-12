/**
 * Uploads a file to Cloudinary.
 * 
 *    KEY FIX: PDFs must be uploaded using resource_type = "raw"
 *    If you use "auto" or "image", Cloudinary stores the PDF incorrectly
 *    and the URL won't open in the browser (shows error page).
 *
 *    Images → use /image/upload/
 *    PDFs   → use /raw/upload/   ← this is the fix
 */
export const uploadToCloudinary = async (file) => {
  if (!file) {
    console.warn('[Cloudinary] No file provided.')
    return null
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    console.error('[Cloudinary] Missing env vars.')
    return null
  }

  const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!ALLOWED.includes(file.type)) {
    console.error(`[Cloudinary] Unsupported file type: ${file.type}`)
    return null
  }

  if (file.size > 10 * 1024 * 1024) {
    console.error('[Cloudinary] File too large (max 10MB)')
    return null
  }

  // PDFs need "raw" resource type — images use "image"
  const isPdf = file.type === 'application/pdf'
  const resourceType = isPdf ? 'raw' : 'image'

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)
  formData.append('folder', 'medical_reports')

  // For PDFs, append .pdf extension so browser knows how to open it
  if (isPdf) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    formData.append('public_id', `medical_reports/${safeName}`)
  }

  try {
    console.log(`[Cloudinary] Uploading "${file.name}" as ${resourceType}…`)

    const res  = await fetch(url, { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      console.error('[Cloudinary] Upload failed:', data.error?.message || data)
      return null
    }

    if (!data.secure_url) {
      console.error('[Cloudinary] No secure_url:', data)
      return null
    }

    console.log('[Cloudinary] Success URL:', data.secure_url)
    return data.secure_url

  } catch (err) {
    console.error('[Cloudinary] Network error:', err.message)
    return null
  }
}