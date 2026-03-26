const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

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

  localStorage.setItem('carelink.auth', JSON.stringify(payload))
}
