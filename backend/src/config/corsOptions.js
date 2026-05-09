import { env } from './env.js'

const origins = [env.FRONTEND_URL, env.ADMIN_URL].filter(Boolean)

export const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    if (origins.includes(origin)) return cb(null, true)
    if (env.NODE_ENV === 'development') return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
