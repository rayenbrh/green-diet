import dotenv from 'dotenv'

dotenv.config()

const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET']

export function loadEnv() {
  const missing = required.filter((k) => !process.env[k])
  if (missing.length && process.env.NODE_ENV === 'production') {
    console.warn('Missing env vars:', missing.join(', '))
  }
}

function parseList(raw) {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5001,
  TRUST_PROXY: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/greendiet',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-change-in-production-min-32-chars!!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-chars!!!!',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'change-admin-secret',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5177',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5001',
  CORS_ORIGINS: parseList(process.env.CORS_ORIGINS || ''),
  /** URL publique HTTPS de l’API sans /api — URLs d’images absolues dans les réponses JSON. */
  PUBLIC_API_URL: (process.env.PUBLIC_API_URL || '').trim().replace(/\/$/, ''),
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE || '+21600000000',
  STORE_NAME: process.env.STORE_NAME || 'Green Diet Sfax',
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase() === 'none' ? 'none' : 'lax',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
}

loadEnv()
