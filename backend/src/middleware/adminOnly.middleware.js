import { verifyAccessToken } from '../utils/jwt.utils.js'

export function adminOnly(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentification requise' })
  }
  try {
    const decoded = verifyAccessToken(h.slice(7))
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès administrateur uniquement' })
    }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' })
  }
}
