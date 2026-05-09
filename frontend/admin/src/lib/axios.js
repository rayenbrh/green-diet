import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken = null
let refreshPromise = null

export function setAccessToken(t) {
  accessToken = t
}

export function clearAccessToken() {
  accessToken = null
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error)
    if (
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/admin/login') ||
      original.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }
    original._retry = true
    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').finally(() => {
          refreshPromise = null
        })
      }
      const { data } = await refreshPromise
      const tok = data?.data?.accessToken
      const u = data?.data?.user
      if (tok && u?.role === 'admin') setAccessToken(tok)
      else throw new Error('not admin')
      return api(original)
    } catch {
      clearAccessToken()
      window.dispatchEvent(new CustomEvent('admin:logout'))
      return Promise.reject(error)
    }
  },
)
