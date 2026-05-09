import mongoose from 'mongoose'
import validator from 'validator'
import { Category } from '../models/Category.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { slugifyText } from '../utils/slugify.utils.js'
import { buildWhatsAppUrl, buildNewOrderMessage } from '../utils/whatsapp.utils.js'
import { env } from '../config/env.js'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export async function listAdminProducts(_req, res, next) {
  try {
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 }).lean()
    res.json({ success: true, data: products })
  } catch (e) {
    next(e)
  }
}

export async function getAdminProduct(req, res, next) {
  try {
    const p = await Product.findById(req.params.id).populate('category').lean()
    if (!p) return res.status(404).json({ success: false, message: 'Produit introuvable' })
    res.json({ success: true, data: p })
  } catch (e) {
    next(e)
  }
}

export async function createProduct(req, res, next) {
  try {
    const body = req.body
    const product = await Product.create({
      name: validator.escape(body.name),
      nameAr: body.nameAr,
      category: body.category,
      description: validator.escape(body.description),
      descriptionLong: body.descriptionLong ? validator.escape(body.descriptionLong) : '',
      price: Number(body.price),
      comparePrice: body.comparePrice != null ? Number(body.comparePrice) : undefined,
      weight: body.weight,
      emoji: body.emoji || '🌿',
      bgColor: body.bgColor || '#FAF8F2',
      images: body.images || [],
      tags: body.tags || [],
      isAvailable: body.isAvailable !== false,
      isNew: Boolean(body.isNew),
      isBestSeller: Boolean(body.isBestSeller),
      isFeatured: Boolean(body.isFeatured),
      stock: Number(body.stock ?? 999),
    })
    const p = await Product.findById(product._id).populate('category').lean()
    res.status(201).json({ success: true, data: p })
  } catch (e) {
    next(e)
  }
}

const PRODUCT_PATCH_ALLOWED = [
  'name',
  'nameAr',
  'category',
  'description',
  'descriptionLong',
  'price',
  'comparePrice',
  'weight',
  'emoji',
  'bgColor',
  'images',
  'tags',
  'isAvailable',
  'isNew',
  'isBestSeller',
  'isFeatured',
  'stock',
  'slug',
]

export async function patchProduct(req, res, next) {
  try {
    const body = {}
    for (const k of PRODUCT_PATCH_ALLOWED) {
      if (req.body[k] === undefined) continue
      if (['name', 'description', 'descriptionLong', 'nameAr', 'weight', 'emoji', 'bgColor', 'slug'].includes(k)) {
        const v = req.body[k]
        body[k] = typeof v === 'string' ? validator.escape(v) : v
      } else if (k === 'price' || k === 'comparePrice' || k === 'stock') {
        body[k] = req.body[k] == null ? undefined : Number(req.body[k])
      } else if (k === 'isAvailable' || k === 'isNew' || k === 'isBestSeller' || k === 'isFeatured') {
        body[k] = Boolean(req.body[k])
      } else if (k === 'category') {
        body[k] = req.body[k]
      } else if (k === 'images' || k === 'tags') {
        body[k] = Array.isArray(req.body[k]) ? req.body[k] : req.body[k]
      } else {
        body[k] = req.body[k]
      }
    }
    if (body.name && !body.slug) body.slug = slugifyText(body.name)
    body.updatedAt = new Date()
    const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true }).populate('category').lean()
    if (!product) return res.status(404).json({ success: false, message: 'Introuvable' })
    res.json({ success: true, data: product })
  } catch (e) {
    next(e)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isAvailable: false })
    res.json({ success: true, message: 'Produit désactivé' })
  } catch (e) {
    next(e)
  }
}

export async function toggleProduct(req, res, next) {
  try {
    const p = await Product.findById(req.params.id)
    if (!p) return res.status(404).json({ success: false, message: 'Introuvable' })
    p.isAvailable = !p.isAvailable
    await p.save()
    res.json({ success: true, data: p })
  } catch (e) {
    next(e)
  }
}

export async function listAdminCategories(_req, res, next) {
  try {
    const cats = await Category.find().sort({ order: 1 }).lean()
    res.json({ success: true, data: cats })
  } catch (e) {
    next(e)
  }
}

