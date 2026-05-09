import { api } from '../lib/axios'

export async function createOrder(body) {
  const { data } = await api.post('/orders', body)
  return data.data.order
}

export async function trackOrder(orderNumber) {
  const { data } = await api.get(`/orders/track/${orderNumber}`)
  return data.data
}

export async function getMyOrders(params) {
  const { data } = await api.get('/orders/my', { params })
  return data.data
}
