/**
 * Origine du serveur Express (sans /api), pour ouvrir /admin/ sur le bon hôte:port.
 * En dev, la boutique est sur :5177 et l’API sur :5001 — un chemin relatif /admin/ casse tout.
 */
export function getBackendOrigin() {
  const explicit = import.meta.env.VITE_BACKEND_ORIGIN?.trim?.()
  if (explicit) return explicit.replace(/\/$/, '')

  const apiUrl = import.meta.env.VITE_API_URL
  if (typeof apiUrl === 'string' && /^https?:\/\//i.test(apiUrl)) {
    const noApi = apiUrl.replace(/\/api\/?$/i, '')
    if (noApi) return noApi.replace(/\/$/, '')
  }

  // URL API relative (/api…) : même origine en prod (reverse proxy), en dev ⇒ API sur port 5001
  if (typeof apiUrl === 'string' && apiUrl.startsWith('/')) {
    if (import.meta.env.DEV) return 'http://localhost:5001'.replace(/\/$/, '')
    if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')
    return ''
  }

  if (import.meta.env.DEV) return 'http://localhost:5001'

  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')

  return ''
}

/** URL complète vers l’admin (Express /admin/ ou service séparé si `VITE_ADMIN_URL`). */
export function getAdminDashboardUrl() {
  const fromEnv = import.meta.env.VITE_ADMIN_URL?.trim?.()
  if (fromEnv) {
    const u = fromEnv.replace(/\/?$/, '')
    return fromEnv.endsWith('/') ? fromEnv : `${u}/`
  }
  const origin = getBackendOrigin()
  if (!origin) return `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/`
  return `${origin}/admin/`
}
