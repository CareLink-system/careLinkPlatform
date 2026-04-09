import axios from 'axios'
import { getStoredAuth } from '../features/auth/api/authApi'

// Simple API wrapper to fetch Agora token for an appointment
const BASE = import.meta.env.VITE_TELEMEDICINE_API_BASE_URL || 'http://localhost:5007'

function buildAuthHeaders() {
  const token = getStoredAuth()?.token
  if (!token) return {}

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
  return { Authorization: `Bearer ${cleanToken}` }
}

export async function getAgoraToken(appointmentId) {
  const url = `${BASE.replace(/\/$/, '')}/api/telemedicine/video/token/${appointmentId}`
  try {
    const res = await axios.get(url, { headers: buildAuthHeaders() })
    return res.data
  } catch (err) {
    const status = err?.response?.status
    const statusText = err?.response?.statusText || err.message
    throw new Error(`${status || 'Error'} ${statusText}`)
  }
}

export default { getAgoraToken }
