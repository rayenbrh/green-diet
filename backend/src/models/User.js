import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  address: {
    street: String,
    city: { type: String, default: 'Sfax' },
    region: { type: String, default: 'Sfax' },
    country: { type: String, default: 'Tunisie' },
    notes: String,
  },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  refreshToken: { type: String, select: false },
  orderCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
})

userSchema.virtual('fullName').get(function fullNameGetter() {
  return `${this.firstName} ${this.lastName}`
})

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password +refreshToken')
}

userSchema.set('toJSON', { virtuals: true })

export const User = mongoose.model('User', userSchema)
