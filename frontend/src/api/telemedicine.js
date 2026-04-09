import axios from 'axios'

// Simple API wrapper to fetch Agora token for an appointment
const BASE = import.meta.env.VITE_TELEMEDICINE_API_BASE_URL || 'http://localhost:5007'

export async function getAgoraToken(appointmentId) {
  const url = `${BASE.replace(/\/$/, '')}/api/telemedicine/video/token/${appointmentId}`
  try {
    const res = await axios.get(url)
    return res.data
  } catch (err) {
    const status = err?.response?.status
    const statusText = err?.response?.statusText || err.message
    throw new Error(`${status || 'Error'} ${statusText}`)
  }
}

export default { getAgoraToken }
