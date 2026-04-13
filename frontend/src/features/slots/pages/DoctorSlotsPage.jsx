import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSlotsByDoctorId } from '../api/slotApi'
import { toast } from 'sonner'
import SlotCard from '../components/SlotCard'

export default function DoctorSlotsPage() {
  const { doctorId } = useParams()
  const navigate = useNavigate()

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

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-14 h-14 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading availability slots...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-7 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Availability Slots
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Choose a time slot and book your appointment
          </p>
        </div>

        <div className="mt-4 md:mt-0 text-sm opacity-80">
          {slots.length} slots available
        </div>
      </div>

      {/* ================= EMPTY ================= */}
      {slots.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">😕 No slots available</p>
          <p className="text-sm text-gray-300 mt-1">
            Please check back later
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              mode="patient"
              onBook={(selectedSlot) =>
                navigate('/appointments/book', {
                  state: {
                    doctorId,
                    slot: selectedSlot,
                  },
                })
              }
            />
          ))}

        </div>
      )}
    </div>
  )
}