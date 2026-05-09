import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearAccessToken, setAccessToken } from '../lib/axios'
import * as authService from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const hydrate = useCallback(async () => {
    setAuthLoading(true)
    try {
      const { data } = await api.post('/auth/refresh')
      if (data?.data?.accessToken) {
        setAccessToken(data.data.accessToken)
        setUser(data.data.user || null)
      }
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrate()
    const fn = () => {
      clearAccessToken()
      setUser(null)
    }
    window.addEventListener('auth:logout', fn)
    return () => window.removeEventListener('auth:logout', fn)
  }, [hydrate])

  const login = async (email, password) => {
    const { user: u, accessToken } = await authService.login(email, password)
    setAccessToken(accessToken)
    setUser(u)
    return u
  }

  const register = async (form) => {
    const { user: u, accessToken } = await authService.register(form)
    setAccessToken(accessToken)
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  const updateProfile = async (payload) => {
    const u = await authService.updateProfile(payload)
    setUser(u)
  }

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      refreshSession: hydrate,
    }),
    [user, authLoading, hydrate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé sous AuthProvider')
  return ctx
}
