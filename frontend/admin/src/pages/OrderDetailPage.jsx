import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/axios'

const STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

const LABEL = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [nextStatus, setNextStatus] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    api.get(`/admin/orders/${id}`).then((res) => {
      const o = res.data.data
      setOrder(o)
      setWhatsappUrl(o.whatsappUrl || '')
      setNotes(o.adminNotes || '')
      setNextStatus(o.status || '')
    })
  }

  useEffect(() => {
    load()
  }, [id])

  const updateStatus = async () => {
    if (!order || nextStatus === order.status) return
    setBusy(true)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: nextStatus, note })
      toast.success('Statut mis à jour')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  const saveNotes = async () => {
    try {
      await api.patch(`/admin/orders/${id}/notes`, { adminNotes: notes })
      toast.success('Notes enregistrées')
    } catch {
      toast.error('Erreur notes')
    }
  }

  if (!order) return <p className="text-[#6b7280]">Chargement…</p>

  const phoneDigits = String(order.customer?.phone || '').replace(/\D/g, '')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/orders" className="text-sm text-[#4a7c59] underline">
          ← Commandes
        </Link>
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">{order.orderNumber}</h1>
        <span className="rounded-full bg-[#f4f6f3] px-3 py-1 text-xs">{LABEL[order.status]}</span>
        <span className="text-sm text-[#6b7280]">
          {order.createdAt
            ? format(new Date(order.createdAt), 'd MMMM yyyy HH:mm', { locale: fr })
            : ''}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#374151]">Articles</h2>
            <div className="admin-table-wrap mt-4">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[rgba(74,124,89,0.08)]">
                {(order.items || []).map((it, i) => (
                  <tr key={i}>
                    <td className="py-2">
                      {it.productEmoji} {it.productName}
                    </td>
                    <td className="py-2 text-right">{Number(it.price).toFixed(3)} TND</td>
                    <td className="py-2 text-center">×{it.quantity}</td>
                    <td className="py-2 text-right font-medium">
                      {(Number(it.subtotal ?? it.price * it.quantity)).toFixed(3)} TND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-4 space-y-1 border-t border-[rgba(74,124,89,0.1)] pt-4 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{Number(order.subtotal).toFixed(3)} TND</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Livraison</span>
                <span>{Number(order.deliveryFee || 0).toFixed(3)} TND</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{Number(order.total).toFixed(3)} TND</span>
              </div>
            </div>
            <p className="mt-4 rounded-full bg-[#fdfcf8] px-3 py-2 text-center text-sm">
              Espèces à la livraison 💵
            </p>
          </section>

          <section className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#374151]">Historique</h2>
            <ul className="mt-4 space-y-3 border-l-2 border-[rgba(74,124,89,0.15)] pl-4">
              {(order.statusHistory || []).map((h, i) => (
                <li key={i}>
                  <p className="text-sm font-medium">{LABEL[h.status] || h.status}</p>
                  <p className="text-xs text-[#6b7280]">
                    {h.changedAt
                      ? format(new Date(h.changedAt), 'd MMM yyyy HH:mm', { locale: fr })
                      : ''}
                    {h.note ? ` · ${h.note}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#374151]">Client</h2>
            <p className="mt-2 font-medium">{order.customer?.fullName}</p>
            {phoneDigits ? (
              <a href={`tel:${order.customer.phone}`} className="text-sm text-[#4a7c59] underline">
                {order.customer.phone}
              </a>
            ) : null}
            <p className="mt-3 text-sm text-[#374151]">
              {order.customer?.address?.street}
              <br />
              {order.customer?.address?.city} {order.customer?.address?.region}
            </p>
            {order.customer?.comments && (
              <p className="mt-3 text-sm text-[#6b7280]">Note client : {order.customer.comments}</p>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block w-full rounded-full border border-[#25D366] py-2.5 text-center text-sm font-medium text-[#128C7E]"
              >
                💬 Contacter le client sur WhatsApp
              </a>
            )}
            {(() => {
              const uid =
                typeof order.user === 'object' && order.user != null ? order.user._id : order.user
              return uid ? (
                <Link to={`/customers/${uid}`} className="mt-2 block text-xs text-[#4a7c59] underline">
                  Voir le profil client →
                </Link>
              ) : null
            })()}
          </section>

          <section className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#374151]">Mettre à jour le statut</h2>
            <select
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABEL[s]}
                </option>
              ))}
            </select>
            <textarea
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              rows={2}
              placeholder="Note interne (optionnel)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={updateStatus}
              className="mt-3 w-full rounded-full bg-[#2d5a3d] py-2.5 text-sm text-white disabled:opacity-50"
            >
              {busy ? '…' : 'Mettre à jour'}
            </button>
          </section>

          <section className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#374151]">Notes administrateur</h2>
            <textarea
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onBlur={saveNotes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="mt-1 text-xs text-[#9ca3af]">Enregistré automatiquement à la sortie du champ.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
