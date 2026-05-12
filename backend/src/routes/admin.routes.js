import { Router } from 'express'
import * as admin from '../controllers/admin.controller.js'
import { adminOnly } from '../middleware/adminOnly.middleware.js'
import { upload } from '../utils/upload.utils.js'

const r = Router()
r.use(adminOnly)

function maybeMultipart(req, res, next) {
  const ct = req.headers['content-type'] || ''
  if (ct.includes('multipart/form-data')) {
    return upload.array('images', 4)(req, res, next)
  }
  next()
}

r.get('/cleanup-uploads', admin.runCleanupUploads)
r.get('/products', admin.listAdminProducts)
r.get('/products/:id', admin.getAdminProduct)
r.post('/products', maybeMultipart, admin.createProduct)
r.patch('/products/:id', maybeMultipart, admin.patchProduct)
r.delete('/products/:id', admin.deleteProduct)
r.patch('/products/:id/toggle', admin.toggleProduct)

r.get('/categories', admin.listAdminCategories)
r.post('/categories', admin.createCategory)
r.patch('/categories/:id', admin.patchCategory)
r.delete('/categories/:id', admin.deleteCategory)
r.patch('/categories/reorder', admin.reorderCategories)

r.get('/orders', admin.listAdminOrders)
r.get('/orders/export/csv', admin.exportOrdersCsv)
r.get('/orders/:id', admin.getAdminOrder)
r.patch('/orders/:id/status', admin.patchOrderStatus)
r.patch('/orders/:id/notes', admin.patchOrderNotes)

r.get('/users', admin.listUsers)
r.get('/users/:id', admin.getUser)
r.patch('/users/:id/role', admin.patchUserRole)

export default r
