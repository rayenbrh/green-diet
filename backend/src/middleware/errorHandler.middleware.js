import mongoose from 'mongoose'
import { env } from '../config/env.js'

export function errorHandler(err, req, res, _next) {
  console.error(err)
  let status = err.statusCode || 500
  let message = err.message || 'Erreur serveur'
  const errors = []

  if (err.name === 'ValidationError') {
    status = 422
    for (const key of Object.keys(err.errors || {})) {
      errors.push({ field: key, message: err.errors[key].message })
    }
    message = 'Validation échouée'
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400
    message = 'ID invalide'
  } else if (err.code === 11000) {
    status = 409
    message = 'Cette valeur existe déjà'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401
    message = 'Session invalide ou expirée'
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400
    message = 'Fichier trop volumineux (max 8 Mo)'
  } else if (String(err.message || '').includes('Format non supporté')) {
    status = 400
    message = err.message
  }

  const body = { success: false, message }
  if (errors.length) body.errors = errors
  if (env.NODE_ENV === 'development' && status >= 500) body.detail = String(err.stack)

  res.status(status).json(body)
}
