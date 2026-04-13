import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000'
const SYMPTOM_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/symptom-checker`

export async function analyzeSymptoms(payload) {
  try {
    const res = await axios.post(`${SYMPTOM_BASE}/analyze`, payload)
    return res.data
  } catch (err) {
    let errorMessage = 'Failed to analyze symptoms'
    const data = err?.response?.data
    if (data) {
      errorMessage = data.detail?.[0]?.msg || JSON.stringify(data)
    } else {
      errorMessage = err.message || errorMessage
    }
    throw new Error(errorMessage)
  }
}

// NEW: Fetch history for a user
export async function getSymptomHistory(userId) {
  try {
    const res = await axios.get(`${SYMPTOM_BASE}/history/${userId}`)
    return res.data
  } catch (err) {
    console.warn('History endpoint not reachable.', err)
    return []
  }
}

export async function getSymptoms() {
  const res = await axios.get(`${SYMPTOM_BASE}/symptoms`)
  return res.data?.symptoms || []
}

export async function getAnalysisById(analysisId) {
  const res = await axios.get(`${SYMPTOM_BASE}/analyze/${analysisId}`)
  return res.data
}

export async function updateAnalysisById(analysisId, payload) {
  try {
    const res = await axios.put(`${SYMPTOM_BASE}/analyze/${analysisId}`, payload)
    return res.data
  } catch (err) {
    let errorMessage = 'Failed to update analysis'
    const data = err?.response?.data
    if (data) {
      errorMessage = data.detail?.[0]?.msg || data.detail || JSON.stringify(data)
    } else {
      errorMessage = err.message || errorMessage
    }
    throw new Error(errorMessage)
  }
}

export async function deleteAnalysisById(analysisId) {
  const res = await axios.delete(`${SYMPTOM_BASE}/analyze/${analysisId}`)
  return res.data
}

export async function clearSymptomHistory(userId) {
  const res = await axios.delete(`${SYMPTOM_BASE}/history/${userId}`)
  return res.data
}

export async function submitAnalysisFeedback(analysisId, wasAccurate) {
  const res = await axios.patch(`${SYMPTOM_BASE}/analyze/${analysisId}/feedback`, {
    was_accurate: wasAccurate
  })
  return res.data
}

export async function getSymptomStats() {
  const res = await axios.get(`${SYMPTOM_BASE}/stats`, {
    headers: { 'X-Role': 'Admin' }
  })
  return res.data
}