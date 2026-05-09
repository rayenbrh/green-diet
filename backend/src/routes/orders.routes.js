import { Router } from 'express'
import * as orders from '../controllers/orders.controller.js'
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js'
import { orderLimiter } from '../middleware/rateLimiter.middleware.js'

const r = Router()

r.post('/', orderLimiter, optionalAuth, orders.createOrder)
r.get('/track/:orderNumber', orders.trackOrder)
r.get('/my', requireAuth, orders.myOrders)

export default r
