import { env } from './env.js'

function toBrowserOrigin(value) {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim().replace(/\/$/, '')
  if (!trimmed) return null
  try {
    const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withScheme).origin
  } catch {
    return null
  }
}

function addOriginVariants(set, origin) {
  if (!origin) return
  set.add(origin)
  try {
    const { protocol, hostname } = new URL(origin)
    if (hostname.startsWith('www.')) {
      set.add(`${protocol}//${hostname.slice(4)}`)
    } else {
      set.add(`${protocol}//www.${hostname}`)
    }
  } catch {
    /* noop */
  }
}

function buildAllowedOrigins() {
  const set = new Set()
  const add = (v) => {
    const o = toBrowserOrigin(v)
    if (o) addOriginVariants(set, o)
  }
  add(env.FRONTEND_URL)
  add(env.ADMIN_URL)
  for (const extra of env.CORS_ORIGINS) add(extra)
  return set
}

const allowedOrigins = buildAllowedOrigins()

/** Pour les journaux de démarrage (origines CORS autorisées en prod). */
export function getCorsAllowedOrigins() {
  return [...allowedOrigins].sort()
}

export function isOriginAllowed(origin) {
  if (!origin) return true
  if (env.NODE_ENV === 'development') return true
  return allowedOrigins.has(origin)
}

/** En-têtes CORS sur les réponses d’erreur (sinon le navigateur masque le vrai message). */
export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (!origin || !isOriginAllowed(origin)) return
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')
}

export const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    if (isOriginAllowed(origin)) return cb(null, true)
    console.warn(`[cors] Origine refusée : ${origin} — vérifiez FRONTEND_URL / ADMIN_URL / CORS_ORIGINS`)
    cb(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 204,
}
