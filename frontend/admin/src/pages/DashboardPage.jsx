import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../lib/axios'

const STATUS_COL = {
  pending: '#f5c842',
  confirmed: '#378add',
  preparing: '#ef9f27',
  out_for_delivery: '#7f77dd',
  delivered: '#4a7c59',
  cancelled: '#e24b4a',
}

export default function DashboardPage() {
  const [sum, setSum] = useState(null)
  const [cust, setCust] = useState(null)
  const [rev, setRev] = useState([])
  const [statusRows, setStatusRows] = useState([])
  const [err, setErr] = useState(false)

  useEffect(() => {
    let c = false
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/customers'),
      api.get('/analytics/revenue', { params: { period: '30d' } }),
      api.get('/analytics/orders-by-status'),
    ])
      .then(([a, b, r, s]) => {
        if (!c) {
          setSum(a.data.data)
          setCust(b.data.data)
          setRev(r.data.data || [])
          setStatusRows(s.data.data || [])
        }
      })
      .catch(() => !c && setErr(true))
    return () => {
      c = true
    }
  }, [])

  if (err) return <p className="text-red-600">Impossible de charger le tableau de bord.</p>
  if (!sum) return <p className="text-[#6b7280]">Chargement…</p>

  const revChange =
    sum.revenueLastMonth > 0
      ? Math.round(((sum.revenueThisMonth - sum.revenueLastMonth) / sum.revenueLastMonth) * 100)
      : 0

  const chartData = rev.map((d) => ({
    ...d,
    label: d.date ? format(new Date(d.date), 'dd MMM', { locale: fr }) : '',
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[#2d5a3d]">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon="💰"
          title="CA (ce mois)"
          value={`${Number(sum.revenueThisMonth || 0).toFixed(3)} TND`}
          sub={revChange >= 0 ? `↑ ${revChange}% vs mois dernier` : `↓ ${Math.abs(revChange)}%`}
          positive={revChange >= 0}
        />
        <Stat
          icon="📦"
          title="Commandes (mois)"
          value={String(sum.ordersThisMonth)}
          sub={`Total : ${sum.totalOrders}`}
        />
        <Link
          to="/orders?status=pending"
          className="block rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm transition hover:border-[#4a7c59]"
        >
          <Stat icon="⏳" title="En attente" value={String(sum.pendingOrders)} sub="Voir →" naked />
        </Link>
        <Stat
          icon="👥"
          title="Nouveaux clients"
          value={String(cust?.newThisMonth ?? '—')}
          sub="Ce mois"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#374151]">Revenus (30 jours)</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v, name) =>
                    name === 'revenue' ? [`${Number(v).toFixed(3)} TND`, 'CA'] : [v, 'Commandes']
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="CA"
                  stroke="#2d5a3d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  name="Commandes"
                  stroke="#c9a227"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-[#374151]">Commandes par statut</h2>
          <ul className="space-y-2">
            {statusRows.map((row) => (
              <li key={row.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: STATUS_COL[row.status] || '#999' }}
                  />
                  <span className="capitalize text-[#374151]">{row.status}</span>
                </span>
                <span className="font-medium text-[#111827]">
                  {row.count}{' '}
                  <span className="text-[#9ca3af]">({row.percentage}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#374151]">Dernières commandes</h2>
            <Link to="/orders" className="text-xs text-[#4a7c59] underline">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-[rgba(74,124,89,0.08)]">
            {(sum.recentOrders || []).map((o) => (
              <li key={o._id || o.orderNumber} className="flex justify-between py-3 text-sm">
                <Link to={`/orders/${o._id}`} className="font-medium text-[#4a7c59] underline">
                  {o.orderNumber}
                </Link>
                <span className="text-[#6b7280]">{o.customer?.fullName}</span>
                <span>{Number(o.total || 0).toFixed(3)} TND</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#374151]">Top produits</h2>
          <ul className="space-y-3">
            {(sum.topProducts || []).map((p, i) => (
              <li key={p._id || p.name} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-[#9ca3af]">{i + 1}</span>
                <span className="text-xl">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[#c9a227]"
                      style={{
                        width: `${Math.min(100, (p.orderCount / (sum.topProducts[0]?.orderCount || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[#6b7280]">{p.orderCount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, title, value, sub, positive, naked }) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(74,124,89,0.12)] text-lg">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#6b7280]">{title}</p>
          <p className="text-xl font-semibold text-[#111827]">{value}</p>
          {sub && (
            <p className={`text-xs ${positive === false ? 'text-red-500' : positive ? 'text-[#4a7c59]' : 'text-[#9ca3af]'}`}>
              {sub}
            </p>
          )}
        </div>
      </div>
    </>
  )
  if (naked) return inner
  return <div className="rounded-xl border border-[rgba(74,124,89,0.14)] bg-white p-4 shadow-sm">{inner}</div>
}
