import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { createAppointment } from '../api/appointmentApi'
import { getPatientByUserId } from '../../patient/api/patientApi'
import { toast } from 'sonner'

const APPOINTMENT_TYPES = [
  { value: 'General', icon: '🩺', desc: 'Routine checkup or general consultation' },
  { value: 'Follow-up', icon: '🔁', desc: 'Follow-up on a previous visit' },
  { value: 'Emergency', icon: '🚨', desc: 'Urgent or emergency care' },
  { value: 'Lab Review', icon: '🧪', desc: 'Review lab results with your doctor' },
  { value: 'Surgery Consultation', icon: '🏥', desc: 'Pre or post surgical consultation' },
]

export default function AppointmentFormPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    doctorId: '',
    doctorAvailabilityId: '',
    appointmentDate: '',
    timeSlot: '',
    appointmentType: 'General',
    reason: '',
    notes: '',
    age: '',
    address: '',
    phone: '',
  })

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      if (!state) return navigate('/doctors')

      const { doctorId, slot } = state
      const patientRes = await getPatientByUserId(user.id)

      if (!patientRes.data) {
        toast.error('Create patient profile first')
        return navigate('/patient/profile')
      }

      const p = patientRes.data
      setPatient(p)

      setForm({
        doctorId,
        doctorAvailabilityId: slot.id,
        appointmentDate: slot.slotDate,
        timeSlot: `${slot.startTime} - ${slot.endTime}`,
        appointmentType: 'General',
        reason: '',
        notes: '',
        age: p.age || '',
        address: p.address || '',
        phone: p.phone || '',
      })

      setLoading(false)
    }

    init()
  }, [])

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await createAppointment({
      ...form,
      patientId: patient.id,
      patientName: patient.fullName,
    })

    setSubmitting(false)

    if (res.error) return toast.error(res.error)

    toast.success('Appointment booked successfully')
    navigate('/payment', {
      state: {
        appointment: res.data,
        patientName: patient.fullName,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        appointmentType: form.appointmentType,
      },
    })
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-1 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading your details...</p>
      </div>
    </div>
  )

  const formattedDate = new Date(form.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── Top Header Bar ── */}
      <div className="flex-none flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Book Appointment</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details to confirm your booking</p>
        </div>
        {patient && (
          <div className="ml-auto flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold uppercase">
              {patient.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] text-green-500 font-medium leading-none">Booking as</p>
              <p className="text-xs text-green-800 font-bold leading-tight">{patient.fullName}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Two-Column Body ── */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex gap-4 p-5 overflow-hidden"
      >

        {/* ════ LEFT COLUMN ════ */}
        <div className="flex flex-col gap-4 w-[42%] flex-none">

          {/* Scheduled Slot */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-sm">
            <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest mb-2.5">Scheduled Slot</p>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 rounded-xl p-2.5 flex-none">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{formattedDate}</p>
                <p className="text-blue-100 text-xs mt-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {form.timeSlot}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-none">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-sm font-bold text-gray-800">Appointment Type</h2>
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              {APPOINTMENT_TYPES.map(({ value, icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
                    form.appointmentType === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value={value}
                    checked={form.appointmentType === value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-base leading-none flex-none">{icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight truncate ${form.appointmentType === value ? 'text-blue-700' : 'text-gray-800'}`}>
                      {value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug truncate">{desc}</p>
                  </div>
                  {form.appointmentType === value && (
                    <div className="ml-auto flex-none w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">

          {/* Visit Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="text-sm font-bold text-gray-800">Visit Details</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Reason for Visit <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="reason"
                  placeholder="e.g. Persistent headache for 3 days, follow-up for blood pressure..."
                  value={form.reason}
                  onChange={handleChange}
                  rows={2}
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Additional Notes <span className="text-gray-300">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  placeholder="Any extra info for your doctor — allergies, medications, symptoms..."
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Your Info</h2>
                <p className="text-[10px] text-gray-400">Pre-filled from your profile. Edit if needed.</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Age</label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                    type="number"
                    min="0"
                    max="120"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +94 77 123 4567"
                    type="tel"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 42 Main Street, Colombo"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
              }`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400">
              By confirming, you agree to the appointment terms and cancellation policy.
            </p>
          </div>

        </div>
      </form>
    </div>
  )
}