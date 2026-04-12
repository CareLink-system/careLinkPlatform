import { getStoredAuth } from '../../auth/api/authApi'
import axios from 'axios'

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const DOCTOR_BASE_URL = import.meta.env.VITE_DOCTOR_API_BASE_URL || ''
const APPOINTMENT_BASE_URL = import.meta.env.VITE_APPOINTMENT_API_BASE_URL || ''

function getLegacyTokenFromStorage() {
  try {
    const raw = localStorage.getItem('carelink.auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token || null
  } catch {
    return null
  }
}

function getToken() {
  const token = getStoredAuth()?.token || getLegacyTokenFromStorage() || null
  if (!token) return null
  return token.startsWith('Bearer ') ? token.slice(7) : token
}

function buildHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function safeGet(url, fallbackMessage) {
  try {
    const res = await axios.get(url, { headers: buildHeaders() })
    const payload = res.data

    if (res.status >= 400) {
      const message = payload?.message || fallbackMessage
      return { data: [], error: message }
    }

    if (payload?.success === false) {
      return { data: [], error: payload?.message || fallbackMessage }
    }

    return { data: payload?.data ?? payload ?? [], error: null }
  } catch (err) {
    const message = err?.response?.data?.message || fallbackMessage
    return { data: [], error: message }
  }
}

export async function fetchCurrentUser() {
  const storedAuth = getStoredAuth()
  const result = await safeGet(
    `${AUTH_BASE_URL}/api/v1/auth/me`,
    'Unable to load your profile right now.'
  )

  // Auth/me returns a single object, not list. On failure, fall back to the cached session.
  if (result.error && storedAuth?.user) {
    return {
      data: storedAuth.user,
      error: null,
    }
  }

  return {
    data: result.data && !Array.isArray(result.data) ? result.data : storedAuth?.user ?? null,
    error: result.error,
  }
}

export async function fetchUpcomingAppointments() {
  if (!APPOINTMENT_BASE_URL) {
    return {
      data: [],
      error: 'Appointments service is not configured yet. Set VITE_APPOINTMENT_API_BASE_URL when the service is ready.',
    }
  }

  return safeGet(
    `${APPOINTMENT_BASE_URL}/api/v1/appointments/upcoming`,
    'Appointments service is unavailable. You are all caught up for now.'
  )
}

export async function fetchNearbyDoctors() {
  if (!DOCTOR_BASE_URL) {
    return {
      data: [],
      error: 'Doctor service is not configured yet. Set VITE_DOCTOR_API_BASE_URL when the service is ready.',
    }
  }

  return safeGet(
    `${DOCTOR_BASE_URL}/api/v1/doctors/nearby`,
    'Doctor service is unavailable. No nearby doctors to show right now.'
  )
}

export async function fetchRecommendedDoctors() {
  if (!DOCTOR_BASE_URL) {
    return {
      data: [],
      error: 'Recommendations are unavailable because doctor service is not configured yet.',
    }
  }

  return safeGet(
    `${DOCTOR_BASE_URL}/api/v1/doctors/recommended`,
    'Recommendations are unavailable at the moment. Please check again soon.'
  )
}
