import axios from 'axios'

export async function analyzeSymptoms(payload) {
  try {
    const res = await axios.post('http://localhost:8000/api/symptom-checker/analyze', payload)
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
  // If you don't have this endpoint yet, this will safely return an empty array
  try {
    const res = await axios.get(`http://localhost:8000/api/symptom-checker/history/${userId}`)
    return res.data
  } catch (err) {
    console.warn('History endpoint not ready yet.', err)
    return []
  }
}