import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../lib/axios'

const PERIOD = [
  { id: '7d', label: '7 j.' },
  { id: '30d', label: '30 j.' },
  { id: '90d', label: '3 mois' },
  { id: '12m', label: '12 mois' },
]

const STATUS_COLORS = {
  pending: '#f5c842',
  confirmed: '#378add',
  preparing: '#ef9f27',
  out_for_delivery: '#7f77dd',
  delivered: '#4a7c59',
  cancelled: '#e24b4a',
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const [sum, setSum] = useState(null)
  const [rev, setRev] = useState([])
  const [statusData, setStatusData] = useState([])
  const [topSold, setTopSold] = useState([])
  const [customers, setCustomers] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let c = false
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/revenue', { params: { period } }),
      api.get('/analytics/orders-by-status'),
      api.get('/analytics/top-products', { params: { limit: 10, period } }),
      api.get('/analytics/customers'),
    ])
      .then(([s, r, st, tp, cust]) => {
        if (!c) {
          setSum(s.data.data)
          setRev(r.data.data || [])
          setStatusData(st.data.data || [])
          setTopSold(tp.data.data || [])
          setCustomers(cust.data.data)
        }
      })
      .catch(() => !c && setErr(true))
    return () => {
      c = true
    }
  }, [period])

  if (err) return <p className="text-red-600">Impossible de charger les analytiques.</p>
  if (!sum || !customers) return <p className="text-[#6b7280]">Chargement…</p>

  const chartRev = rev.map((d) => ({
    ...d,
    label: d.date ? format(new Date(`${d.date}T12:00:00`), 'dd/MM', { locale: fr }) : '',
  }))

  const totalStatus = statusData.reduce((acc, x) => acc + x.count, 0) || 1
  const donut = statusData.map((x) => ({
    ...x,
    fill: STATUS_COLORS[x.status] || '#ccc',
    name: x.status,
  }))

  const barData = topSold.slice(0, 10).map((row) => ({
    name: (row.product?.name || '?').slice(0, 22),
    sold: row.sold,
    full: row.product?.name || '',
  }))

  const gv = customers.guestVsRegistered || {}

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">Analytiques</h1>
        <div className="flex gap-1 rounded-lg border border-[rgba(74,124,89,0.18)] bg-white p-1">
          {PERIOD.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                period === p.id ? 'bg-[#4a7c59] text-white' : 'text-[#6b7280] hover:bg-[#f4f6f3]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="CA total" val={`${Number(sum.totalRevenue || 0).toFixed(3)} TND`} />
        <Stat label="Commandes" val={String(sum.totalOrders ?? 0)} />
        <Stat label="Panier moyen" val={`${Number(sum.avgOrderValue || 0).toFixed(3)} TND`} />
        <Stat label="Nouveaux clients (mois)" val={String(customers.newThisMonth ?? 0)} />
        <Stat label="Récurrents" val={String(customers.repeatCustomers ?? 0)} />
        <Stat
          label="Invités vs enreg."
          val={`${gv.guestOrders ?? 0} / ${gv.registeredOrderHints ?? 0}`}
        />
      </div>

      <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#374151]">Revenus & commandes ({period})</h2>
        <div className="mt-4 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRev} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, key) =>
                  key === 'revenue' ? [`${Number(v).toFixed(3)} TND`, 'CA'] : [v, 'Commandes']
                }
              />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="revenue" name="CA" stroke="#2d5a3d" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="orderCount" name="Commandes" stroke="#c9a227" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#374151]">Top produits vendus ({period})</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${v} unités`, 'Ventes']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.full || ''}
                />
                <Bar dataKey="sold" name="Quantité" radius={[0, 4, 4, 0]} fill="#c9a227" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#374151]">Répartition statuts</h2>
          <div className="flex h-[300px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {donut.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {donut.map((x) => (
              <li key={x.status} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: x.fill }} />
                {x.status}: {x.count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#374151]">Top clients (dépenses)</h2>
        <div className="admin-table-wrap">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-[#9ca3af]">
              <tr>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Téléphone</th>
                <th className="py-2 pr-4">Commandes</th>
                <th className="py-2">Total dépensé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(74,124,89,0.06)]">
              {(customers.topCustomers || []).map((u) => (
                <tr key={u._id}>
                  <td className="py-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3 text-[#6b7280]">{u.phone}</td>
                  <td className="py-3">{u.orderCount}</td>
                  <td className="py-3 font-medium">{Number(u.totalSpent || 0).toFixed(3)} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, val }) {
  return (
    <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#9ca3af]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#2d5a3d]">{val}</p>
    </div>
  )
}
