import axios from 'axios'
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1/doctors/prescriptions`,
})

API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

function mapError(err) {
  return err?.response?.data?.message || err?.response?.data?.error || err.message
}

export const createPrescription = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: mapError(err) }
  }
}

export const getPrescriptionsByDoctorId = async (doctorId) => {
  try {
    const res = await API.get(`/doctor/${doctorId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: mapError(err) }
  }
}

export const getPrescriptionsByPatientId = async (patientId) => {
  try {
    const res = await API.get(`/patient/${patientId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: mapError(err) }
  }
}
