import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Footer from '../components/layout/Footer'
import PageTransition from '../components/ui/PageTransition'
import { BRAND_LOGO_SRC } from '../constants/brand'
import { useAuth } from '../context/AuthContext'
import { getAdminDashboardUrl } from '../lib/backendOrigin'

export default function Login() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Email et mot de passe requis.')
      return
    }
    setLoading(true)
    try {
      const u = await login(email.trim(), password)
      if (u?.role === 'admin') {
        toast.success('Redirection vers l’administration…')
        window.location.assign(getAdminDashboardUrl())
        return
      }
      toast.success('Connexion réussie 🌿')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main id="contenu-principal" className="min-h-[100dvh] bg-cream pb-24 pt-24 md:pt-28">
        <div className="mx-auto flex max-w-[400px] flex-col px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-card border border-border-green bg-warm-white p-8 shadow-[0_8px_40px_rgba(45,90,61,0.08)]"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <img src={BRAND_LOGO_SRC} alt="" className="h-14 w-14 rounded-full object-cover" width={56} height={56} />
              <h1 className="mt-4 font-cormorant text-3xl text-deep">Connexion</h1>
              <p className="mt-1 text-sm text-text-muted">Accédez à votre compte Green Diet</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm text-text-muted">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-card border border-border-green bg-cream px-3 py-2.5 font-dm text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm text-text-muted">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full rounded-card border border-border-green bg-cream px-3 py-2.5 pr-24 font-dm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-pill px-2 py-1 text-xs text-leaf"
                    onClick={() => setShow((s) => !s)}
                  >
                    {show ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-pill bg-deep py-3 font-dm text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Connexion…' : 'Connexion'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-text-muted">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium text-leaf underline underline-offset-2" state={location.state}>
                S’inscrire →
              </Link>
            </p>
          </motion.div>
        </div>
        <Footer />
      </main>
    </PageTransition>
  )
}
