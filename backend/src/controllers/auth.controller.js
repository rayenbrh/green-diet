import validator from 'validator'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js'

const cookieOpts = () => {
  const sameSite = env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax'
  return {
    httpOnly: true,
    secure: sameSite === 'none' || env.NODE_ENV === 'production',
    sameSite,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }
}

function userPayload(u) {
  return {
    id: u._id.toString(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    address: u.address,
    role: u.role,
    orderCount: u.orderCount,
    totalSpent: u.totalSpent,
    createdAt: u.createdAt,
  }
}

export async function register(req, res, next) {
  try {
    let user = await User.findOne({ email: req.body.email?.toLowerCase?.() })
    if (user) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' })
    }
    user = await User.create({
      firstName: validator.escape(req.body.firstName || ''),
      lastName: validator.escape(req.body.lastName || ''),
      email: req.body.email,
      phone: validator.escape(String(req.body.phone || '')),
      password: req.body.password,
      address: {
        street: validator.escape(req.body.address?.street || ''),
        city: validator.escape(req.body.address?.city || 'Sfax'),
        region: validator.escape(req.body.address?.region || ''),
        country: validator.escape(req.body.address?.country || 'Tunisie'),
        notes: req.body.address?.notes ? validator.escape(req.body.address.notes) : undefined,
      },
      role: 'customer',
    })

    const refresh = signRefreshToken({ sub: user._id.toString() })
    await User.findByIdAndUpdate(user._id, { refreshToken: refresh })
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    res.cookie('refreshToken', refresh, cookieOpts())
    res.status(201).json({
      success: true,
      message: 'Compte créé',
      data: { user: userPayload(user), accessToken },
    })
  } catch (e) {
    next(e)
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findByEmail(req.body.email)
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' })
    }
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })
    const plain = await User.findById(user._id)
    const refresh = signRefreshToken({ sub: user._id.toString() })
    await User.findByIdAndUpdate(user._id, { refreshToken: refresh })
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    res.cookie('refreshToken', refresh, cookieOpts())
    res.json({
      success: true,
      message: 'Connecté',
      data: { user: userPayload(plain), accessToken },
    })
  } catch (e) {
    next(e)
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken
    if (token) {
      try {
        const { sub } = verifyRefreshToken(token)
        await User.findByIdAndUpdate(sub, { $unset: { refreshToken: 1 } })
      } catch {
        /* ignore */
      }
    }
    res.clearCookie('refreshToken', { path: '/' })
    res.json({ success: true, message: 'Déconnecté' })
  } catch (e) {
    next(e)
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ success: false, message: 'Session expirée' })
    const { sub } = verifyRefreshToken(token)
    const user = await User.findById(sub).select('+refreshToken')
    if (!user || user.refreshToken !== token) {
      res.clearCookie('refreshToken', { path: '/' })
      return res.status(401).json({ success: false, message: 'Session invalide' })
    }
    const refreshed = await User.findById(user._id).lean()
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })
    res.json({
      success: true,
      data: { accessToken, user: userPayload(refreshed || user) },
    })
  } catch (e) {
    next(e)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' })
    res.json({ success: true, data: userPayload(user) })
  } catch (e) {
    next(e)
  }
}

export async function patchMe(req, res, next) {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'address']
    const body = {}
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        if (k === 'address' && typeof req.body.address === 'object') {
          body.address = {
            street: validator.escape(req.body.address.street || ''),
            city: validator.escape(req.body.address.city || 'Sfax'),
            region: validator.escape(req.body.address.region || ''),
            country: validator.escape(req.body.address.country || 'Tunisie'),
            notes: req.body.address.notes ? validator.escape(req.body.address.notes) : '',
          }
        } else body[k] = validator.escape(String(req.body[k]))
      }
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: body }, { new: true })
    res.json({ success: true, message: 'Profil mis à jour', data: userPayload(user) })
  } catch (e) {
    next(e)
  }
}

export async function patchPassword(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('+password')
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' })
    }
    user.password = req.body.newPassword
    await user.save()
    res.json({ success: true, message: 'Mot de passe mis à jour' })
  } catch (e) {
    next(e)
  }
}

export async function adminLogin(req, res, next) {
  try {
    const user = await User.findByEmail(req.body.email)
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Identifiants administrateur invalides' })
    }
    if (!(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ success: false, message: 'Identifiants administrateur invalides' })
    }
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })
    const refresh = signRefreshToken({ sub: user._id.toString() })
    await User.findByIdAndUpdate(user._id, { refreshToken: refresh })
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })
    res.cookie('refreshToken', refresh, cookieOpts())
    res.json({
      success: true,
      data: { user: userPayload(user), accessToken },
    })
  } catch (e) {
    next(e)
  }
}

export async function adminRegister(req, res, next) {
  try {
    if (req.body.adminSecret !== env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: 'Clé administrateur invalide' })
    }
    const exists = await User.findOne({ email: req.body.email?.toLowerCase?.() })
    if (exists) return res.status(409).json({ success: false, message: 'Email déjà utilisé' })
    const user = await User.create({
      firstName: validator.escape(req.body.firstName || ''),
      lastName: validator.escape(req.body.lastName || ''),
      email: req.body.email,
      phone: validator.escape(String(req.body.phone || '')),
      password: req.body.password,
      role: 'admin',
    })
    res.status(201).json({ success: true, message: 'Admin créé', data: userPayload(user) })
  } catch (e) {
    next(e)
  }
}
