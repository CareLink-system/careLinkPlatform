const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
const AUTH_STORAGE_KEY = 'carelink.auth'

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors[0]
  }
  return payload.message || fallback
}

async function request(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Keep payload null when response body is not JSON.
  }

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, 'Something went wrong. Please try again.'))
  }

  return payload.data
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
