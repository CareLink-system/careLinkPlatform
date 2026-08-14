import React from 'react'

export default function SlotCard({
  slot,
  mode = 'patient',
  onBook,
  onEdit,
  onDelete,
}) {
  const formattedDate = slot.slotDate
    ? new Date(slot.slotDate).toDateString()
    : 'No Date'

  const isBooked = slot.isBooked

  return (
    <div className="group bg-white/90 backdrop-blur border rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">

      {/* ===== TOP ===== */}
      <div className="space-y-3">

        {/* Date */}
        <div>
          <p className="text-sm text-gray-400">📅 Date</p>
          <p className="font-semibold text-[#2f7f8d] text-lg">
            {formattedDate}
          </p>
        </div>

        {/* Time */}
        <div>
          <p className="text-sm text-gray-400">⏰ Time</p>
          <p className="text-gray-700 font-medium">
            {slot.startTime} – {slot.endTime}
          </p>
        </div>

        {/* Day */}
        <div className="text-xs text-gray-400">
          {slot.dayOfWeek}
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
              isBooked
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {isBooked ? 'Booked' : 'Available'}
          </span>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      {mode === 'patient' && (
        <button
          onClick={() => onBook?.(slot)}
          disabled={isBooked}
          className={`mt-5 w-full py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            isBooked
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#4B9AA8] to-[#6EC7D4] text-white hover:scale-[1.03] active:scale-[0.97] shadow-md hover:shadow-lg'
          }`}
        >
          {isBooked ? 'Already Booked' : 'Book Appointment'}
        </button>
      )}

      {mode === 'doctor' && (
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onEdit?.(slot)}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 transition"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete?.(slot)}
            className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}