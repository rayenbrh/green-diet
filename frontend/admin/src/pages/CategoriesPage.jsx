import { useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'
import { api } from '../lib/axios'

function SortRow({ cat, productCount, onToggle, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat._id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-[rgba(74,124,89,0.1)] bg-white px-4 py-3 shadow-sm"
    >
      <button type="button" className="cursor-grab touch-none text-[#9ca3af]" {...attributes} {...listeners} aria-label="Glisser">
        ⋮⋮
      </button>
      <span className="text-2xl">{cat.emoji || '🏷️'}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#111827]">{cat.name}</p>
        <p className="text-xs text-[#9ca3af]">{cat.slug}</p>
      </div>
      <span className="rounded-full bg-[#f4f6f3] px-2 py-0.5 text-xs">{productCount} prod.</span>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={cat.isActive !== false} onChange={() => onToggle(cat)} />
        Actif
      </label>
      <button type="button" className="text-sm text-[#4a7c59] underline" onClick={() => onEdit(cat)}>
        Modifier
      </button>
    </div>
  )
}

export default function CategoriesPage() {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [draft, setDraft] = useState({ name: '', emoji: '', nameAr: '' })
  const [editingId, setEditingId] = useState(null)
  const [delId, setDelId] = useState(null)
  const [busy, setBusy] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const load = async () => {
    setLoading(true)
    try {
      const [cr, pr] = await Promise.all([api.get('/admin/categories'), api.get('/admin/products')])
      setItems((cr.data.data || []).sort((a, b) => (a.order || 0) - (b.order || 0)))
      setProducts(pr.data.data || [])
    } catch {
      toast.error('Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const countByCat = (catId) =>
    products.filter((p) => (p.category?._id || p.category)?.toString() === catId).length

  const saveOrder = async (nextItems) => {
    setSavingOrder(true)
    const pairs = nextItems.map((c, i) => ({ id: c._id, order: i }))
    try {
      await api.patch('/admin/categories/reorder', pairs)
      toast.success('Ordre enregistré')
    } catch {
      toast.error('Erreur ordre')
      load()
    } finally {
      setSavingOrder(false)
    }
  }

  const onDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((x) => x._id === active.id)
    const newIdx = items.findIndex((x) => x._id === over.id)
    const next = arrayMove(items, oldIdx, newIdx)
    setItems(next)
    saveOrder(next)
  }

  const createCat = async (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return toast.error('Nom requis')
    try {
      const { data } = await api.post('/admin/categories', {
        name: draft.name.trim(),
        emoji: draft.emoji?.trim() || '🏷️',
        nameAr: draft.nameAr?.trim(),
        order: items.length,
        isActive: true,
      })
      setItems((prev) => [...prev, data.data].sort((a, b) => (a.order || 0) - (b.order || 0)))
      setDraft({ name: '', emoji: '', nameAr: '' })
      toast.success('Catégorie créée')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const toggleActive = async (cat) => {
    try {
      const { data } = await api.patch(`/admin/categories/${cat._id}`, { isActive: cat.isActive === false })
      setItems((prev) => prev.map((c) => (c._id === cat._id ? data.data : c)))
    } catch {
      toast.error('Erreur')
    }
  }

  const openEdit = (cat) => {
    setEditingId(cat._id)
    setDraft({ name: cat.name, emoji: cat.emoji || '', nameAr: cat.nameAr || '' })
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editingId) return
    try {
      const { data } = await api.patch(`/admin/categories/${editingId}`, {
        name: draft.name.trim(),
        emoji: draft.emoji?.trim(),
        nameAr: draft.nameAr?.trim(),
      })
      setItems((prev) => prev.map((c) => (c._id === editingId ? data.data : c)))
      setEditingId(null)
      setDraft({ name: '', emoji: '', nameAr: '' })
      toast.success('Mis à jour')
    } catch {
      toast.error('Erreur')
    }
  }

  const deleteCat = async () => {
    if (!delId) return
    setBusy(true)
    try {
      await api.delete(`/admin/categories/${delId}`)
      setItems((prev) => prev.filter((c) => c._id !== delId))
      if (editingId === delId) {
        setEditingId(null)
        setDraft({ name: '', emoji: '', nameAr: '' })
      }
      setDelId(null)
      toast.success('Supprimé')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible (produits liés ?)')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-[#6b7280]">Chargement…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#2d5a3d]">Catégories</h1>

      {!editingId ? (
        <form onSubmit={createCat} className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
          <p className="font-medium text-[#374151]">Ajouter une catégorie</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Nom *"
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />
            <input
              placeholder="Emoji"
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.emoji}
              onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
            />
            <input
              placeholder="Nom AR"
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.nameAr}
              onChange={(e) => setDraft((d) => ({ ...d, nameAr: e.target.value }))}
            />
          </div>
          <button type="submit" className="mt-4 rounded-full bg-[#2d5a3d] px-6 py-2 text-sm text-white">
            Ajouter
          </button>
        </form>
      ) : (
        <form onSubmit={saveEdit} className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
          <p className="font-medium text-[#374151]">Modifier la catégorie</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.emoji}
              onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={draft.nameAr}
              onChange={(e) => setDraft((d) => ({ ...d, nameAr: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="rounded-full bg-[#2d5a3d] px-6 py-2 text-sm text-white">
              Enregistrer
            </button>
            <button
              type="button"
              className="text-sm text-[#6b7280] underline"
              onClick={() => {
                setEditingId(null)
                setDraft({ name: '', emoji: '', nameAr: '' })
              }}
            >
              Annuler
            </button>
            <button type="button" className="text-sm text-red-600 underline" onClick={() => setDelId(editingId)}>
              Supprimer
            </button>
          </div>
        </form>
      )}

      <p className="text-sm text-[#6b7280]">Glissez pour réordonner. {savingOrder ? 'Enregistrement…' : ''}</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((cat) => (
              <SortRow
                key={cat._id}
                cat={cat}
                productCount={countByCat(cat._id)}
                onToggle={toggleActive}
                onEdit={openEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmModal
        open={Boolean(delId)}
        title="Supprimer cette catégorie ?"
        description="Seulement possible si aucun produit lié."
        confirmLabel="Supprimer"
        danger
        busy={busy}
        onClose={() => setDelId(null)}
        onConfirm={deleteCat}
      />
    </div>
  )
}
