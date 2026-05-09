import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

export async function listCategories(_req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
    res.json({ success: true, data: categories })
  } catch (e) {
    next(e)
  }
}

export async function listProducts(req, res, next) {
  try {
    const {
      category,
      search,
      sort = 'popular',
      featured,
      limit = 24,
      page = 1,
    } = req.query
    const filter = { isAvailable: true }
    if (featured === 'true') filter.isFeatured = true
    if (category) {
      const cat = await Category.findOne({ slug: category, isActive: true })
      if (cat) filter.category = cat._id
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ]
    }
    const skip = (Number(page) - 1) * Number(limit)
    let q = Product.find(filter).populate('category', 'name slug emoji').lean()
    if (sort === 'price_asc') q = q.sort({ price: 1 })
    else if (sort === 'price_desc') q = q.sort({ price: -1 })
    else if (sort === 'newest') q = q.sort({ createdAt: -1 })
    else q = q.sort({ orderCount: -1, rating: -1 })
    const [products, total] = await Promise.all([q.skip(skip).limit(Number(limit)), Product.countDocuments(filter)])
    res.json({
      success: true,
      data: {
        products,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const p = await Product.findOneAndUpdate(
      { slug: req.params.slug, isAvailable: true },
      { $inc: { viewCount: 1 } },
      { new: true },
    )
      .populate('category', 'name slug emoji')
      .lean()
    if (!p) return res.status(404).json({ success: false, message: 'Produit introuvable' })
    res.json({ success: true, data: p })
  } catch (e) {
    next(e)
  }
}
