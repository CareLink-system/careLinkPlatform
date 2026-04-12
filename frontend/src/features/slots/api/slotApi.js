import axios from 'axios'
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/doctors/availability',
})

// ================= AUTH =================
API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

// ================= READ =================
export const getSlotsByDoctorId = async (doctorId) => {
  try {
    const res = await API.get(`/doctor/${doctorId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.response?.data || err.message }
  }
}

// ================= CREATE =================
export const createSlot = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.response?.data || err.message }
  }
}

// ================= UPDATE =================
export const updateSlot = async (id, payload) => {
  try {
    const res = await API.put(`/${id}`, payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.response?.data || err.message }
  }
}

// ================= DELETE =================
export const deleteSlot = async (id) => {
  try {
    const res = await API.delete(`/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.response?.data || err.message }
  }
}