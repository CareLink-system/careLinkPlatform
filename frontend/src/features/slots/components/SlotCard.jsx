import React from 'react'

export default function SlotCard({
  slot,
  mode = 'patient',   // 'doctor' shows Edit/Delete  |  'patient' shows Book
  onBook,
  onEdit,
  onDelete,
}) {
  const formattedDate = slot.slotDate
    ? new Date(slot.slotDate).toDateString()
    : 'No Date'

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">

      <p className="font-semibold text-blue-600">
        {formattedDate}
      </p>

      <p className="text-sm text-gray-600 mt-1">
        {slot.startTime} – {slot.endTime}
      </p>

      <p className="text-xs text-gray-400">
        {slot.dayOfWeek}
      </p>

      <p className={`text-sm mt-2 font-medium ${
        slot.isBooked ? 'text-red-500' : 'text-green-600'
      }`}>
        {slot.isBooked ? 'Booked' : 'Available'}
      </p>

      {/* ===== PATIENT ACTIONS ===== */}
      {mode === 'patient' && (
        <button
          onClick={() => onBook?.(slot)}
          disabled={slot.isBooked}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          {slot.isBooked ? 'Already Booked' : 'Book Appointment'}
        </button>
      )}

      {/* ===== DOCTOR ACTIONS ===== */}
      {mode === 'doctor' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onEdit?.(slot)}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete?.(slot)}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}