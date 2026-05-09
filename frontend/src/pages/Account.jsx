import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Footer from '../components/layout/Footer'
import PageTransition from '../components/ui/PageTransition'
import * as authApi from '../services/auth.service'
import * as ordersApi from '../services/orders.service'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-900' },
  confirmed: { label: 'Confirmée', className: 'bg-blue-100 text-blue-900' },
  preparing: { label: 'En préparation', className: 'bg-amber-100 text-amber-800' },
  out_for_delivery: { label: 'En livraison', className: 'bg-violet-100 text-violet-900' },
  delivered: { label: 'Livrée', className: 'bg-emerald-100 text-emerald-900' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
}

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

function initials(u) {
  return `${(u.firstName || '')[0] || ''}${(u.lastName || '')[0] || ''}`.toUpperCase() || '?'
}

export default function Account() {
  const reduce = useReducedMotion()
  const { user, logout, updateProfile } = useAuth()
  const [tab, setTab] = useState('profil')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const [pw, setPw] = useState({ current: '', next: '', next2: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: 'Sfax',
    region: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const a = user.address || {}
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      street: a.street || '',
      city: a.city || 'Sfax',
      region: a.region || '',
      notes: a.notes || '',
    })
  }, [user])

  useEffect(() => {
    if (tab !== 'commandes' || !user) return
    let c = false
    setOrdersLoading(true)
    ordersApi
      .getMyOrders()
      .then((d) => {
        if (!c) setOrders(d.orders || [])
      })
      .catch(() => toast.error('Impossible de charger les commandes.'))
      .finally(() => {
        if (!c) setOrdersLoading(false)
      })
    return () => {
      c = true
    }
  }, [tab, user])

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return ''
    try {
      return new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch {
      return ''
    }
  }, [user])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim() || 'Sfax',
          region: form.region.trim(),
          notes: form.notes.trim(),
        },
      })
      toast.success('Profil enregistré.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pw.next.length < 8) {
      toast.error('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }
    if (pw.next !== pw.next2) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setPwLoading(true)
    try {
      await authApi.changePassword(pw.current, pw.next)
      toast.success('Mot de passe mis à jour.')
      setPw({ current: '', next: '', next2: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de changer le mot de passe.')
    } finally {
      setPwLoading(false)
    }
  }

  if (!user) return null

  return (
    <PageTransition>
      <main id="contenu-principal" className="min-h-[100dvh] bg-cream pb-24 pt-24 md:pt-28">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-5 md:flex-row md:px-10">
          <aside className="w-full shrink-0 rounded-card border border-border-green bg-warm-white p-6 md:w-[280px]">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf font-dm text-lg font-medium text-white">
                {initials(user)}
              </div>
              <div>
                <p className="font-cormorant text-xl text-deep">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-text-muted">Membre depuis {memberSince}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-card bg-cream p-2">
                <p className="font-cormorant text-lg text-leaf">{user.orderCount ?? 0}</p>
                <p className="text-[11px] text-text-muted">Commandes</p>
              </div>
              <div className="rounded-card bg-cream p-2">
                <p className="font-cormorant text-lg text-leaf">{(user.totalSpent ?? 0).toFixed(3)}</p>
                <p className="text-[11px] text-text-muted">TND</p>
              </div>
            </div>
            <nav className="mt-6 space-y-1 font-dm text-sm">
              {[
                { id: 'profil', label: 'Mon profil' },
                { id: 'commandes', label: 'Mes commandes' },
                { id: 'motdepasse', label: 'Mot de passe' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setTab(l.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    tab === l.id ? 'bg-[rgba(74,124,89,0.1)] text-leaf' : 'text-text-main hover:bg-cream'
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-red-500 hover:bg-red-50"
                onClick={() => logout().then(() => toast('Déconnecté'))}
              >
                Se déconnecter
              </button>
            </nav>
          </aside>

          <section className="min-w-0 flex-1 rounded-card border border-border-green bg-warm-white p-6">
            {tab === 'profil' && (
              <motion.form
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={saveProfile}
                className="mx-auto max-w-lg space-y-3"
              >
                <h2 className="font-cormorant text-2xl text-deep">Mon profil</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Prénom" v={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
                  <Field label="Nom" v={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
                </div>
                <Field label="Téléphone" v={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                <Field label="Rue" v={form.street} onChange={(v) => setForm((f) => ({ ...f, street: v }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Ville" v={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                  <Field label="Région" v={form.region} onChange={(v) => setForm((f) => ({ ...f, region: v }))} />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Notes</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-pill bg-deep px-6 py-2.5 font-dm text-sm text-white disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              </motion.form>
            )}

            {tab === 'commandes' && (
              <div>
                <h2 className="font-cormorant text-2xl text-deep">Mes commandes</h2>
                {ordersLoading && <p className="mt-4 text-sm text-text-muted">Chargement…</p>}
                {!ordersLoading && orders.length === 0 && (
                  <p className="mt-4 text-sm text-text-muted">Aucune commande pour le moment.</p>
                )}
                <ul className="mt-4 space-y-2">
                  {orders.map((o) => {
                    const st = STATUS[o.status] || STATUS.pending
                    const open = expanded === o._id
                    return (
                      <li key={o._id} className="rounded-card border border-border-green bg-cream">
                        <button
                          type="button"
                          className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
                          onClick={() => setExpanded(open ? null : o._id)}
                        >
                          <span className="font-dm text-sm font-medium text-leaf">{o.orderNumber}</span>
                          <span className="text-xs text-text-muted">
                            {new Date(o.createdAt).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-text-muted">{o.items?.length || 0} article(s)</span>
                          <span className="font-dm text-sm">{Number(o.total).toFixed(3)} TND</span>
                          <span className={`rounded-pill px-2 py-0.5 text-[11px] ${st.className}`}>{st.label}</span>
                          <span className="text-xs text-leaf underline">{open ? 'Masquer' : 'Détails'}</span>
                        </button>
                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-border-green bg-warm-white px-4 py-3"
                            >
                              <ul className="space-y-1 text-sm">
                                {(o.items || []).map((it, i) => (
                                  <li key={i} className="flex justify-between">
                                    <span>
                                      {it.productEmoji} {it.productName} ×{it.quantity}
                                    </span>
                                    <span>{(Number(it.price) * it.quantity).toFixed(3)} TND</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-4 border-t border-dashed border-border-green pt-3">
                                <p className="text-xs font-medium text-text-muted">Historique</p>
                                <OrderTimeline history={o.statusHistory} current={o.status} />
                              </div>
                              <Link
                                to={`/suivi/${o.orderNumber}`}
                                className="mt-3 inline-block text-sm text-leaf underline"
                              >
                                Suivre cette commande →
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {tab === 'motdepasse' && (
              <form onSubmit={savePassword} className="mx-auto max-w-md space-y-3">
                <h2 className="font-cormorant text-2xl text-deep">Mot de passe</h2>
                <div>
                  <label className="text-sm text-text-muted">Mot de passe actuel</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                    value={pw.current}
                    onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Nouveau</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted">Confirmer</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                    value={pw.next2}
                    onChange={(e) => setPw((p) => ({ ...p, next2: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="rounded-pill bg-deep px-6 py-2.5 font-dm text-sm text-white disabled:opacity-50"
                >
                  {pwLoading ? 'Mise à jour…' : 'Mettre à jour'}
                </button>
              </form>
            )}
          </section>
        </div>
        <Footer />
      </main>
    </PageTransition>
  )
}

function Field({ label, v, onChange }) {
  return (
    <div>
      <label className="text-sm text-text-muted">{label}</label>
      <input
        className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
        value={v}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function OrderTimeline({ history, current }) {
  const steps = STATUS_ORDER
  const idx = steps.indexOf(current)
  return (
    <ol className="relative mt-2 space-y-2 border-l border-border-green pl-4">
      {(history || []).length > 0
        ? [...(history || [])]
            .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
            .map((h, i) => {
              const st = STATUS[h.status] || { label: h.status, className: 'bg-gray-100 text-gray-800' }
              return (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-leaf bg-warm-white" />
                  <span className={`inline-block rounded-pill px-2 py-0.5 text-[11px] ${st.className}`}>{st.label}</span>
                  <p className="text-[11px] text-text-muted">
                    {new Date(h.changedAt).toLocaleString('fr-FR')}
                    {h.note ? ` — ${h.note}` : ''}
                  </p>
                </li>
              )
            })
        : steps.map((s, i) => {
            const st = STATUS[s]
            const done = idx >= i
            return (
              <li key={s} className="relative text-sm">
                <span
                  className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                    done ? 'border-leaf bg-leaf' : 'border-border-green bg-warm-white'
                  }`}
                />
                <span className={done ? 'text-deep' : 'text-text-muted'}>{st.label}</span>
              </li>
            )
          })}
    </ol>
  )
}
