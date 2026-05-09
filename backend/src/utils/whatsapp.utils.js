import twilio from 'twilio'
import { env } from '../config/env.js'

export function buildNewOrderMessage(order) {
  const items = order.items
    .map((i) => `${i.productName} ×${i.quantity}`)
    .join(', ')
  const msg = `🛒 Nouvelle commande *${order.orderNumber}*\nClient: ${order.customer.fullName}\nTéléphone: ${order.customer.phone}\nTotal: ${order.total.toFixed(3)} TND\nProduits: ${items}\nAdresse: ${order.customer.address.street}, ${order.customer.address.city}${
    order.customer.comments ? `\nNote: ${order.customer.comments}` : ''
  }`
  return msg
}

export function buildWhatsAppUrl(phoneDigits, message) {
  const p = phoneDigits.replace(/\D/g, '')
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`
}

export async function notifyAdminNewOrder(order) {
  const msg = buildNewOrderMessage(order)
  const fallbackUrl = buildWhatsAppUrl(env.WHATSAPP_PHONE, msg)
  console.log('[WhatsApp fallback URL]', fallbackUrl)

  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM && env.WHATSAPP_PHONE) {
    try {
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        from: env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${env.WHATSAPP_PHONE}`,
        body: msg,
      })
      return { sent: true, url: fallbackUrl }
    } catch (e) {
      console.warn('Twilio WhatsApp error:', e.message)
    }
  }
  return { sent: false, url: fallbackUrl }
}
