import mongoose from 'mongoose'
import { env } from './env.js'

function redactMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '(non défini)'
  return uri.replace(/\/\/([^:/?#]+):([^@]+)@/, '//$1:***@')
}

export async function connectDb() {
  mongoose.set('strictQuery', true)

  const uriLog = redactMongoUri(env.MONGODB_URI)
  console.log(`[mongo] Connexion à ${uriLog} …`)

  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] ✗ Session MongoDB déconnectée')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('[mongo] ✓ Reconnexion MongoDB')
  })
  mongoose.connection.on('error', (err) => {
    console.error('[mongo] ✗ Erreur driver :', err?.message || err)
  })

  await mongoose.connect(env.MONGODB_URI)

  const host = mongoose.connection.host
  const name = mongoose.connection.db?.databaseName ?? '(inconnue)'
  const ready = mongoose.connection.readyState === 1
  console.log(
    `${ready ? '[mongo] ✓' : '[mongo] ✗'} Connecté — hôte: ${host || '—'}  base: « ${name} »  readyState=${mongoose.connection.readyState} (1=connecté)`,
  )
}
