import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { getStoredAuth } from '../../auth/api/authApi'

// ✅ Create axios instance (consistent with your project style)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/doctors',
})

// 🔐 Attach JWT automatically
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

  // ================= LOAD DOCTORS =================
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

  // ================= GET DOCTOR NAME =================
  const getDoctorName = (doc) => {
    return doc.doctorName || 'Unknown Doctor'
  }

  // ================= FILTER =================
  useEffect(() => {
    let result = [...doctors]

    if (searchName) {
      result = result.filter((d) =>
        getDoctorName(d)
          .toLowerCase()
          .includes(searchName.toLowerCase())
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Find Doctors</h1>
        <p className="text-sm opacity-80">
          Search doctors and book appointments
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Search doctor name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          type="text"
          placeholder="Filter by speciality..."
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* ================= DOCTOR LIST ================= */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No doctors found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((doc) => {
            const doctorName = getDoctorName(doc)
            const doctorId = doc.id || doc._id // ✅ safe fallback

            return (
              <div
                key={doctorId}
                className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-5 flex flex-col justify-between"
              >

                {/* ================= TOP ================= */}
                <div className="space-y-2">

                  <h2 className="text-lg font-bold text-gray-800">
                    Dr. {doctorName}
                  </h2>

                  <p className="text-xs text-gray-400">
                    {doc.user?.email || 'No email available'}
                  </p>

                  <span className="inline-block text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {doc.specializationId || 'General'}
                  </span>

                  <p className="text-sm text-gray-500">
                    License: {doc.licenseNumber || 'N/A'}
                  </p>

                  <p className="text-sm text-gray-500">
                    Department: {doc.department || 'General'}
                  </p>

                  <p className="text-sm text-gray-500">
                    Experience: {doc.experience || '0'} years
                  </p>

                  <p className="text-sm font-semibold text-green-600">
                    Fee: Rs. {doc.consultationFee || 0}
                  </p>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {doc.bio || 'No bio available'}
                  </p>
                </div>

                {/* ================= BUTTON ================= */}
                <button
                  onClick={() => {
                    if (!doctorId) {
                      toast.error('Invalid doctor ID')
                      return
                    }

                    // ✅ LINK TO SLOTS PAGE (THIS IS THE IMPORTANT PART)
                    navigate(`/doctor/${doctorId}/availability`)
                  }}
                  className="mt-5 w-full bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white py-2 rounded-lg font-semibold hover:scale-[1.02] transition"
                >
                  View Availability Slots
                </button>

              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}