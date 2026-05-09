import { api } from '../lib/axios'

export function mapProduct(p) {
  if (!p) return null
  const catSlug = typeof p.category === 'object' && p.category ? p.category.slug : p.category
  const priceNum = Number(p.price)
  return {
    ...p,
    id: p._id,
    slug: p.slug,
    priceNum,
    price: Number.isFinite(priceNum) ? priceNum.toFixed(3) : '0.000',
    category: catSlug,
    tags: Array.isArray(p.tags) ? p.tags : [],
    rating: p.rating ?? 0,
    reviews: p.reviewCount ?? 0,
    desc: p.description,
    descLong: p.descriptionLong || p.description,
    bgColor: p.bgColor || '#FAF8F2',
    emoji: p.emoji || '🌿',
    weight: p.weight || '',
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
  }
}

export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return {
    ...data.data,
    products: (data.data.products || []).map(mapProduct),
  }
}

export async function getCategories() {
  const { data } = await api.get('/products/categories/all')
  return data.data || []
}

export async function getProduct(slug) {
  const { data } = await api.get(`/products/${slug}`)
  return mapProduct(data.data)
}
