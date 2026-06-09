import { verifyAccessToken } from '../utils/jwt.utils.js'

function rejectWithDrain(req, res, status, message) {
  // Drain any pending request body so Traefik/nginx doesn't see a dropped connection (→ 502)
  if (!req.readableEnded) {
    req.resume()
  }
  res.status(status).json({ success: false, message })
}

export function adminOnly(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return rejectWithDrain(req, res, 401, 'Authentification requise')
  }
  try {
    const decoded = verifyAccessToken(h.slice(7))
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    if (req.user.role !== 'admin') {
      return rejectWithDrain(req, res, 403, 'Accès administrateur uniquement')
    }
    next()
  } catch {
    return rejectWithDrain(req, res, 401, 'Token invalide ou expiré')
  }
}
