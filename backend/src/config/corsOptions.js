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

function buildAllowedOrigins() {
  const set = new Set()
  const add = (v) => {
    const o = toBrowserOrigin(v)
    if (o) set.add(o)
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

export const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    if (allowedOrigins.has(origin)) return cb(null, true)
    if (env.NODE_ENV === 'development') return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
