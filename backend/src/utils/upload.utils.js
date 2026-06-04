import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from '../config/env.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.join(__dirname, '../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, unique + ext)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Format non supporté. JPEG, PNG ou WebP uniquement.'))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const getFileUrl = (filename) => {
  if (!filename) return null
  const safe = path.basename(filename)
  const rel = `/uploads/${safe}`
  if (env.PUBLIC_API_URL) return `${env.PUBLIC_API_URL}${rel}`
  return rel
}

export function deleteFile(filename) {
  if (!filename || typeof filename !== 'string') return
  const safe = path.basename(filename)
  const filepath = path.join(UPLOADS_DIR, safe)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

export function extractFilename(url) {
  if (!url || typeof url !== 'string') return null
  const parts = url.split('/uploads/')
  return parts.length > 1 ? parts.pop().split('?')[0] || null : null
}

/** Réduit une valeur stockée (URL ou nom de fichier) au seul nom de fichier sous uploads/. */
export function stripToFilename(img) {
  if (!img || typeof img !== 'string') return null
  const fromUploads = extractFilename(img)
  if (fromUploads) return path.basename(fromUploads)
  if (!img.includes('/')) return path.basename(img)
  try {
    const base = new URL(img).pathname.split('/').filter(Boolean).pop()
    return base || null
  } catch {
    return path.basename(img.split('?')[0])
  }
}

export function normalizeImageFilenames(images) {
  if (!Array.isArray(images)) return []
  return images.map((img) => stripToFilename(img)).filter(Boolean)
}

export function toPublicImageUrls(images) {
  if (!Array.isArray(images)) return []
  return normalizeImageFilenames(images).map((fn) => getFileUrl(fn))
}

export function attachPublicImageUrls(product) {
  if (!product?.images?.length) return
  product.images = toPublicImageUrls(product.images)
}
