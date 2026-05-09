import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'
import { api } from '../lib/axios'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [availOnly, setAvailOnly] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([api.get('/admin/products'), api.get('/admin/categories')])
      setProducts(pRes.data.data || [])
      setCategories(cRes.data.data || [])
    } catch {
      toast.error('Chargement produits impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = products
    if (availOnly) list = list.filter((x) => x.isAvailable)
    if (catFilter) list = list.filter((x) => (x.category?._id || x.category) === catFilter)
    const q = search.trim().toLowerCase()
    if (q)
      list = list.filter(
        (x) =>
          x.name?.toLowerCase().includes(q) ||
          x.slug?.toLowerCase().includes(q) ||
          (x.category?.name && x.category.name.toLowerCase().includes(q)),
      )
    return list
  }, [products, search, catFilter, availOnly])

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/products/${id}/toggle`)
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, ...data.data } : p)))
    } catch {
      toast.error('Erreur bascule disponibilité')
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setBusy(true)
    try {
      await api.delete(`/admin/products/${deleteId}`)
      toast.success('Produit désactivé')
      setProducts((prev) => prev.filter((p) => p._id !== deleteId))
      setDeleteId(null)
    } catch {
      toast.error('Erreur')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-[#6b7280]">Chargement…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">Produits ({filtered.length})</h1>
        <Link
          to="/products/new"
          className="rounded-full bg-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#2d2810] hover:opacity-95"
        >
          + Ajouter un produit
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-4 shadow-sm">
        <input
          type="search"
          placeholder="Rechercher nom, slug…"
          className="min-w-[200px] flex-1 rounded-lg border border-[rgba(74,124,89,0.2)] px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-[rgba(74,124,89,0.2)] px-3 py-2 text-sm"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[#374151]">
          <input type="checkbox" checked={availOnly} onChange={(e) => setAvailOnly(e.target.checked)} />
          Disponibles seulement
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[rgba(74,124,89,0.12)] bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[rgba(74,124,89,0.1)] bg-[#f9faf9] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Ventes</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(74,124,89,0.06)]">
            {filtered.map((p, idx) => (
              <tr key={p._id} className="hover:bg-[#fafdfb]">
                <td className="px-4 py-3 text-[#9ca3af]">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: p.bgColor || '#FAF8F2' }}
                    >
                      {p.emoji || '🌿'}
                    </div>
                    <div className="min-w-0">
                      <Link
                        className="font-medium text-[#4a7c59] underline"
                        to={`/products/${p._id}`}
                      >
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-[#9ca3af]">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#f4f6f3] px-2 py-0.5 text-xs">{p.category?.name || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{Number(p.price).toFixed(3)} TND</span>
                  {p.comparePrice ? (
                    <span className="ml-2 text-xs text-[#9ca3af] line-through">{Number(p.comparePrice).toFixed(3)}</span>
                  ) : null}
                </td>
                <td className={`px-4 py-3 font-medium ${p.stock != null && p.stock < 5 ? 'text-red-600' : ''}`}>{p.stock}</td>
                <td className="px-4 py-3">{p.orderCount ?? 0}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    aria-label={p.isAvailable ? 'Désactiver' : 'Activer'}
                    className={`relative h-7 w-12 rounded-full transition ${p.isAvailable ? 'bg-[#4a7c59]' : 'bg-[#d1d5db]'}`}
                    onClick={() => toggle(p._id)}
                  >
                    <span
                      className={`absolute left-1 top-1 block h-5 w-5 rounded-full bg-white shadow transition ${
                        p.isAvailable ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link to={`/products/${p._id}`} className="text-[#4a7c59] underline">
                    Modifier
                  </Link>
                  <button
                    type="button"
                    className="ml-3 text-xs text-red-600 hover:underline"
                    onClick={() => setDeleteId(p._id)}
                  >
                    Désactiver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Désactiver ce produit ?"
        description="Le produit ne sera plus visible sur la boutique. Vous pourrez le réactiver plus tard depuis l’édition."
        confirmLabel="Désactiver"
        danger
        busy={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
