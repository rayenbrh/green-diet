import { Router } from 'express'
import { body } from 'express-validator'
import * as auth from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const r = Router()

const registerChain = [
  body('firstName').trim().notEmpty().withMessage('Prénom requis'),
  body('lastName').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').trim().notEmpty().withMessage('Téléphone requis'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe: minimum 8 caractères'),
]

r.post('/register', registerChain, validate, auth.register)
r.post('/login', body('email').isEmail(), body('password').notEmpty(), validate, auth.login)
r.post('/logout', auth.logout)
r.post('/refresh', auth.refresh)
r.get('/me', requireAuth, auth.me)
r.patch('/me', requireAuth, auth.patchMe)
r.patch(
  '/me/password',
  requireAuth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  auth.patchPassword,
)

r.post('/admin/login', body('email').isEmail(), body('password').notEmpty(), validate, auth.adminLogin)
r.post('/admin/register', auth.adminRegister)

export default r
