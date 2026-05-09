import { Router } from 'express'
import * as products from '../controllers/products.controller.js'

const r = Router()

r.get('/categories/all', products.listCategories)
r.get('/', products.listProducts)
r.get('/:slug', products.getProductBySlug)

export default r
