import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Footer from '../components/layout/Footer'
import PageTransition from '../components/ui/PageTransition'
import { BRAND_LOGO_SRC } from '../constants/brand'
import { useAuth } from '../context/AuthContext'

const TN_PHONE = /^(?:\+216|216|0)?[2-9]\d{7}$/

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-[12px] text-red-500">{msg}</p>
}

export default function Register() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState({})

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [phone, setPhone] = useState('')

  const [street, setStreet] = useState('')
  const [city, setCity] = useState('Sfax')
  const [region, setRegion] = useState('')
  const [notes, setNotes] = useState('')

  const validate1 = () => {
    const e = {}
    if (!firstName.trim()) e.firstName = 'Le prénom est requis.'
    if (!lastName.trim()) e.lastName = 'Le nom est requis.'
    if (!email.trim()) e.email = 'L’email est requis.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalide.'
    if (!password || password.length < 8) e.password = 'Minimum 8 caractères.'
    if (password !== password2) e.password2 = 'Les mots de passe ne correspondent pas.'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e = {}
    const p = phone.replace(/\s/g, '')
    if (!p) e.phone = 'Le téléphone est requis.'
    else if (!TN_PHONE.test(p)) e.phone = 'Format tunisien attendu (ex. +216 XX XXX XXX).'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    const e = {}
    if (!street.trim()) e.street = 'La rue est requise.'
    if (!city.trim()) e.city = 'La ville est requise.'
    setErrs(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\s/g, ''),
        password,
        address: {
          street: street.trim(),
          city: city.trim() || 'Sfax',
          region: region.trim(),
          notes: notes.trim() || undefined,
        },
      })
      toast.success('🌿 Bienvenue sur Green Diet !')
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message
      if (err.response?.data?.errors?.length) {
        toast.error(err.response.data.errors[0]?.message || msg)
      } else {
        toast.error(msg || 'Inscription impossible.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main id="contenu-principal" className="min-h-[100dvh] bg-cream pb-24 pt-24 md:pt-28">
        <div className="mx-auto max-w-[440px] px-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src={BRAND_LOGO_SRC} alt="" className="h-12 w-12 rounded-full object-cover" width={48} height={48} />
            <h1 className="mt-4 font-cormorant text-3xl text-deep">Créer un compte</h1>
            <div className="mt-4 flex w-full gap-1">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-leaf' : 'bg-[rgba(74,124,89,0.15)]'}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border-green bg-warm-white p-6 shadow-[0_8px_40px_rgba(45,90,61,0.06)]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="r1"
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? false : { opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <h2 className="font-dm text-sm font-medium text-deep">Identité</h2>
                  <div>
                    <label className="text-sm text-text-muted">Prénom *</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <FieldError msg={errs.firstName} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Nom *</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <FieldError msg={errs.lastName} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Email *</label>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <FieldError msg={errs.email} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Mot de passe *</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldError msg={errs.password} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Confirmer *</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                    <FieldError msg={errs.password2} />
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-pill bg-deep py-3 font-dm text-sm text-white"
                    onClick={() => validate1() && setStep(2)}
                  >
                    Continuer →
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="r2"
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? false : { opacity: 0, x: -40 }}
                  className="space-y-3"
                >
                  <h2 className="font-dm text-sm font-medium text-deep">Contact</h2>
                  <div>
                    <label className="text-sm text-text-muted">Téléphone *</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+216 …"
                    />
                    <FieldError msg={errs.phone} />
                  </div>
                  <p className="text-[12px] text-text-muted">
                    Nous utilisons ce numéro pour confirmer votre livraison.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-pill border border-leaf py-3 font-dm text-sm text-leaf"
                      onClick={() => setStep(1)}
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-pill bg-deep py-3 font-dm text-sm text-white"
                      onClick={() => validate2() && setStep(3)}
                    >
                      Continuer →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="r3"
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? false : { opacity: 0, x: -40 }}
                  className="space-y-3"
                >
                  <h2 className="font-dm text-sm font-medium text-deep">Adresse</h2>
                  <div>
                    <label className="text-sm text-text-muted">Rue et numéro *</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                    <FieldError msg={errs.street} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Ville *</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <FieldError msg={errs.city} />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Région</label>
                    <input
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Notes de livraison</label>
                    <textarea
                      rows={2}
                      className="mt-1 w-full rounded-card border border-border-green bg-cream px-3 py-2 font-dm text-sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-pill border border-leaf py-3 font-dm text-sm text-leaf"
                      onClick={() => setStep(2)}
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="flex-1 rounded-pill bg-deep py-3 font-dm text-sm text-white disabled:opacity-50"
                      onClick={submit}
                    >
                      {loading ? 'Création…' : 'Créer mon compte'}
                    </button>
                  </div>
                  <p className="text-center text-sm text-text-muted">
                    Déjà inscrit ?{' '}
                    <Link to="/connexion" className="text-leaf underline">
                      Se connecter →
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Footer />
      </main>
    </PageTransition>
  )
}
