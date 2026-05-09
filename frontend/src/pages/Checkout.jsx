import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import * as ordersApi from '../services/orders.service'

function formatTnd(n) {
  return `${Number(n).toFixed(3)} TND`
}

export default function Checkout() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { items, totalPriceNum, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)
  const [useProfile, setUseProfile] = useState(true)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: 'Sfax',
    region: '',
    notes: '',
    comments: '',
  })

  useEffect(() => {
    if (!user) return
    const a = user.address || {}
    setForm((f) => ({
      ...f,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      phone: user.phone || f.phone,
      email: user.email || f.email,
      street: a.street || f.street,
      city: a.city || 'Sfax',
      region: a.region || f.region,
      notes: a.notes || f.notes,
    }))
  }, [user])

  const activeForm =
    isAuthenticated && useProfile
      ? {
          ...form,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          phone: user.phone || '',
          email: user.email || '',
          street: user.address?.street || '',
          city: user.address?.city || 'Sfax',
          region: user.address?.region || '',
          notes: user.address?.notes || '',
          comments: form.comments,
        }
      : form

  const subtotal = totalPriceNum

  const validateStep1 = () => {
    const f = activeForm
    if (!f.fullName?.trim()) {
      toast.error('Le nom complet est requis.')
      return false
    }
    if (!f.phone?.trim()) {
      toast.error('Le téléphone est requis.')
      return false
    }
    if (!f.street?.trim()) {
      toast.error('L’adresse est requise.')
      return false
    }
    return true
  }

  const submit = async () => {
    const f = activeForm
    setSubmitting(true)
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id || i.product._id,
          quantity: i.quantity,
        })),
        customer: {
          fullName: f.fullName.trim(),
          phone: f.phone.trim(),
          email: f.email?.trim() || undefined,
          address: {
            street: f.street.trim(),
            city: f.city.trim() || 'Sfax',
            region: f.region?.trim(),
            notes: f.notes?.trim(),
          },
          comments: f.comments?.trim(),
        },
        source: 'website',
      }
      const order = await ordersApi.createOrder(payload)
      setOrderNumber(order.orderNumber)
      setStep(3)
      clearCart()
      toast.success('Commande envoyée 🌿')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Impossible de passer la commande.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-[100dvh] bg-cream px-6 pb-24 pt-28 md:pb-16 md:pt-32">
        <p className="text-center font-cormorant text-2xl text-deep">Votre panier est vide</p>
        <Link to="/produits" className="mt-6 block text-center text-leaf underline">
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[280] flex flex-col bg-cream md:relative md:z-0 md:min-h-[100dvh] md:pt-20">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-green bg-warm-white px-4 md:px-8">
        <button
          type="button"
          className="font-dm text-sm text-leaf"
          onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate(-1))}
        >
          ← {step === 1 ? 'Panier' : 'Retour'}
        </button>
        <span className="font-cormorant text-lg">Commande</span>
        <span className="text-xs text-text-muted">{step < 3 ? `${step}/2` : '✓'}</span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:mx-auto md:max-w-lg md:px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={reduce ? false : { opacity: 1, x: 0 }}
              exit={reduce ? false : { opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h1 className="font-cormorant text-2xl text-deep">Livraison</h1>

              {isAuthenticated && (
                <div className="space-y-2">
                  <label className="flex cursor-pointer gap-3 rounded-card border border-border-green bg-warm-white p-3">
                    <input type="radio" checked={useProfile} onChange={() => setUseProfile(true)} />
                    <span className="font-dm text-sm">Utiliser mes informations</span>
                  </label>
                  <label className="flex cursor-pointer gap-3 rounded-card border border-border-green bg-warm-white p-3">
                    <input type="radio" checked={!useProfile} onChange={() => setUseProfile(false)} />
                    <span className="font-dm text-sm">Nouvelle adresse</span>
                  </label>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-text-muted">
                  <Link to="/connexion" className="text-leaf underline" state={{ from: '/commander' }}>
                    Vous avez un compte ? Se connecter
                  </Link>
                </p>
              )}

              <div className="space-y-3">
                <Field label="Nom complet *" field="fullName" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Téléphone *" field="phone" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Email (optionnel)" field="email" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Rue et numéro *" field="street" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Ville *" field="city" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Région (optionnel)" field="region" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <Field label="Notes de livraison" field="notes" form={activeForm} setForm={setForm} locked={isAuthenticated && useProfile} />
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Commentaires commande</label>
                  <textarea
                    className="w-full rounded-card border border-border-green bg-warm-white p-3 font-dm text-sm"
                    rows={3}
                    value={form.comments}
                    onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-pill bg-deep py-3 font-dm text-sm text-white"
                onClick={() => validateStep1() && setStep(2)}
              >
                Continuer →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={reduce ? false : { opacity: 1, x: 0 }}
              exit={reduce ? false : { opacity: 0, x: -40 }}
              className="space-y-4"
            >
              <h1 className="font-cormorant text-2xl text-deep">Récapitulatif</h1>
              <div className="rounded-card border border-border-green bg-warm-white p-4">
                {items.map((i) => (
                  <div
                    key={i.product.id}
                    className="flex justify-between border-b border-border-green py-2 text-sm last:border-0"
                  >
                    <span>
                      {i.product.emoji} {i.product.name} ×{i.quantity}
                    </span>
                    <span>{formatTnd(i.product.priceNum * i.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between font-dm text-sm">
                  <span>Sous-total</span>
                  <span>{formatTnd(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Livraison</span>
                  <span>Gratuit</span>
                </div>
                <div className="mt-2 flex justify-between font-cormorant text-lg text-deep">
                  <span>Total</span>
                  <span>{formatTnd(subtotal)}</span>
                </div>
              </div>
              <p className="rounded-pill bg-cream px-3 py-2 text-center text-sm text-deep">Paiement à la livraison 💵</p>
              <button
                type="button"
                disabled={submitting}
                className="w-full rounded-pill bg-deep py-3 font-dm text-sm text-white disabled:opacity-50"
                onClick={submit}
              >
                {submitting ? 'Envoi…' : 'Confirmer la commande →'}
              </button>
              <button type="button" className="w-full text-sm text-leaf underline" onClick={() => setStep(1)}>
                ← Modifier
              </button>
            </motion.div>
          )}

          {step === 3 && orderNumber && (
            <motion.div
              key="s3"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? false : { opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <svg className="mx-auto h-16 w-16 text-leaf" viewBox="0 0 64 64" aria-hidden>
                <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                <motion.path
                  d="M18 34l10 10 18-22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={reduce ? false : { pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
              <h1 className="font-cormorant text-4xl text-deep">Commande confirmée ! 🌿</h1>
              <span className="inline-block rounded-pill bg-gold px-4 py-1 font-dm text-sm font-medium">{orderNumber}</span>
              <p className="text-sm text-text-muted">
                Nous vous contacterons au {activeForm.phone} pour confirmer la livraison.
              </p>
              <div className="flex flex-col gap-2">
                <Link to={`/suivi/${orderNumber}`} className="rounded-pill bg-deep py-3 font-dm text-sm text-white">
                  Suivre ma commande →
                </Link>
                <Link to="/" className="rounded-pill border border-leaf py-3 font-dm text-sm text-leaf">
                  Retour à l’accueil
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Field({ label, field, form, setForm, locked }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-text-muted">{label}</label>
      <input
        className="w-full rounded-card border border-border-green bg-warm-white px-3 py-2 font-dm text-sm disabled:bg-cream"
        value={form[field] || ''}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        disabled={locked}
      />
    </div>
  )
}
