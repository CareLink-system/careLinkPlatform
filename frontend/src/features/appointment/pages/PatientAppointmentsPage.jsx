import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import {
  getAppointmentsByPatientId,
  cancelAppointment,
  deleteAppointment,
} from '../api/appointmentApi'
import { getPatientByUserId } from '../../patient/api/patientApi'
import AppointmentTable from '../components/AppointmentTable'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Scheduled',   value: '0' },
  { label: 'Confirmed',   value: '1' },
  { label: 'Cancelled',   value: '2' },
  { label: 'Completed',   value: '3' },
  { label: 'Rescheduled', value: '4' },
  { label: 'No Show',     value: '5' },
]

export default function PatientAppointmentsPage() {
  const { user } = useAuth()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // ================= SEARCH =================
  const [search, setSearch] = useState('')

  // ================= STATUS FILTER =================
  const [statusFilter, setStatusFilter] = useState('all')

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const load = async () => {
    setLoading(true)
    const patientRes = await getPatientByUserId(user.id)
    if (!patientRes.data) { setLoading(false); return }

    const res = await getAppointmentsByPatientId(patientRes.data.id)
    if (res.data) setAppointments(res.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // ================= CANCEL =================
  const handleCancel = async (id) => {
    const res = await cancelAppointment(id)
    if (res.success) {
      toast.success('Cancelled')
      load()
    }
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const res = await deleteAppointment(id)
    if (res.success) {
      toast.success('Deleted')
      load()
    }
  }

  // ================= FILTER =================
  const filtered = appointments.filter((a) => {
    const value = search.toLowerCase()
    const matchesSearch =
      String(a.id).includes(value) ||
      (a.reason || '').toLowerCase().includes(value) ||
      (a.appointmentType || '').toLowerCase().includes(value) ||
      String(a.appointmentStatus).includes(value)

    const matchesStatus =
      statusFilter === 'all' || String(a.appointmentStatus) === statusFilter

    return matchesSearch && matchesStatus
  })

  // ================= PAGINATION LOGIC =================
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filtered.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  // ================= STATS =================
  const total      = appointments.length
  const scheduled  = appointments.filter(a => a.appointmentStatus === 0).length
  const confirmed  = appointments.filter(a => a.appointmentStatus === 1).length
  const completed  = appointments.filter(a => a.appointmentStatus === 3).length
  const cancelled  = appointments.filter(a => a.appointmentStatus === 2).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#8dd9e4] to-[#4B9AA8] text-slate-900 px-6 py-5 rounded-2xl shadow-lg">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                My Appointments
              </h1>

              <p className="text-slate-700 text-sm mt-1">
                Track and manage all your scheduled visits
              </p>
            </div>

            <button
              onClick={load}
              className="flex items-center gap-2 text-sm font-medium text-[#2f7f8d] bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-cyan-50 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>

              Refresh
            </button>
          </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total',       value: total,     bg: 'bg-white',       border: 'border-gray-200',  text: 'text-gray-800' },
            { label: 'Scheduled',   value: scheduled, bg: 'bg-yellow-50',   border: 'border-yellow-200',text: 'text-yellow-700' },
            { label: 'Confirmed',   value: confirmed, bg: 'bg-cyan-50',     border: 'border-cyan-200',  text: 'text-cyan-700' },
            { label: 'Completed',   value: completed, bg: 'bg-green-50',    border: 'border-green-200', text: 'text-green-700' },
            { label: 'Cancelled',   value: cancelled, bg: 'bg-red-50',      border: 'border-red-200',   text: 'text-red-700' },
          ].map(({ label, value, bg, border, text }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl px-4 py-3.5`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold leading-tight mt-1 ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">

          {/* Search */}
          <div className="relative w-full md:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by ID, reason, type, status..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6EC7D4] focus:border-transparent transition shadow-sm"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setCurrentPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm flex-wrap">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setStatusFilter(value); setCurrentPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === value
                    ? 'bg-[#4B9AA8] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        </div>

        {/* ── Results count ── */}
        {(search || statusFilter !== 'all') && (
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
            {search && <> for "<span className="font-semibold text-gray-600">{search}</span>"</>}
          </p>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-cyan-200 border-t-[#4B9AA8] rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Loading appointments...</p>
            </div>
          </div>
        ) : (
          <AppointmentTable
            data={currentItems}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onRefresh={load}
          />
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">

            <p className="text-xs text-gray-400">
              Page <span className="font-semibold text-gray-600">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-600">{totalPages}</span>
              <span className="mx-2 text-gray-300">·</span>
              {filtered.length} total
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === num
                        ? 'bg-[#4B9AA8] text-white shadow-sm'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}