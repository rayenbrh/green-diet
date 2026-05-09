/**
 * Origine du serveur Express (sans /api), pour ouvrir /admin/ sur le bon hôte:port.
 * En dev, la boutique est souvent sur :5173 et l’API sur :5000 — un chemin relatif /admin/ casse tout.
 */
export function getBackendOrigin() {
  const explicit = import.meta.env.VITE_BACKEND_ORIGIN?.trim?.()
  if (explicit) return explicit.replace(/\/$/, '')

  const apiUrl = import.meta.env.VITE_API_URL
  if (typeof apiUrl === 'string' && /^https?:\/\//i.test(apiUrl)) {
    const noApi = apiUrl.replace(/\/api\/?$/i, '')
    if (noApi) return noApi.replace(/\/$/, '')
  }

  // URL API relative (/api…) : même origine en prod (reverse proxy), en dev ⇒ API sur port 5000
  if (typeof apiUrl === 'string' && apiUrl.startsWith('/')) {
    if (import.meta.env.DEV) return 'http://localhost:5000'.replace(/\/$/, '')
    if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')
    return ''
  }

  if (import.meta.env.DEV) return 'http://localhost:5000'

  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')

  return ''
}

/** URL complète vers l’SPA admin servie par Express */
export function getAdminDashboardUrl() {
  const origin = getBackendOrigin()
  if (!origin) return `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/`
  return `${origin}/admin/`
}
