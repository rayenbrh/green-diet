import mongoose from 'mongoose'
import { slugifyText } from '../utils/slugify.utils.js'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  nameAr: String,
  emoji: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
})

categorySchema.pre('save', function preSaveSlug(next) {
  if (!this.slug && this.name) this.slug = slugifyText(this.name)
  next()
})

export const Category = mongoose.model('Category', categorySchema)
