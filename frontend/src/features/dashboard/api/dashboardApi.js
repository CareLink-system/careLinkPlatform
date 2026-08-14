import { getStoredAuth } from '../../auth/api/authApi'
import { getPatientByUserId } from '../../patient/api/patientApi'
import axios from 'axios'

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const CORE_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const DOCTOR_BASE_URL = import.meta.env.VITE_DOCTOR_API_BASE_URL || CORE_BASE_URL
const APPOINTMENT_BASE_URL = import.meta.env.VITE_APPOINTMENT_API_BASE_URL || CORE_BASE_URL

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

function parseNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function formatDoctorForCard(doctor, index = 0) {
  return {
    id: doctor?.id,
    name: doctor?.doctorName || doctor?.name || 'Doctor',
    specialty: doctor?.specializationId || doctor?.department || 'General Medicine',
    consultationFee: doctor?.consultationFee || 0,
    availableDays: doctor?.isAvailable ? 'Available now' : 'By schedule',
    distance: `${(index % 4) + 1}.${(index % 9) + 1} km`,
    image: doctor?.imageUrl || doctor?.profileImage || doctor?.avatarUrl || '',
    rating: doctor?.rating || 0,
  }
}

function formatDateParts(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return { day: 'N/A', date: '-', fullDate: value || null }
  }

  return {
    day: parsed.toLocaleDateString(undefined, { weekday: 'short' }),
    date: String(parsed.getDate()),
    fullDate: parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }
}

function formatAppointmentForCard(appointment) {
  const dateParts = formatDateParts(appointment?.appointmentDate)
  const status = String(appointment?.appointmentStatus || 'Scheduled')

  return {
    id: appointment?.id,
    doctorName: appointment?.doctorName || `Doctor #${appointment?.doctorId ?? ''}`.trim(),
    time: appointment?.timeSlot || 'TBD',
    day: dateParts.day,
    date: dateParts.date,
    fullDate: dateParts.fullDate,
    status,
    appointmentType: appointment?.appointmentType || 'Consultation',
  }
}

async function resolvePatientId() {
  const auth = getStoredAuth()
  const user = auth?.user || null

  const directCandidates = [
    user?.patientId,
    user?.patient?.id,
    user?.patient?.patientId,
  ]

  for (const candidate of directCandidates) {
    const parsed = parseNumber(candidate)
    if (parsed !== null) return parsed
  }

  const userId = user?.id || user?._id || user?.userId
  if (!userId) return null

  const patientRes = await getPatientByUserId(userId)
  const patientId = parseNumber(patientRes?.data?.id || patientRes?.data?.patientId)
  return patientId
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
  const patientId = await resolvePatientId()
  if (!patientId) {
    return {
      data: [],
      error: 'Unable to load upcoming appointments until your patient profile is linked.',
    }
  }

  const result = await safeGet(
    `${APPOINTMENT_BASE_URL}/api/v1/appointments/patient/${patientId}`,
    'Appointments service is unavailable. You are all caught up for now.'
  )

  const doctorResult = await safeGet(
    `${DOCTOR_BASE_URL}/api/v1/doctors`,
    'Doctor directory is temporarily unavailable.'
  )
  const doctorMap = new Map(
    (Array.isArray(doctorResult.data) ? doctorResult.data : []).map((doc) => [
      String(doc?.id),
      doc?.doctorName || doc?.name || null,
    ])
  )

  const items = Array.isArray(result.data) ? result.data : []
  const active = items
    .filter((apt) => String(apt?.appointmentStatus || '').toLowerCase() !== 'cancelled')
    .sort((a, b) => new Date(a?.appointmentDate).getTime() - new Date(b?.appointmentDate).getTime())
    .map((apt) =>
      formatAppointmentForCard({
        ...apt,
        doctorName: doctorMap.get(String(apt?.doctorId)) || apt?.doctorName,
      })
    )

  return {
    data: active,
    error: result.error,
  }
}

export async function fetchNearbyDoctors() {
  const result = await safeGet(
    `${DOCTOR_BASE_URL}/api/v1/doctors`,
    'Doctor service is unavailable. No nearby doctors to show right now.'
  )

  const doctors = Array.isArray(result.data) ? result.data : []
  const nearby = doctors
    .filter((doctor) => doctor?.isAvailable !== false)
    .slice(0, 6)
    .map(formatDoctorForCard)

  return {
    data: nearby,
    error: result.error,
  }
}

export async function fetchRecommendedDoctors() {
  const verifiedResult = await safeGet(
    `${DOCTOR_BASE_URL}/api/v1/doctors/verified`,
    'Recommendations are unavailable at the moment. Please check again soon.'
  )

  const fallbackResult =
    Array.isArray(verifiedResult.data) && verifiedResult.data.length > 0
      ? verifiedResult
      : await safeGet(
          `${DOCTOR_BASE_URL}/api/v1/doctors`,
          'Recommendations are unavailable at the moment. Please check again soon.'
        )

  const doctors = Array.isArray(fallbackResult.data) ? fallbackResult.data : []
  const recommended = doctors
    .filter((doctor) => doctor?.isAvailable !== false)
    .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
    .slice(0, 6)
    .map(formatDoctorForCard)

  return {
    data: recommended,
    error: fallbackResult.error,
  }
}
