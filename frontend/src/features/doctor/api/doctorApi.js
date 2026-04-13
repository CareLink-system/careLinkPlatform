import axios from 'axios'
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/doctors',
})

// 🔐 Attach JWT
API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

// ================= GET BY USER ID =================
// ⚠️ Your backend DOES NOT have this endpoint → fallback using all doctors
export const getDoctorByUserId = async (userId) => {
  try {
    const res = await API.get('')
    const doctor = res.data.find((d) => d.userId === userId)
    return { data: doctor || null, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// ================= CREATE =================
export const createDoctorProfile = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err?.response?.data?.message || err.message,
    }
  }
}

// ================= UPDATE =================
export const updateDoctorProfile = async (id, payload) => {
  try {
    const res = await API.put(`/${id}`, payload)
    return { data: res.data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err?.response?.data?.message || err.message,
    }
  }
}

// ================= DELETE =================
export const deleteDoctorProfile = async (id) => {
  try {
    const res = await API.delete(`/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err?.response?.data?.message || err.message,
    }
  }
}