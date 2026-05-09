import { Router } from 'express'
import * as analytics from '../controllers/analytics.controller.js'
import { adminOnly } from '../middleware/adminOnly.middleware.js'

const r = Router()

r.use(adminOnly)
r.get('/summary', analytics.summary)
r.get('/revenue', analytics.revenue)
r.get('/orders-by-status', analytics.ordersByStatus)
r.get('/top-products', analytics.topProducts)
r.get('/customers', analytics.customersInsight)

export default r
