import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSlotsByDoctorId } from '../api/slotApi'
import { toast } from 'sonner'

export default function DoctorSlotsPage() {
  const { doctorId } = useParams()

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlots = async () => {
      const res = await getSlotsByDoctorId(doctorId)

      if (res.error) {
        toast.error('Failed to load slots')
      } else {
        setSlots(res.data || [])
      }

      setLoading(false)
    }

    fetchSlots()
  }, [doctorId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold text-gray-800">
        Doctor Availability Slots
      </h1>

      {slots.length === 0 ? (
        <p className="text-gray-500">No slots available</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <p className="font-semibold text-blue-600">
                {new Date(slot.slotDate).toDateString()}
              </p>

              <p className="text-sm text-gray-600">
                {slot.startTime} - {slot.endTime}
              </p>

              <p className="text-xs text-gray-400">
                {slot.dayOfWeek}
              </p>

              <p className={`text-sm mt-2 font-medium ${
                slot.isBooked ? 'text-red-500' : 'text-green-600'
              }`}>
                {slot.isBooked ? 'Booked' : 'Available'}
              </p>

              <button
                disabled={slot.isBooked}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-300"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}