import mongoose from 'mongoose'
import { slugifyText } from '../utils/slugify.utils.js'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    nameAr: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    descriptionLong: String,
    price: { type: Number, required: true, min: 0 },
    comparePrice: Number,
    weight: String,
    emoji: { type: String, default: '🌿' },
    bgColor: { type: String, default: '#FAF8F2' },
    images: [String],
    tags: [String],
    isAvailable: { type: Boolean, default: true },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    stock: { type: Number, default: 999 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

productSchema.index({ slug: 1 })

productSchema.pre('save', function preSlug(next) {
  if (this.isModified('name') && !this.slug) this.slug = slugifyText(this.name)
  if (this.isModified('name') && this.slug) {
    /* keep slug on create; allow manual slug edits */
    if (this.isNew) this.slug = slugifyText(this.name)
  }
  if (this.isNew && !this.slug) this.slug = slugifyText(this.name)
  next()
})

productSchema.pre(/^(updateOne|findOneAndUpdate)/, function setUpdated(next) {
  this.set({ updatedAt: new Date() })
  next()
})

export const Product = mongoose.model('Product', productSchema)
