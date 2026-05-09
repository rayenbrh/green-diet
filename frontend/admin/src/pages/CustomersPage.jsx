import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/axios'

function waHref(phone) {
  const d = String(phone || '').replace(/\D/g, '')
  if (!d) return ''
  return `https://wa.me/${d}`
}

export default function CustomersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit, search: q || undefined } })
      setUsers(data.data.users || [])
      setTotal(data.data.total || 0)
    } catch {
      toast.error('Chargement clients impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, q])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#2d5a3d]">Clients</h1>

      <form
        className="flex flex-wrap gap-2 rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          setQ(search.trim())
        }}
      >
        <input
          type="search"
          placeholder="Nom, email, téléphone…"
          className="min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-[#2d5a3d] px-4 py-2 text-sm text-white">
          Rechercher
        </button>
      </form>

      {loading ? (
        <p className="text-[#6b7280]">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(74,124,89,0.12)] bg-white shadow-sm">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[rgba(74,124,89,0.1)] bg-[#f9faf9] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Inscrit</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(74,124,89,0.06)]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-[#fafdfb]">
                  <td className="px-4 py-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">{u.email}</td>
                  <td className="px-4 py-3">{u.phone}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-[#6b7280]">
                    {u.address?.street}, {u.address?.city}
                  </td>
                  <td className="px-4 py-3">{u.orderCount ?? 0}</td>
                  <td className="px-4 py-3 font-medium">{Number(u.totalSpent || 0).toFixed(3)} TND</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#9ca3af]">
                    {u.createdAt
                      ? format(new Date(u.createdAt), 'dd MMM yyyy', { locale: fr })
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link className="text-[#4a7c59] underline" to={`/customers/${u._id}`}>
                      Voir
                    </Link>
                    {waHref(u.phone) ? (
                      <a
                        href={waHref(u.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs font-medium text-[#128C7E] underline"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#6b7280]">
        <span>
          {total} client(s) — page {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => p - 1)}
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
