import fs from 'fs'
import path from 'path'
import { Product } from '../models/Product.js'
import { stripToFilename, UPLOADS_DIR } from './upload.utils.js'

export async function cleanupUnusedUploads() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return { deleted: 0, total: 0 }
    }
    const files = fs.readdirSync(UPLOADS_DIR).filter((f) => f !== '.gitkeep')

    const products = await Product.find({}, 'images').lean()
    const usedFiles = new Set()

    products.forEach((p) => {
      ;(p.images || []).forEach((img) => {
        const fn = stripToFilename(img) || (typeof img === 'string' ? img : null)
        if (fn) usedFiles.add(path.basename(fn))
      })
    })

    let deleted = 0
    files.forEach((file) => {
      if (!usedFiles.has(file)) {
        const filepath = path.join(UPLOADS_DIR, file)
        fs.unlinkSync(filepath)
        deleted++
      }
    })

    console.log(`[uploads] Nettoyage : ${deleted} fichier(s) orphelin(s) supprimé(s).`)
    return { deleted, total: files.length }
  } catch (err) {
    console.error('[uploads] Erreur nettoyage :', err)
    return { deleted: 0, error: err.message }
  }
}
