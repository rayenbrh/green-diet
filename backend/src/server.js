import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDb } from './config/db.js'
import { env } from './config/env.js'
import { corsOptions, getCorsAllowedOrigins } from './config/corsOptions.js'
import { logStartupSummary } from './config/startupLog.js'
import { apiLimiter } from './middleware/rateLimiter.middleware.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import analyticsRoutes from './routes/analytics.routes.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import productsRoutes from './routes/products.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

if (env.TRUST_PROXY) app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)
app.use(cors(corsOptions))

const uploadsDir = path.join(__dirname, '../uploads')
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  const origin = req.headers.origin
  const allowed = getCorsAllowedOrigins()
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (env.NODE_ENV === 'development' || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
    fallthrough: false,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'tiny'))

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)

/** Ne pas se fier à process.cwd(); le build admin peut apparaître après le démarrage de l’API. */
const ADMIN_DIST_CANDIDATES = [
  path.join(__dirname, '..', 'admin-dist'),
  path.join(__dirname, '..', '..', 'frontend', 'admin', 'dist'),
  path.join(process.cwd(), 'admin-dist'),
  path.join(process.cwd(), 'frontend', 'admin', 'dist'),
  path.join(process.cwd(), '..', 'frontend', 'admin', 'dist'),
]

function getAdminDistDiagnostics() {
  return ADMIN_DIST_CANDIDATES.map((p) => {
    const abs = path.resolve(p)
    const indexPath = path.join(abs, 'index.html')
    let ok = false
    try {
      ok = fs.existsSync(indexPath)
    } catch {
      ok = false
    }
    return { path: abs, ok }
  })
}

function resolveAdminDist() {
  for (const { path: p, ok } of getAdminDistDiagnostics()) {
    if (ok) return p
  }
  return null
}

const ADMIN_503_HTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Admin</title></head>
<body style="font-family:system-ui;padding:2rem;">
<p><strong>Pas de build admin</strong> (<code>index.html</code> introuvable).</p>
<p>Lancez une fois <code>npm run build --prefix frontend/admin</code>, ou gardez le <code>vite build --watch</code> puis <strong>réessayez</strong> (détection automatique).</p>
</body></html>`

/** path-to-regexp ajoute /? : ce handler matche /admin ET /admin/. Sans garde, /admin/ → 302 vers /admin/ = boucle. */
app.get('/admin', (req, res, next) => {
  if (req.path !== '/admin') return next()
  const dist = resolveAdminDist()
  if (!dist) return res.status(503).type('html').send(ADMIN_503_HTML)
  const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  res.redirect(302, '/admin/' + q)
})

app.use('/admin', (req, res, next) => {
  const dist = resolveAdminDist()
  if (!dist) {
    if (req.method === 'GET' || req.method === 'HEAD')
      return res.status(503).type('html').send(ADMIN_503_HTML)
    return res.status(404).end()
  }

  /** redirect: false évite boucles 302 entre /admin et /admin/ (serve-static). */
  express.static(dist, {
    index: false,
    fallthrough: true,
    redirect: false,
    maxAge: env.NODE_ENV === 'production' ? '1y' : 0,
  })(req, res, () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(404).end()
    if (res.headersSent) return next()
    res.sendFile(path.join(dist, 'index.html'), { maxAge: 0 }, (err) => {
      if (err) next(err)
    })
  })
})

app.use(errorHandler)

connectDb()
  .then(() => {
    app.listen(env.PORT, () => {
      const adminDist = resolveAdminDist()
      logStartupSummary({
        adminDist,
        adminCandidates: getAdminDistDiagnostics(),
      })
    })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
