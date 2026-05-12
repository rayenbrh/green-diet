import { env } from './env.js'
import { getCorsAllowedOrigins } from './corsOptions.js'

/** Masque le mot de passe dans une URI MongoDB pour les logs. */
export function redactMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '(non défini)'
  return uri.replace(/\/\/([^:/?#]+):([^@]+)@/, '//$1:***@')
}

function flag(ok) {
  return ok ? '✓' : '✗'
}

function envPresent(v) {
  return Boolean(v && String(v).trim())
}

/**
 * Affiche dans la console l’état de la config au démarrage (sans secrets).
 * @param {{ adminDist: string | null, adminCandidates: { path: string; ok: boolean }[] }} opts
 */
export function logStartupSummary(opts) {
  const { adminDist, adminCandidates } = opts
  const corsList = getCorsAllowedOrigins()

  console.log('')
  console.log('========== Green Diet — démarrage API ==========')
  console.log(`[boot] NODE_ENV=${env.NODE_ENV}  PORT=${env.PORT}  trust proxy=${env.TRUST_PROXY ? 'oui' : 'non'}`)
  console.log(`[boot] Cookie refresh: SameSite=${env.COOKIE_SAMESITE}  (secure si prod ou SameSite=none)`)

  const jwtOk =
    env.JWT_SECRET &&
    env.JWT_SECRET.length >= 32 &&
    !env.JWT_SECRET.includes('dev-only') &&
    env.JWT_REFRESH_SECRET &&
    env.JWT_REFRESH_SECRET.length >= 32 &&
    !env.JWT_REFRESH_SECRET.includes('dev-refresh')
  console.log(
    `${jwtOk ? '[boot] ✓' : '[boot] ✗'} JWT_SECRET / JWT_REFRESH_SECRET : ${
      jwtOk ? 'présents (longueur OK, pas les valeurs de dev par défaut)' : 'manquants ou valeurs de développement — changez-les en production'
    }`,
  )

  const adminKeyOk = env.ADMIN_SECRET_KEY && env.ADMIN_SECRET_KEY !== 'change-admin-secret'
  console.log(
    `${adminKeyOk ? '[boot] ✓' : '[boot] ⚠'} ADMIN_SECRET_KEY : ${adminKeyOk ? 'personnalisé' : 'valeur par défaut — à changer'}`,
  )

  console.log('[boot] CORS (origines autorisées en production) :')
  if (env.NODE_ENV === 'development') {
    console.log('  (dev : toutes les origines sont acceptées par CORS)')
  }
  if (corsList.length === 0) {
    console.log('  ✗ aucune origine résolue — vérifiez FRONTEND_URL / ADMIN_URL')
  } else {
    corsList.forEach((o) => console.log(`  ${flag(true)} ${o}`))
  }
  if (env.CORS_ORIGINS.length) {
    console.log(`[boot] CORS_ORIGINS brut : ${env.CORS_ORIGINS.join(', ')}`)
  }
  console.log(`[boot] FRONTEND_URL (brut) : ${env.FRONTEND_URL}`)
  console.log(`[boot] ADMIN_URL (brut)    : ${env.ADMIN_URL}`)
  console.log('[boot] Images produits : stockage local sous /uploads/')

  const twilio =
    envPresent(env.TWILIO_ACCOUNT_SID) &&
    envPresent(env.TWILIO_AUTH_TOKEN) &&
    envPresent(env.TWILIO_WHATSAPP_FROM)
  console.log(`${twilio ? '[boot] ✓' : '[boot] ✗'} Twilio WhatsApp : ${twilio ? 'configuré' : 'non configuré'}`)

  console.log('[boot] Admin SPA sur cette API (/admin) — chemins locaux :')
  adminCandidates.forEach(({ path: p, ok }) => {
    console.log(`  ${flag(ok)} ${p}`)
  })
  if (adminDist) {
    console.log(`[boot] ✓ Admin servi aussi par l’API : ${adminDist}`)
  } else {
    console.log(
      '[boot] ℹ️ Aucun build admin dans l’image API (normal si l’admin est servie par le frontend sous /admin/).',
    )
  }

  console.log(`[boot] WHATSAPP_PHONE (liens wa.me) : ${env.WHATSAPP_PHONE}`)
  console.log(`[boot] STORE_NAME : ${env.STORE_NAME}`)
  console.log('================================================')
  console.log(`[boot] API prête — http://localhost:${env.PORT}  health: /api/health`)
  if (adminDist) console.log(`[boot] Admin (API) — http://localhost:${env.PORT}/admin/`)
  console.log('')
}
