import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearAccessToken, setAccessToken } from '../lib/axios'

const Ctx = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrate = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/refresh')
      const tok = data?.data?.accessToken
      const u = data?.data?.user
      if (tok && u?.role === 'admin') {
        setAccessToken(tok)
        setUser(u)
      } else {
        clearAccessToken()
        setUser(null)
      }
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrate()
    const fn = () => {
      clearAccessToken()
      setUser(null)
    }
    window.addEventListener('admin:logout', fn)
    return () => window.removeEventListener('admin:logout', fn)
  }, [hydrate])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password })
    const tok = data?.data?.accessToken
    const u = data?.data?.user
    if (!tok || u?.role !== 'admin') throw new Error('Accès admin refusé')
    setAccessToken(tok)
    setUser(u)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, hydrate, isAuthenticated: Boolean(user) }),
    [user, loading, hydrate],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminAuth nécessite AdminAuthProvider')
  return ctx
}
