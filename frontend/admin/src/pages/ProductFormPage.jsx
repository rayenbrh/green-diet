import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'
import ImageUpload from '../components/ImageUpload'
import { api } from '../lib/axios'
import { getUploadsBaseUrl } from '../lib/uploadsBase'

function urlsToFilenames(images) {
  return (images || [])
    .map((img) => {
      if (!img || typeof img !== 'string') return null
      if (img.includes('/uploads/')) {
        const tail = img.split('/uploads/').pop()
        return tail ? tail.split('?')[0] : null
      }
      if (!img.includes('/') && /\.(jpe?g|png|webp)$/i.test(img)) return img
      try {
        return new URL(img).pathname.split('/').filter(Boolean).pop() || null
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

const emptyForm = () => ({
  name: '',
  nameAr: '',
  category: '',
  description: '',
  descriptionLong: '',
  price: '',
  comparePrice: '',
  weight: '',
  emoji: '🌿',
  bgColor: '#FAF8F2',
  tagsInput: '',
  stock: '999',
  isAvailable: true,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
})

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const serverBaseUrl = getUploadsBaseUrl()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [imageData, setImageData] = useState({ existingImages: [], newFiles: [] })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDel, setShowDel] = useState(false)

  useEffect(() => {
    api.get('/admin/categories').then((r) => setCategories(r.data.data || []))
  }, [])

  useEffect(() => {
    if (!isNew) return
    setImageData({ existingImages: [], newFiles: [] })
  }, [isNew, id])

  useEffect(() => {
    if (isNew) return
    let c = false
    api
      .get(`/admin/products/${id}`)
      .then((r) => {
        const p = r.data.data
        if (!p || c) return
        setForm({
          name: p.name || '',
          nameAr: p.nameAr || '',
          category: p.category?._id || p.category || '',
          description: p.description || '',
          descriptionLong: p.descriptionLong || '',
          price: String(p.price ?? ''),
          comparePrice: p.comparePrice != null ? String(p.comparePrice) : '',
          weight: p.weight || '',
          emoji: p.emoji || '🌿',
          bgColor: p.bgColor || '#FAF8F2',
          tagsInput: (p.tags || []).join(', '),
          stock: String(p.stock ?? 999),
          isAvailable: p.isAvailable !== false,
          isNew: Boolean(p.isNew),
          isBestSeller: Boolean(p.isBestSeller),
          isFeatured: Boolean(p.isFeatured),
        })
        setImageData({ existingImages: urlsToFilenames(p.images), newFiles: [] })
      })
      .catch(() => toast.error('Produit introuvable'))
      .finally(() => {
        if (!c) setLoading(false)
      })
    return () => {
      c = true
    }
  }, [id, isNew])

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('name', form.name.trim())
    if (form.nameAr?.trim()) fd.append('nameAr', form.nameAr.trim())
    fd.append('category', form.category)
    fd.append('description', form.description.trim())
    if (form.descriptionLong?.trim()) fd.append('descriptionLong', form.descriptionLong.trim())
    fd.append('price', String(Number(form.price)))
    if (form.comparePrice !== '') fd.append('comparePrice', String(Number(form.comparePrice)))
    if (form.weight?.trim()) fd.append('weight', form.weight.trim())
    fd.append('emoji', form.emoji?.trim() || '🌿')
    fd.append('bgColor', form.bgColor || '#FAF8F2')
    fd.append('stock', String(Number(form.stock) || 0))
    fd.append('tags', form.tagsInput)
    fd.append('isAvailable', String(form.isAvailable))
    fd.append('isNew', String(form.isNew))
    fd.append('isBestSeller', String(form.isBestSeller))
    fd.append('isFeatured', String(form.isFeatured))
    fd.append('existingImages', JSON.stringify(isNew ? [] : imageData.existingImages))
    imageData.newFiles.forEach((file) => fd.append('images', file))
    return fd
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    if (!form.category) return toast.error('Catégorie requise')
    if (!form.description.trim()) return toast.error('Description requise')
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) return toast.error('Prix invalide')
    setSaving(true)
    setUploadProgress(0)
    const onUploadProgress = (e) => {
      if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    }
    try {
      const fd = buildFormData()
      if (isNew) {
        const { data } = await api.post('/admin/products', fd, { onUploadProgress })
        setUploadProgress(100)
        toast.success('Produit créé')
        navigate(`/products/${data.data._id}`, { replace: true })
      } else {
        await api.patch(`/admin/products/${id}`, fd, { onUploadProgress })
        setUploadProgress(100)
        toast.success('Enregistré')
        const { data: refetch } = await api.get(`/admin/products/${id}`)
        setImageData({ existingImages: urlsToFilenames(refetch.data.images), newFiles: [] })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur sauvegarde')
    } finally {
      setSaving(false)
      setTimeout(() => setUploadProgress(0), 800)
    }
  }

  const remove = async () => {
    setSaving(true)
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Produit désactivé')
      navigate('/products')
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
      setShowDel(false)
    }
  }

  if (loading) return <p className="text-[#6b7280]">Chargement…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/products" className="text-sm text-[#4a7c59] underline">
          ← Produits
        </Link>
        <h1 className="text-2xl font-semibold text-[#2d5a3d]">{isNew ? 'Nouveau produit' : 'Modifier le produit'}</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        <form onSubmit={submit} className="space-y-4 xl:col-span-8">
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Nom *</label>
            <input
              required
              className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Nom (AR)</label>
            <input
              className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            />
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Catégorie *</label>
            <select
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Description courte * (≤ 160 conseillés)</label>
            <textarea
              required
              rows={3}
              maxLength={200}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <p className="mt-1 text-xs text-[#9ca3af]">{form.description.length} caractères</p>
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Description longue</label>
            <textarea
              rows={5}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.descriptionLong}
              onChange={(e) => setForm((f) => ({ ...f, descriptionLong: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
              <label className="block text-sm font-medium text-[#374151]">Prix * (TND)</label>
              <input
                required
                type="number"
                step="0.001"
                min="0"
                className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
              <label className="block text-sm font-medium text-[#374151]">Prix barré</label>
              <input
                type="number"
                step="0.001"
                min="0"
                className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.comparePrice}
                onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
              <label className="block text-sm font-medium text-[#374151]">Poids</label>
              <input
                className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="ex. 500 g"
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              />
            </div>
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
              <label className="block text-sm font-medium text-[#374151]">Emoji</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              />
            </div>
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
              <label className="block text-sm font-medium text-[#374151]">Couleur carte</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <input
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2 font-mono text-sm"
                  value={form.bgColor}
                  onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-[#374151]">Images (max 4, JPEG / PNG / WebP)</label>
            <ImageUpload
              existingImages={imageData.existingImages}
              onChange={setImageData}
              maxImages={4}
              serverBaseUrl={serverBaseUrl}
            />
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Tags (virgules)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.tagsInput}
              onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
            />
          </div>
          <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-[#374151]">Stock</label>
            <input
              type="number"
              min="0"
              className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            />
          </div>
          <div className="admin-toggle-grid rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-6 shadow-sm">
            {[
              ['isAvailable', 'Disponible'],
              ['isNew', 'Nouveau'],
              ['isBestSeller', 'Best-seller'],
              ['isFeatured', 'À la une'],
            ].map(([k, lab]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
                />
                {lab}
              </label>
            ))}
          </div>
          {saving && (
            <div className="rounded-xl border border-[rgba(74,124,89,0.12)] bg-white p-4 shadow-sm">
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#6b7280]">
                <span>{uploadProgress < 100 ? 'Envoi des images…' : 'Sauvegarde…'}</span>
                <span className="font-semibold text-[#2d5a3d]">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(74,124,89,0.12)]">
                <div
                  className="h-full rounded-full bg-[#2d5a3d] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#2d5a3d] px-8 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? '…' : 'Enregistrer'}
            </button>
            <Link to="/products" className="rounded-full border border-[#374151] px-8 py-2.5 text-sm">
              Annuler
            </Link>
            {!isNew && (
              <button type="button" className="text-sm text-red-600 underline" onClick={() => setShowDel(true)}>
                Supprimer (désactiver)
              </button>
            )}
          </div>
        </form>

        <div className="admin-preview-col xl:col-span-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Aperçu carte</p>
          <div
            className="sticky top-24 overflow-hidden rounded-2xl border border-[rgba(74,124,89,0.14)] shadow-md"
            style={{ backgroundColor: form.bgColor || '#FAF8F2' }}
          >
            <div className="flex aspect-[4/5] flex-col items-center justify-center p-8 text-center">
              <span className="text-6xl">{form.emoji}</span>
              <h3 className="mt-4 font-semibold text-[#2d5a3d]">{form.name || 'Nom produit'}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#4b5563]">{form.description || 'Description'}</p>
              <p className="mt-4 text-lg font-bold text-[#2d5a3d]">
                {Number(form.price || 0).toFixed(3)} TND
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDel}
        title="Désactiver ce produit ?"
        danger
        busy={saving}
        onClose={() => setShowDel(false)}
        onConfirm={remove}
      />
    </div>
  )
}
