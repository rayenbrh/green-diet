/** Origine du serveur qui sert /uploads/ (sans slash final). */
export function getUploadsBaseUrl() {
  const explicit = import.meta.env.VITE_BACKEND_ORIGIN?.trim?.()
  if (explicit) return explicit.replace(/\/$/, '')

  const apiUrl = import.meta.env.VITE_API_URL
  if (typeof apiUrl === 'string' && /^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '')
  }

  if (typeof apiUrl === 'string' && apiUrl.startsWith('/')) {
    if (import.meta.env.DEV) return 'http://localhost:5001'
    if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')
    return ''
  }

  if (import.meta.env.DEV) return 'http://localhost:5001'
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')
  return ''
}

/** URL affichable pour une image produit (nom de fichier ou URL déjà absolue). */
export function resolveUploadSrc(imgOrFilename, base = getUploadsBaseUrl()) {
  if (!imgOrFilename || typeof imgOrFilename !== 'string') return ''
  if (/^https?:\/\//i.test(imgOrFilename)) return imgOrFilename
  if (imgOrFilename.startsWith('/uploads/')) {
    const b = (base || '').replace(/\/$/, '')
    return b ? `${b}${imgOrFilename}` : imgOrFilename
  }
  const fn = imgOrFilename.includes('/uploads/')
    ? imgOrFilename.split('/uploads/').pop().split('?')[0]
    : imgOrFilename.replace(/^\/+/, '')
  const b = (base || '').replace(/\/$/, '')
  return b ? `${b}/uploads/${fn}` : `/uploads/${fn}`
}
