import { getBackendOrigin } from './backendOrigin'

/** URL affichable pour une image renvoyée par l’API (/uploads/… ou URL absolue). */
export function resolveProductImageUrl(src) {
  if (!src || typeof src !== 'string') return null
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/uploads/')) {
    const origin = getBackendOrigin()
    return origin ? `${origin}${src}` : src
  }
  const origin = getBackendOrigin()
  return origin ? `${origin}/uploads/${src.replace(/^\/+/, '')}` : `/uploads/${src}`
}

export function getProductCoverImage(product) {
  const first = product?.images?.[0]
  return first ? resolveProductImageUrl(first) : null
}
