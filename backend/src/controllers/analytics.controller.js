import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function startOfPrevMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function endOfPrevMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59)
}

export async function summary(req, res, next) {
  try {
    const now = new Date()
    const thisMonth = startOfMonth(now)
    const lastMonthStart = startOfPrevMonth()
    const lastMonthEnd = endOfPrevMonth()

    const [
      totalOrders,
      ordersThisMonth,
      pendingOrders,
      totalProducts,
      totalCustomers,
      revenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ])

    const totalRevenue = revenueAgg[0]?.total || 0
    const revThis = revenueThisMonthAgg[0]?.total || 0
    const revLast = revenueLastMonthAgg[0]?.total || 0
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0

    const topProducts = await Product.find().sort({ orderCount: -1 }).limit(5).select('name emoji orderCount price').lean()
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer.fullName total status createdAt _id')
      .lean()

    res.json({
      success: true,
      data: {
        totalRevenue,
        revenueThisMonth: revThis,
        revenueLastMonth: revLast,
        totalOrders,
        ordersThisMonth,
        pendingOrders,
        totalProducts,
        totalCustomers,
        avgOrderValue,
        topProducts,
        recentOrders,
      },
    })
  } catch (e) {
    next(e)
  }
}

const periodDays = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }

export async function revenue(req, res, next) {
  try {
    const period = req.query.period || '30d'
    const days = periodDays[period] || 30
    const start = new Date()
    start.setDate(start.getDate() - days)

    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    res.json({
      success: true,
      data: rows.map((r) => ({ date: r._id, revenue: r.revenue, orderCount: r.orderCount })),
    })
  } catch (e) {
    next(e)
  }
}

export async function ordersByStatus(_req, res, next) {
  try {
    const rows = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const total = rows.reduce((s, r) => s + r.count, 0) || 1
    res.json({
      success: true,
      data: rows.map((r) => ({
        status: r._id,
        count: r.count,
        percentage: Math.round((r.count / total) * 1000) / 10,
      })),
    })
  } catch (e) {
    next(e)
  }
}

export async function topProducts(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 10
    let days = 30
    const p = req.query.period || '30d'
    if (p === '12m') days = 365
    else days = Number(p.replace(/\D/g, '')) || 30
    const start = new Date()
    start.setDate(start.getDate() - days)

    const fromOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ])

    const ids = fromOrders.map((x) => x._id).filter(Boolean)
    const products = await Product.find({ _id: { $in: ids } }).lean()
    const map = Object.fromEntries(products.map((p) => [p._id.toString(), p]))
    const data = fromOrders.map((r) => ({
      product: map[r._id?.toString?.()] || null,
      sold: r.sold,
      revenue: r.revenue,
    }))

    res.json({ success: true, data })
  } catch (e) {
    next(e)
  }
}

export async function customersInsight(_req, res, next) {
  try {
    const thisMonth = startOfMonth()
    const newThisMonth = await User.countDocuments({ role: 'customer', createdAt: { $gte: thisMonth } })
    const repeatCustomers = await User.countDocuments({ role: 'customer', orderCount: { $gt: 1 } })
    const guestOrders = await Order.countDocuments({ 'customer.isGuest': true })
    const regOrders = await Order.countDocuments({ user: { $ne: null } })
    const topCustomers = await User.find({ role: 'customer' })
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('firstName lastName phone orderCount totalSpent createdAt')
      .lean()

    res.json({
      success: true,
      data: {
        newThisMonth,
        repeatCustomers,
        guestVsRegistered: { guestOrders, registeredOrderHints: regOrders },
        topCustomers,
      },
    })
  } catch (e) {
    next(e)
  }
}
