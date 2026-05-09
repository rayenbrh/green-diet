import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && isAuthenticated) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email.trim(), password)
      toast.success('Bienvenue')
    } catch {
      toast.error('Identifiants invalides.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f3] px-4">
      <div className="w-full max-w-[380px] rounded-xl border border-[rgba(74,124,89,0.18)] bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-[#2d5a3d]">Administration</h1>
        <p className="mt-1 text-center text-sm text-[#6b7280]">Green Diet — Sfax</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <div>
            <label htmlFor="adm-email" className="block text-sm text-[#374151]">
              Email
            </label>
            <input
              id="adm-email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-[rgba(74,124,89,0.25)] px-3 py-2.5 text-sm outline-none ring-[#4a7c59] focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="adm-pass" className="block text-sm text-[#374151]">
              Mot de passe
            </label>
            <input
              id="adm-pass"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-[rgba(74,124,89,0.25)] px-3 py-2.5 text-sm outline-none ring-[#4a7c59] focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy || loading}
            className="w-full rounded-full bg-[#2d5a3d] py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
