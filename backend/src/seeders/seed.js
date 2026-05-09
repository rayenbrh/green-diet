import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greendiet'

const CATS = [
  { name: 'Pâtes', slug: 'pates', nameAr: 'معكرونة', emoji: '🍝', order: 1 },
  { name: 'Pains & Brioches', slug: 'pains', nameAr: 'خبز', emoji: '🍞', order: 2 },
  { name: 'Farines', slug: 'farines', nameAr: 'دقيق', emoji: '🌾', order: 3 },
  { name: 'Biscuits', slug: 'biscuits', nameAr: 'بسكويت', emoji: '🍪', order: 4 },
  { name: 'Épicerie Bio', slug: 'epicerie', nameAr: 'أغذية', emoji: '🫙', order: 5 },
]

function slugify(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const RAW = [
  ['Pâtes de Riz', 'pates', 'معكرونة الأرز', '🍝', '#FFF5E0', '500g', 9.5, 'Pâtes de riz complètes, texture al dente.', true, false, 4.8, 54],
  ['Pâtes de Maïs', 'pates', 'معكرونة الذرة', '🌽', '#FFFACD', '500g', 8.5, 'Couleur dorée, goût doux du maïs.', false, false, 4.5, 31],
  ['Vermicelles de Riz', 'pates', 'شعيرية الأرز', '🍜', '#FFF0DC', '400g', 8.0, 'Fins vermicelles pour soupes et woks.', false, false, 4.6, 42],
  ['Fusilli Sans Gluten', 'pates', 'فوسيلي', '🍝', '#FFF5E0', '400g', 10.5, 'Spirales qui accrochent la sauce.', false, true, 4.9, 87],
  ['Pain de Mie', 'pains', 'خبز التوست', '🍞', '#E8F4E8', '400g', 12.0, 'Mie moelleuse, croûte dorée.', false, true, 4.7, 76],
  ['Pain Baguette', 'pains', 'باغيت', '🥖', '#F5EFE0', '250g', 9.0, 'Croûte fine, arôme de levain.', false, false, 4.4, 28],
  ['Brioche Nature', 'pains', 'بريوش', '🥐', '#FFF8DC', '350g', 15.0, 'Douceur beurrée, fil brioché.', true, false, 4.9, 41],
  ['Petits Pains Ronds', 'pains', 'خبز صغير', '🫓', '#F0EEE8', '6pcs', 11.0, 'Six pains burger maison.', false, false, 4.5, 22],
  ['Farine de Sarrasin', 'farines', 'دقيق الحنطة السوداء', '🌾', '#F0EAD6', '1kg', 7.5, 'Goût noisette, galettes et crêpes.', false, false, 4.6, 36],
  ['Farine de Riz', 'farines', 'دقيق الأرز', '🌾', '#F5F5DC', '1kg', 6.5, 'Base polyvalente sans gluten.', false, false, 4.3, 19],
  ['Mix Pâtisserie', 'farines', 'خليط الحلويات', '🧁', '#FFF0F5', '500g', 9.0, 'Gâteaux légers, muffins, cookies.', true, false, 4.8, 48],
  ['Farine de Pois Chiche', 'farines', 'دقيق الحمص', '🟡', '#FAF0DC', '500g', 7.0, 'Onctuosité pour soccas et crêpes.', false, false, 4.4, 27],
  ['Biscuits Avoine', 'biscuits', 'بسكويت الشوفان', '🍪', '#FAF0E6', '200g', 6.0, 'Croustillants, notes caramélisées.', false, false, 4.5, 33],
  ['Cookies Chocolat', 'biscuits', 'كوكيز', '🍫', '#FFF0E0', '150g', 8.5, 'Pépites fondantes, cœur moelleux.', false, true, 4.9, 72],
  ['Granola Bio', 'epicerie', 'جرانولا', '🫙', '#FFFACD', '400g', 14.0, 'Flocons toastés, fruits secs.', false, false, 4.7, 39],
  ["Flocons d'Avoine", 'epicerie', 'رقائق الشوفان', '🌾', '#F5F0E8', '500g', 5.5, 'Texture crémeuse porridge.', false, false, 4.2, 12],
]

async function run() {
  await mongoose.connect(MONGODB_URI)
  await Product.deleteMany({})
  await Category.deleteMany({})
  const cats = await Category.insertMany(CATS)
  const map = Object.fromEntries(cats.map((c) => [c.slug, c._id]))

  const products = RAW.map(
    ([name, catSlug, nameAr, emoji, bgColor, weight, price, short, isNew, isBestSeller, rating, reviewCount]) => ({
      name,
      slug: slugify(name),
      nameAr,
      category: map[catSlug],
      description: short,
      descriptionLong:
        `${short} Produit sélectionné par Green Diet à Sfax, bio et sans gluten, pour votre bien-être au quotidien.`,
      price,
      weight,
      emoji,
      bgColor,
      tags: ['Sans Gluten', 'Bio'],
      isNew,
      isBestSeller,
      rating,
      reviewCount,
      isAvailable: true,
      stock: 500,
      isFeatured: isBestSeller,
    }),
  )
  await Product.insertMany(products)

  const exists = await User.findOne({ email: 'admin@greendiet.tn' })
  if (!exists) {
    await User.create({
      firstName: 'Admin',
      lastName: 'Green Diet',
      email: 'admin@greendiet.tn',
      phone: '+21600000001',
      password: 'Admin@2025!',
      role: 'admin',
      address: { street: 'Sfax', city: 'Sfax', region: 'Sfax', country: 'Tunisie' },
    })
  }

  console.log('✅ Seeding complete. Admin: admin@greendiet.tn / Admin@2025!')
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
