import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import {
  getPatientByUserId,
  createPatientProfile,
  updatePatientProfile,
} from '../api/patientApi'
import { toast } from 'sonner'

export default function PatientProfilePage() {
  const { user } = useAuth()

  const userId = user?.id || user?._id

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
  })

  // ================= LOAD =================
  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) {
          setLoading(false)
          return
        }

        const res = await getPatientByUserId(userId)

        if (res.data) {
          setPatient(res.data)

          setForm({
            fullName: res.data.fullName || '',
            phone: res.data.phone || '',
            dateOfBirth: res.data.dateOfBirth || '',
            gender: res.data.gender || '',
            bloodGroup: res.data.bloodGroup || '',
          })
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ================= CREATE =================
  const handleCreate = async () => {
    setActionLoading(true)

    const res = await createPatientProfile({
      ...form,
      userId,
    })

    if (res.data) {
      toast.success('Profile created successfully')
      setPatient(res.data)
    } else {
      toast.error(res.error)
    }

    setActionLoading(false)
  }

  // ================= UPDATE =================
  const handleUpdate = async () => {
    setActionLoading(true)

    const res = await updatePatientProfile(patient.id || patient._id, form)

    if (res.data) {
      toast.success('Profile updated successfully')
      setPatient(res.data)
    } else {
      toast.error(res.error)
    }

    setActionLoading(false)
  }

  // ================= LOADING UI (FIXED) =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          
          {/* Spinner */}
          <div className="w-12 h-12 border-1 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          {/* Text */}
          <p className="text-gray-500 text-sm">Loading patient profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <p className="text-sm opacity-80">Manage your personal health information</p>
      </div>

      {/* ================= USER CARD ================= */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Role</p>
            <p className="font-medium">{user?.role}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Name</p>
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* ================= PROFILE FORM ================= */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">
          {patient ? 'Update Patient Profile' : 'Create Patient Profile'}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="border p-3 rounded-lg w-full"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
              setForm({ ...form, phone: value })
            }}
            placeholder="Phone (10 digits)"
            className="border p-3 rounded-lg w-full"
          />

          <input
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            type="date"
            className="border p-3 rounded-lg w-full"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-4">
          {!patient ? (
            <button
              onClick={handleCreate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Patient Profile'}
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={actionLoading}
              className="bg-[#1649FF] hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Update Patient Profile'}
            </button>
          )}
        </div>
      </div>

      {/* ================= MERGED VIEW ================= */}
      {patient && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">
            Complete Profile Summary
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">User Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Full Name</p>
              <p className="font-medium">{patient.fullName}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{patient.phone}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gender</p>
              <p className="font-medium">{patient.gender}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Blood Group</p>
              <p className="font-medium">{patient.bloodGroup}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-medium">{patient.dateOfBirth}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}