import { useState } from 'react'
import { getStatusLabel } from '../utils/statusUtils'
import { updateAppointment } from '../api/appointmentApi'
import { toast } from 'sonner'

const TYPE_STYLES = {
  General:                { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  'Follow-up':            { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  Emergency:              { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400' },
  'Lab Review':           { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  'Surgery Consultation': { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-400' },
}

const STATUS_STYLES = {
  0: { bg: 'bg-yellow-50', ring: 'ring-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  1: { bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  2: { bg: 'bg-red-50',    ring: 'ring-red-200',    text: 'text-red-700',    dot: 'bg-red-400' },
  3: { bg: 'bg-green-50',  ring: 'ring-green-200',  text: 'text-green-700',  dot: 'bg-green-400' },
  4: { bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
  5: { bg: 'bg-gray-100',  ring: 'ring-gray-200',   text: 'text-gray-500',   dot: 'bg-gray-400' },
}

const APPOINTMENT_TYPES = ['General', 'Follow-up', 'Emergency', 'Lab Review', 'Surgery Consultation']

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-none ${s.dot}`} />
      {type}
    </span>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? { bg: 'bg-gray-50', ring: 'ring-gray-200', text: 'text-gray-400', dot: 'bg-gray-300' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ${s.bg} ${s.ring} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-none ${s.dot}`} />
      {getStatusLabel(status)}
    </span>
  )
}

// ── View Modal ──────────────────────────────────────────────────
function ViewModal({ appointment: a, onClose }) {
  if (!a) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Appointment Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                #{String(a.id).padStart(4, '0')}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slot Banner */}
        <div className="mx-6 mt-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-4 py-3 flex items-center gap-4 text-white">
          <div className="bg-white/15 rounded-lg p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">
              {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-blue-100 text-xs mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {a.timeSlot}
            </p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={a.appointmentStatus} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <DetailField label="Appointment Type">
            <TypeBadge type={a.appointmentType} />
          </DetailField>
          <DetailField label="Patient Name">
            <p className="text-sm font-semibold text-gray-800">{a.patientName || '—'}</p>
          </DetailField>
          <DetailField label="Age">
            <p className="text-sm text-gray-700">{a.age || '—'}</p>
          </DetailField>
          <DetailField label="Phone">
            <p className="text-sm text-gray-700">{a.phone || '—'}</p>
          </DetailField>
          <DetailField label="Address" className="col-span-2">
            <p className="text-sm text-gray-700">{a.address || '—'}</p>
          </DetailField>
          <DetailField label="Reason for Visit" className="col-span-2">
            <p className="text-sm text-gray-700">{a.reason || <span className="italic text-gray-300">Not provided</span>}</p>
          </DetailField>
          <DetailField label="Notes" className="col-span-2">
            <p className="text-sm text-gray-700">{a.notes || <span className="italic text-gray-300">None</span>}</p>
          </DetailField>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}

// ── Edit Drawer ──────────────────────────────────────────────────
function EditDrawer({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    patientName: appointment.patientName || '',
    appointmentType: appointment.appointmentType || 'General',
    reason: appointment.reason || '',
    notes: appointment.notes || '',
    age: appointment.age || '',
    phone: appointment.phone || '',
    address: appointment.address || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await updateAppointment(appointment.id, form)
    setSaving(false)
    if (res.error) return toast.error(res.error)
    toast.success('Appointment updated')
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-md shadow-xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-none">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Appointment</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                {String(appointment.id).padStart(4, '0')}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Locked Slot Info */}
        <div className="mx-5 mt-4 flex-none">
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 flex-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Slot — cannot be changed</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">
                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="mx-1.5 text-gray-300">·</span>
                {appointment.timeSlot}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {APPOINTMENT_TYPES.map(type => (
                <label
                  key={type}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    form.appointmentType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value={type}
                    checked={form.appointmentType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex-none flex items-center justify-center ${
                    form.appointmentType === type ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {form.appointmentType === type && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                    )}
                  </span>
                  <span className={`text-xs font-semibold ${form.appointmentType === type ? 'text-blue-700' : 'text-gray-700'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              Reason for Visit <span className="text-red-400">*</span>
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Describe your reason..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              Additional Notes <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any extra info for your doctor..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Age + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Age</label>
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                type="number"
                min="0"
                max="120"
                placeholder="e.g. 28"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="e.g. +94 77 123 4567"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 42 Main Street, Colombo"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

        </form>

        {/* Footer Buttons */}
        <div className="flex-none px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Table ──────────────────────────────────────────────────
export default function AppointmentTable({ data, onCancel, onDelete, onRefresh }) {
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)

  if (!data.length) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-400">No appointments found</p>
      <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
    </div>
  )

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {['Appointment', 'Date', 'Time', 'Type', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* ID */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      {String(a.id).padStart(4, '0')}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-xs font-semibold text-gray-800">
                      {new Date(a.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                  </td>

                  {/* TIME */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-gray-400 flex-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {a.timeSlot}
                    </div>
                  </td>

                  {/* TYPE */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <TypeBadge type={a.appointmentType} />
                  </td>

                  {/* REASON */}
                  <td className="px-5 py-4 max-w-[180px]">
                    {a.reason
                      ? <span className="text-xs text-gray-600 truncate block" title={a.reason}>{a.reason}</span>
                      : <span className="text-xs text-gray-300 italic">No reason provided</span>
                    }
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={a.appointmentStatus} />
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">

                      {/* View */}
                      <button
                        onClick={() => setViewing(a)}
                        title="View details"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>

                      {/* Edit — only if Scheduled (0) */}
                      {a.appointmentStatus === 0 && (
                        <button
                          onClick={() => setEditing(a)}
                          title="Edit appointment"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}

                      {/* Cancel — only if Scheduled (0) */}
                      {a.appointmentStatus === 0 && (
                        <button
                          onClick={() => onCancel(a.id)}
                          title="Cancel appointment"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(a.id)}
                        title="Delete appointment"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewing && (
        <ViewModal appointment={viewing} onClose={() => setViewing(null)} />
      )}

      {/* Edit Drawer */}
      {editing && (
        <EditDrawer
          appointment={editing}
          onClose={() => setEditing(null)}
          onSaved={onRefresh}
        />
      )}
    </>
  )
}