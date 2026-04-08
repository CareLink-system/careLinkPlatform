import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
const AUTH_STORAGE_KEY = 'carelink.auth'

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors[0]
  }
  return payload.message || fallback
}

async function request(path, body) {
  try {
    const res = await apiClient.post(path, body)
    const payload = res.data

    if (!res.status || res.status >= 400 || payload?.success === false) {
      throw new Error(getErrorMessage(payload, 'Something went wrong. Please try again.'))
    }

    return payload.data
  } catch (err) {
    const payload = err?.response?.data || null
    throw new Error(getErrorMessage(payload, err.message || 'Something went wrong. Please try again.'))
  }
}

export async function loginUser(data) {
  return request('/api/v1/auth/login', data)
}

export async function registerUser(data) {
  return request('/api/v1/auth/register', data)
}

export function persistAuth(authData) {
  const payload = {
    token: authData?.token,
    refreshToken: authData?.refreshToken || null,
    user: {
      id: authData?.id,
      email: authData?.email,
      firstName: authData?.firstName,
      lastName: authData?.lastName,
      role: authData?.role,
    },
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
  return payload
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
