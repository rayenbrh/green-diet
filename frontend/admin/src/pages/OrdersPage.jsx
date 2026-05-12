import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/axios'

const LABEL = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const FILTERS = [
  { key: '', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'out_for_delivery', label: 'En livraison' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
]

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const [search, setSearch] = useState(() => params.get('search') || '')
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    let c = false
    api
      .get('/admin/orders', { params: { status: status || undefined, search: search || undefined, page, limit } })
      .then((res) => {
        if (!c) {
          setOrders(res.data.data.orders || [])
          setTotal(res.data.data.total || 0)
        }
      })
      .catch(() => !c && setOrders([]))
    return () => {
      c = true
    }
  }, [status, page, search])

  useEffect(() => {
    const qs = params.get('search') ?? ''
    setSearch(qs)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL → champ au chargement / navigation
  }, [params.toString()])

  const exportCsv = async () => {
    try {
      const res = await api.get('/admin/orders/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `commandes-green-diet.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      /* noop */
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">Commandes</h1>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-[rgba(74,124,89,0.35)] px-4 py-2 text-sm font-medium text-[#4a7c59]"
        >
          Exporter CSV
        </button>
      </div>

      <div className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-3 shadow-sm">
        <input
          type="search"
          placeholder="N°, nom, téléphone…"
          className="min-w-[200px] flex-1 rounded-lg border border-[rgba(74,124,89,0.2)] px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = e.currentTarget.value.trim()
              setSearch(v)
              setPage(1)
              const p = new URLSearchParams(params)
              if (v) p.set('search', v)
              else p.delete('search')
              setParams(p)
            }
          }}
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key || 'all'}
              type="button"
              onClick={() => {
                setPage(1)
                const p = new URLSearchParams()
                if (f.key) p.set('status', f.key)
                if (search) p.set('search', search)
                setParams(p)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                (f.key === '' && !status) || f.key === status
                  ? 'bg-[#4a7c59] text-white'
                  : 'bg-[#f4f6f3] text-[#374151]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap rounded-xl border border-[rgba(74,124,89,0.12)] bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[rgba(74,124,89,0.1)] bg-[#f9faf9] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(74,124,89,0.08)]">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-[#fafdfb]">
                <td className="px-4 py-3">
                  <Link className="font-medium text-[#4a7c59] underline" to={`/orders/${o._id}`}>
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]">
                  {o.createdAt
                    ? format(new Date(o.createdAt), 'd MMM yyyy, HH:mm', { locale: fr })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer?.fullName}</div>
                  <div className="text-xs text-[#6b7280]">{o.customer?.phone}</div>
                </td>
                <td className="px-4 py-3 font-medium">{Number(o.total).toFixed(3)} TND</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#f4f6f3] px-2 py-0.5 text-xs">
                    {LABEL[o.status] || o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/orders/${o._id}`} className="text-[#4a7c59] underline">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-[#6b7280]">
          Page {page} / {totalPages} — {total} commande(s)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
