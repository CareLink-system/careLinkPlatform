import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/symptom-checker'

export async function analyzeSymptoms(payload) {
  try {
    const res = await axios.post(`${BASE_URL}/analyze`, payload)
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

export async function getSymptomHistory(userId) {
  try {
    const res = await axios.get(`${BASE_URL}/history/${userId}`)
    return res.data
  } catch (err) {
    console.warn('Failed to fetch history.', err)
    return []
  }
}

export async function getSymptoms() {
  const res = await axios.get(`${BASE_URL}/symptoms`)
  return res.data?.symptoms || []
}

export async function getAnalysisById(analysisId) {
  const res = await axios.get(`${BASE_URL}/analyze/${analysisId}`)
  return res.data
}

export async function deleteAnalysisById(analysisId) {
  const res = await axios.delete(`${BASE_URL}/analyze/${analysisId}`)
  return res.data
}

export async function clearSymptomHistory(userId) {
  const res = await axios.delete(`${BASE_URL}/history/${userId}`)
  return res.data
}

export async function submitAnalysisFeedback(analysisId, wasAccurate) {
  const res = await axios.patch(`${BASE_URL}/analyze/${analysisId}/feedback`, {
    was_accurate: wasAccurate,
  })
  return res.data
}

export async function getSymptomStats(adminRole = 'Admin') {
  const res = await axios.get(`${BASE_URL}/stats`, {
    headers: {
      'X-Role': adminRole,
    },
  })
  return res.data
}