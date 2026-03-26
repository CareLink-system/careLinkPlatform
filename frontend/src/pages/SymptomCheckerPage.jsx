import React, { useState } from 'react'
import { analyzeSymptoms } from '../api/symptomChecker'

// Try to use a useAuth hook if available, otherwise fallback to localStorage
let useAuth
try {
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require
  useAuth = require('../hooks/useAuth').default
} catch (e) {
  useAuth = null
}

export default function SymptomCheckerPage() {
  const auth = useAuth ? useAuth() : null
  const userId = auth?.user?.id || localStorage.getItem('user_id') || 'anonymous'

  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeSymptoms({ user_id: userId, description })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: '#06454f' }}>
        Symptom Checker
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">Describe your symptoms</label>
        <textarea
          className="w-full rounded-lg border-gray-200 p-3 shadow-sm resize-y"
          rows={5}
          placeholder="e.g. I have a headache and a mild fever"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-md text-white font-medium"
            style={{ background: '#4B9AA8' }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : null}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>

          <div className="text-sm text-gray-600">Signed in as <span className="font-medium">{userId}</span></div>
        </div>
      </form>

      {error ? (
        <div className="mt-4 text-red-600">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-6 p-5 rounded-lg shadow-md border" style={{ borderColor: '#e6f6f6' }}>
          <h2 className="text-xl font-semibold mb-2">Here’s what I found</h2>
          <p className="text-sm text-gray-700 mb-4">We provide an AI-assisted suggestion — this does not replace professional medical advice.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded shadow-sm">
              <div className="text-sm text-gray-500">Predicted condition</div>
              <div className="mt-1 text-lg font-semibold">{result.predicted_condition}</div>
            </div>

            <div className="p-4 bg-white rounded shadow-sm">
              <div className="text-sm text-gray-500">Confidence</div>
              <div className="mt-1 text-lg font-semibold">{Math.round((result.confidence ?? 0) * 100)}%</div>
            </div>

            <div className="p-4 bg-white rounded shadow-sm md:col-span-2">
              <div className="text-sm text-gray-500">Recommended specialty</div>
              <div className="mt-1 text-lg font-semibold">{result.recommended_specialty || 'General Practitioner'}</div>
            </div>

            <div className="p-4 bg-white rounded shadow-sm md:col-span-2">
              <div className="text-sm text-gray-500">AI feedback</div>
              <div className="mt-1 text-gray-700">{result.ai_feedback}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
