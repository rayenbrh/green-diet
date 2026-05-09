import { verifyAccessToken } from '../utils/jwt.utils.js'

export function optionalAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) return next()
  const token = h.slice(7)
  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
  } catch {
    /* ignore invalid optional token */
  }
  next()
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentification requise' })
  }
  try {
    const decoded = verifyAccessToken(h.slice(7))
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' })
  }
}