export async function createCategory(req, res, next) {
  try {
    const b = req.body
    const c = await Category.create({
      name: validator.escape(String(b.name || '')),
      nameAr: b.nameAr ? validator.escape(String(b.nameAr)) : undefined,
      emoji: b.emoji ? validator.escape(String(b.emoji)) : undefined,
      order: Number(b.order) || 0,
      isActive: b.isActive !== false,
    })
    res.status(201).json({ success: true, data: c })
  } catch (e) {
    next(e)
  }
}

export async function patchCategory(req, res, next) {
  try {
    const b = req.body
    const update = {}
    if (b.name !== undefined) update.name = validator.escape(String(b.name))
    if (b.nameAr !== undefined) update.nameAr = b.nameAr ? validator.escape(String(b.nameAr)) : ''
    if (b.emoji !== undefined) update.emoji = b.emoji ? validator.escape(String(b.emoji)) : ''
    if (b.order !== undefined) update.order = Number(b.order)
    if (b.isActive !== undefined) update.isActive = Boolean(b.isActive)
    if (b.slug !== undefined) update.slug = validator.escape(String(b.slug))
    const c = await Category.findByIdAndUpdate(req.params.id, update, { new: true })
    res.json({ success: true, data: c })
  } catch (e) {
    next(e)
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function reorderCategories(req, res, next) {
  try {
    const pairs = req.body
    for (const { id, order } of pairs) {
      await Category.findByIdAndUpdate(id, { order })
    }
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

function canTransition(from, to) {
  if (to === 'cancelled') return true
  if (from === 'cancelled') return false
  const i = STATUS_FLOW.indexOf(from)
  const j = STATUS_FLOW.indexOf(to)
  return j === i + 1
}

export async function listAdminOrders(req, res, next) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customer.fullName': new RegExp(search, 'i') },
        { 'customer.phone': new RegExp(search.replace(/\s/g, ''), 'i') },
      ]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ])
    res.json({ success: true, data: { orders, total, page: Number(page) } })
  } catch (e) {
    next(e)
  }
}

export async function exportOrdersCsv(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5000).lean()
    const headers = 'orderNumber,date,fullName,phone,total,status\n'
    const lines = orders.map(
      (o) =>
        `${o.orderNumber},${o.createdAt?.toISOString?.() || ''},${(o.customer.fullName || '').replace(/,/g, ' ')},${o.customer.phone},${o.total},${o.status}`,
    )
    res.setHeader('Content-Type', 'text/csv')
    res.send(headers + lines.join('\n'))
  } catch (e) {
    next(e)
  }
}

export async function getAdminOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('user').lean()
    if (!order) return res.status(404).json({ success: false, message: 'Introuvable' })
    const msg = buildNewOrderMessage(order)
    const whatsappUrl = buildWhatsAppUrl(order.customer.phone, msg)
    res.json({ success: true, data: { ...order, whatsappUrl } })
  } catch (e) {
    next(e)
  }
}

export async function patchOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Introuvable' })
    if (!canTransition(order.status, status)) {
      return res.status(400).json({ success: false, message: 'Transition de statut invalide' })
    }
    order.status = status
    order.statusHistory.push({ status, note: note || '', changedAt: new Date() })
    order.updatedAt = new Date()
    await order.save()
    res.json({ success: true, data: order })
  } catch (e) {
    next(e)
  }
}

export async function patchOrderNotes(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes: req.body.adminNotes, updatedAt: new Date() },
      { new: true },
    )
    res.json({ success: true, data: order })
  } catch (e) {
    next(e)
  }
}

export async function listUsers(req, res, next) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 50
    const skip = (page - 1) * limit
    const search = (req.query.search || '').trim()
    const filter = { role: 'customer' }
    if (search) {
      filter.$or = [
        { email: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { phone: new RegExp(search.replace(/\s/g, ''), 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
      ]
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ])
    res.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) || 1 } })
  } catch (e) {
    next(e)
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean()
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, data: { user, orders } })
  } catch (e) {
    next(e)
  }
}

export async function patchUserRole(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
