import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import {
  getDoctorByUserId,
  createDoctorProfile,
  updateDoctorProfile,
} from '../api/doctorApi'
import { toast } from 'sonner'
import DoctorProfileForm from '../components/DoctorProfileForm'

export default function DoctorProfilePage() {
  const { user } = useAuth()
  const userId = user?.id || user?._id

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // ================= LOAD =================
  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) {
          setLoading(false)
          return
        }

        const res = await getDoctorByUserId(userId)

        if (res.data) {
          setDoctor(res.data)
        }
      } catch {
        toast.error('Failed to load doctor profile')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  // ================= CREATE =================
  const handleCreate = async (form) => {
    setActionLoading(true)

    const res = await createDoctorProfile({
      ...form,
      userId,
    })

    if (res.data) {
      toast.success('Doctor profile created successfully')
      setDoctor(res.data)
    } else {
      toast.error(res.error)
    }

    setActionLoading(false)
  }

  // ================= UPDATE =================
  const handleUpdate = async (form) => {
    setActionLoading(true)

    const res = await updateDoctorProfile(
      doctor?.id || doctor?._id,
      form
    )

    if (res.data) {
      toast.success('Doctor profile updated successfully')
      setDoctor(res.data)
    } else {
      toast.error(res.error)
    }

    setActionLoading(false)
  }

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-gray-500 text-sm">
            Loading doctor profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Doctor Profile</h1>
        <p className="text-sm opacity-80">
          Manage your professional medical information
        </p>
      </div>

      {/* ================= USER CARD ================= */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">
          Account Information
        </h2>

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
          {doctor ? 'Update Doctor Profile' : 'Create Doctor Profile'}
        </h2>

        <DoctorProfileForm
          initialData={doctor || {}}
          onSubmit={doctor ? handleUpdate : handleCreate}
          isEdit={!!doctor}
        />

        {actionLoading && (
          <p className="text-sm text-gray-500">
            Processing...
          </p>
        )}
      </div>

      {/* ================= PROFILE SUMMARY ================= */}
      {doctor && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">
            Profile Summary
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Doctor Name</p>
              <p className="font-medium">{doctor.doctorName}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Specialization</p>
              <p className="font-medium">{doctor.specializationId}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">License Number</p>
              <p className="font-medium">{doctor.licenseNumber}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Experience</p>
              <p className="font-medium">{doctor.experience}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Department</p>
              <p className="font-medium">{doctor.department}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Consultation Fee</p>
              <p className="font-medium">{doctor.consultationFee}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Bio</p>
              <p className="font-medium">{doctor.bio}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}