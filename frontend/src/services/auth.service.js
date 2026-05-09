import { api } from '../lib/axios'

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data.data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data.data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data.data
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/auth/me', payload)
  return data.data
}

export async function changePassword(currentPassword, newPassword) {
  await api.patch('/auth/me/password', { currentPassword, newPassword })
}
