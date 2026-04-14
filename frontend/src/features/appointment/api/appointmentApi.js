import axios from 'axios'
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/appointments',
})

API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

// CREATE
export const createAppointment = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err?.response?.data?.message || err.message }
  }
}

// GET PATIENT APPOINTMENTS
export const getAppointmentsByPatientId = async (patientId) => {
  try {
    const res = await API.get(`/patient/${patientId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// CANCEL
export const cancelAppointment = async (id) => {
  try {
    await API.patch(`/${id}/cancel`)
    return { success: true }
  } catch {
    return { success: false }
  }
}

// DELETE (SOFT)
export const deleteAppointment = async (id) => {
  try {
    await API.delete(`/soft/${id}`)
    return { success: true }
  } catch {
    return { success: false }
  }
}

// UPDATE
export const updateAppointment = async (id, payload) => {
  try {
    const res = await API.put(`/${id}`, payload)
    return { data: res.data, error: null }
  } catch (err) {
    return {
      data: null,
      error:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message,
    }
  }
}

// GET ALL APPOINTMENTS
export const getAllAppointments = async () => {
  try {
    const res = await API.get('')
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// GET APPOINTMENT BY ID
export const getAppointmentById = async (id) => {
  try {
    const res = await API.get(`/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// GET APPOINTMENTS BY DOCTOR ID
export const getAppointmentsByDoctorId = async (doctorId) => {
  try {
    const res = await API.get(`/doctor/${doctorId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// UPDATE APPOINTMENT STATUS (DOCTOR/ADMIN)
export const updateAppointmentStatus = async (id, status) => {
  try {
    await API.patch(`/${id}/status`, {
      appointmentStatus: status,
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}