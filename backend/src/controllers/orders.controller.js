import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { notifyAdminNewOrder } from '../utils/whatsapp.utils.js'

function maskPhone(phone) {
  const d = String(phone).replace(/\D/g, '')
  if (d.length < 4) return '●●●'
  return `${d.slice(0, 4)} ●●● ●● ${d.slice(-2)}`
}

export async function createOrder(req, res, next) {
  try {
    const { items, customer, notes, source } = req.body
    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Panier vide' })
    }
    const lineItems = []
    for (const line of items) {
      const product = await Product.findById(line.productId)
      if (!product || !product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Produit indisponible: ${line.productId}`,
        })
      }
      if (product.stock < line.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuffisant pour ${product.name}` })
      }
      lineItems.push({
        product: product._id,
        productName: product.name,
        productEmoji: product.emoji,
        quantity: line.quantity,
        price: product.price,
      })
    }

    const isGuest = !req.user
    const order = new Order({
      user: req.user?.id || null,
      customer: {
        fullName: customer.fullName,
        email: customer.email || undefined,
        phone: customer.phone,
        address: {
          street: customer.address.street,
          city: customer.address.city || 'Sfax',
          region: customer.address.region,
          country: customer.address.country || 'Tunisie',
          notes: customer.address.notes,
        },
        comments: customer.comments,
        isGuest,
      },
      items: lineItems,
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
      notes,
      source: source || 'website',
    })
    await order.save()

    for (const line of lineItems) {
      await Product.findByIdAndUpdate(line.product, {
        $inc: { orderCount: line.quantity, stock: -line.quantity },
      })
    }
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { orderCount: 1, totalSpent: order.total },
      })
    }

    await notifyAdminNewOrder(order)

    res.status(201).json({
      success: true,
      message: 'Commande enregistrée',
      data: {
        order: {
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          items: order.items,
        },
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function trackOrder(req, res, next) {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean()
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' })
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        createdAt: order.createdAt,
        customer: {
          fullName: order.customer.fullName,
          maskedPhone: maskPhone(order.customer.phone),
        },
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function myOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ user: req.user.id }),
    ])
    res.json({
      success: true,
      data: { orders, total, page, totalPages: Math.ceil(total / limit) || 1 },
    })
  } catch (e) {
    next(e)
  }
}
