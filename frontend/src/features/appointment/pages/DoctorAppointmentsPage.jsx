import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import {
  getAppointmentsByDoctorId,
  updateAppointmentStatus,
} from '../api/appointmentApi'
import { getDoctorByUserId } from '../../doctor/api/doctorApi'
import { getStatusLabel } from '../utils/statusUtils'
import { toast } from 'sonner'

// 🎨 Status styles
const STATUS_STYLES = {
  0: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-red-50 text-red-700 border-red-200',
  3: 'bg-green-50 text-green-700 border-green-200',
  4: 'bg-purple-50 text-purple-700 border-purple-200',
  5: 'bg-gray-100 text-gray-600 border-gray-200',
}

// ================= PAGINATION CONFIG =================
const PAGE_SIZE = 5

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // pagination state
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)

    const doctorRes = await getDoctorByUserId(user.id)

    if (!doctorRes.data) {
      toast.error('Doctor profile not found')
      setLoading(false)
      return
    }

    const res = await getAppointmentsByDoctorId(doctorRes.data.id)

    if (res.data) setAppointments(res.data)
    else toast.error(res.error)

    setLoading(false)
  }

  useEffect(() => {
    if (user?.id) load()
  }, [user])

  // ================= UPDATE =================
  const updateStatus = async (id, status) => {
    const res = await updateAppointmentStatus(id, status)

    if (!res.success) return toast.error(res.error)

    toast.success('Updated successfully')

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, appointmentStatus: status } : a
      )
    )
  }

  // ================= PAGINATION LOGIC =================
  const totalPages = Math.ceil(appointments.length / PAGE_SIZE)

  const paginatedData = appointments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const total = appointments.length
  const scheduled = appointments.filter(a => a.appointmentStatus === 0).length
  const confirmed = appointments.filter(a => a.appointmentStatus === 1).length
  const completed = appointments.filter(a => a.appointmentStatus === 3).length

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Doctor Appointments</h1>
          <p className="text-blue-100 text-sm">Manage your patient bookings</p>
        </div>

        <button
          onClick={load}
          className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50"
        >
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total" value={total} />
        <StatCard label="Scheduled" value={scheduled} color="yellow" />
        <StatCard label="Confirmed" value={confirmed} color="blue" />
        <StatCard label="Completed" value={completed} color="green" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        {appointments.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            No appointments found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3">Appointment Number</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginatedData.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">

                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        {String(a.id).padStart(4, '0')}
                      </td>

                      <td>
                        <p className="text-sm font-semibold">
                          {new Date(a.appointmentDate).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="text-gray-600">{a.timeSlot}</td>

                      <td className="font-medium text-gray-800">
                        {a.patientName || '-'}
                      </td>

                      <td className="text-gray-600">{a.appointmentType}</td>

                      <td className="max-w-[180px] truncate text-gray-500">
                        {a.reason || '—'}
                      </td>

                      <td>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLES[a.appointmentStatus]}`}>
                          {getStatusLabel(a.appointmentStatus)}
                        </span>
                      </td>

                      {/* ================= STATUS DROPDOWN ADDED ================= */}
                      <td>
                        <div className="flex items-center gap-2">
                          {(a.appointmentStatus === 0 || a.appointmentStatus === 1) && (
                            <button
                              type="button"
                              onClick={() => navigate(`/telemedicine/${a.id}`)}
                              className="text-xs border rounded px-2 py-1 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                            >
                              Start Call
                            </button>
                          )}
                          <select
                            value={a.appointmentStatus}
                            onChange={(e) =>
                              updateStatus(a.id, Number(e.target.value))
                            }
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value={0}>Scheduled</option>
                            <option value={1}>Confirm</option>
                            <option value={2}>Cancel</option>
                            <option value={3}>Complete</option>
                            <option value={4}>Reschedule</option>
                            <option value={5}>No Show</option>
                          </select>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* ================= PAGINATION UI ================= */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">

              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 text-xs bg-white border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 text-xs bg-white border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}

// STAT CARD (UNCHANGED)
function StatCard({ label, value, color = 'gray' }) {
  const colors = {
    gray: 'bg-white border-gray-200 text-gray-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${colors[color]}`}>
      <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}