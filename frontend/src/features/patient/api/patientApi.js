import axios from 'axios'
import { getStoredAuth } from '../../auth/api/authApi'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/patients',
})

API.interceptors.request.use((config) => {
  const stored = getStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

// GET BY USER ID
export const getPatientByUserId = async (userId) => {
  try {
    const res = await API.get(`/user/${userId}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// CREATE
export const createPatientProfile = async (payload) => {
  try {
    const res = await API.post('', payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// UPDATE
export const updatePatientProfile = async (id, payload) => {
  try {
    const res = await API.put(`/${id}`, payload)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

/* // DELETE
export const deletePatientProfile = async (id) => {
  try {
    const res = await API.delete(`/${id}`)
    return { data: res.data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
} */