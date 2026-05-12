import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/axios'

const STATUS_LABEL = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

function waHref(phone, text) {
  const d = String(phone || '').replace(/\D/g, '')
  if (!d) return ''
  const p = encodeURIComponent(text || '')
  return `https://wa.me/${d}${p ? `?text=${p}` : ''}`
}

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Client introuvable'))
  }, [id])

  if (!data?.user)
    return <p className="text-[#6b7280]">{data === null ? 'Chargement…' : 'Introuvable'}</p>

  const u = data.user
  const orders = data.orders || []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/customers" className="text-sm text-[#4a7c59] underline">
          ← Clients
        </Link>
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">
          {u.firstName} {u.lastName}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#374151]">Profil</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[#9ca3af]">Email</dt>
              <dd>{u.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[#9ca3af]">Téléphone</dt>
              <dd>
                {u.phone}
                {waHref(u.phone) ? (
                  <a
                    href={waHref(u.phone, '')}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-[#128C7E] underline"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[#9ca3af]">Adresse</dt>
              <dd>
                {u.address?.street}
                <br />
                {[u.address?.city, u.address?.region, u.address?.country].filter(Boolean).join(', ')}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[#9ca3af]">Stats</dt>
              <dd>
                {u.orderCount ?? 0} commandes · {(u.totalSpent ?? 0).toFixed(3)} TND
              </dd>
            </div>
          </dl>
          <Link
            to={`/orders?search=${encodeURIComponent(u.phone || u.email)}`}
            className="mt-6 inline-block text-sm text-[#4a7c59] underline"
          >
            Voir les commandes filtrées →
          </Link>
        </div>

        <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase text-[#9ca3af]">Synthèse</p>
          <p className="mt-4 text-2xl font-semibold text-[#2d5a3d]">{orders.length}</p>
          <p className="text-sm text-[#6b7280]">commandes dans l’historique</p>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#374151]">Commandes</h2>
        <div className="admin-table-wrap mt-4">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-[#9ca3af]">
              <tr>
                <th className="py-2 pr-4">N°</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(74,124,89,0.06)]">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="py-3 font-medium text-[#4a7c59]">{o.orderNumber}</td>
                  <td className="py-3 text-[#6b7280]">
                    {o.createdAt
                      ? format(new Date(o.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })
                      : ''}
                  </td>
                  <td className="py-3 font-medium">{Number(o.total || 0).toFixed(3)} TND</td>
                  <td className="py-3 text-xs">{STATUS_LABEL[o.status] || o.status}</td>
                  <td className="py-3">
                    <Link to={`/orders/${o._id}`} className="underline">
                      Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
