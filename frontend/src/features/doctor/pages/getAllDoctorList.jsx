import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { getStoredAuth } from '../../auth/api/authApi'

// ✅ Axios instance
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

export default function GetAllDoctorList() {
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchName, setSearchName] = useState('')
  const [speciality, setSpeciality] = useState('')

  // ================= LOAD =================
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('')
        const data = Array.isArray(res.data) ? res.data : []

        setDoctors(data)
        setFiltered(data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // ================= NAME =================
  const getDoctorName = (doc) => {
    return doc.doctorName || 'Unknown Doctor'
  }

  // ================= FILTER =================
  useEffect(() => {
    let result = [...doctors]

    if (searchName) {
      result = result.filter((d) =>
        getDoctorName(d).toLowerCase().includes(searchName.toLowerCase())
      )
    }

    if (speciality) {
      result = result.filter((d) =>
        (d.specializationId || '')
          .toLowerCase()
          .includes(speciality.toLowerCase())
      )
    }

    setFiltered(result)
  }, [searchName, speciality, doctors])

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-14 h-14 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Find Your Doctor
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Search, explore, and book appointments easily
          </p>
        </div>

        <div className="mt-4 md:mt-0 text-sm opacity-80">
          {filtered.length} doctors available
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow-sm grid md:grid-cols-2 gap-4">

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search doctor name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border p-3 pl-4 rounded-xl w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="🩺 Filter by speciality..."
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            className="border p-3 pl-4 rounded-xl w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* ================= LIST ================= */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">😕 No doctors found</p>
          <p className="text-sm text-gray-300 mt-1">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((doc) => {
            const doctorName = getDoctorName(doc)
            const doctorId = doc.id || doc._id

            return (
              <div
                key={doctorId}
                className="group bg-white/90 backdrop-blur border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between hover:-translate-y-1"
              >

                {/* TOP */}
                <div className="space-y-3">

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {doctorName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Dr. {doctorName}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {doc.user?.email || 'No email'}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {doc.specializationId || 'General'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      {doc.department || 'General'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>🪪 License: {doc.licenseNumber || 'N/A'}</p>
                    <p>⏳ Experience: {doc.experience || '0'} years</p>
                    <p className="font-semibold text-green-600">
                      💰 Rs. {doc.consultationFee || 0}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {doc.bio || 'No bio available'}
                  </p>
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => {
                    if (!doctorId) {
                      toast.error('Invalid doctor ID')
                      return
                    }

                    navigate(`/doctor/${doctorId}/availability`)
                  }}
                  className="mt-6 w-full bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition"
                >
                  View Availability
                </button>
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}