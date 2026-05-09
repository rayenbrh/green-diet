import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  productEmoji: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: Number,
})

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer: {
    fullName: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, default: 'Sfax' },
      region: String,
      country: { type: String, default: 'Tunisie' },
      notes: String,
    },
    comments: String,
    isGuest: { type: Boolean, default: true },
  },
  items: [itemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [
    {
      status: String,
      note: String,
      changedAt: { type: Date, default: Date.now },
    },
  ],
  paymentMethod: { type: String, enum: ['cash_on_delivery'], default: 'cash_on_delivery' },
  isPaid: { type: Boolean, default: false },
  notes: String,
  source: { type: String, enum: ['website', 'instagram', 'whatsapp', 'phone'], default: 'website' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ orderNumber: 1 })

orderSchema.pre('save', async function genOrderNumber(next) {
  if (this.orderNumber) return next()
  const year = new Date().getFullYear()
  const prefix = `GD-${year}-`
  const last = await this.constructor.findOne({ orderNumber: new RegExp(`^${prefix}`) }).sort({
    orderNumber: -1,
  })
  let seq = 1
  if (last?.orderNumber) {
    const part = last.orderNumber.split('-').pop()
    seq = Number.parseInt(part, 10) + 1 || 1
  }
  this.orderNumber = `${prefix}${String(seq).padStart(4, '0')}`
  next()
})

orderSchema.pre('save', function calcTotals(next) {
  let sub = 0
  for (const it of this.items) {
    it.subtotal = it.price * it.quantity
    sub += it.subtotal
  }
  this.subtotal = sub
  this.total = Math.max(0, this.subtotal + this.deliveryFee - this.discount)
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [{ status: this.status, note: 'Créée', changedAt: new Date() }]
  }
  next()
})

export const Order = mongoose.model('Order', orderSchema)
