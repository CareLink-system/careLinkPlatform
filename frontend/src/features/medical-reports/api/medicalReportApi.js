import axios from 'axios'
import { getPatientByUserId } from '../../patient/api/patientApi';
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/patients/medical-reports',
})

API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

// GET patientId from userId
export const resolvePatientId = async (userId) => {
  const res = await getPatientByUserId(userId)
  return res.data?.id || null
}

// CREATE
export const createMedicalReport = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// READ (own patient reports)
export const getReportsByPatientId = async (patientId) => {
  try {
    const res = await API.get(`/patient/${patientId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// UPDATE
export const updateMedicalReport = async (id, payload) => {
  try {
    const res = await API.put(`/${id}`, payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// DELETE
export const deleteMedicalReport = async (id) => {
  try {
    const res = await API.delete(`/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// Get all medical reports
export const getAllMedicalReports = async () => {
  try {
    const res = await API.get('')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.response?.data || err.message }
  }
}