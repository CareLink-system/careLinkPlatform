import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import SlotCard from '../components/SlotCard'
import {
  getSlotsByDoctorId,
  createSlot,
  updateSlot,
  deleteSlot,
  resolveDoctorId   // ✅ FIXED: added import
} from '../api/slotApi'
import { useAuth } from '../../auth/context/AuthContext'

export default function ManageSlotsPage() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    slotDate: '',
    startTime: '',
    endTime: ''
  })

  const [editingSlot, setEditingSlot] = useState(null)

  const { user } = useAuth()
  const [doctorId, setDoctorId] = useState(null)

  // ================= RESOLVE DOCTOR =================
  useEffect(() => {
    const init = async () => {
      if (!user?.id) return

      const id = await resolveDoctorId(user.id)

      if (!id) {
        toast.error('Doctor profile not found')
        return
      }

      setDoctorId(id)
    }

    init()
  }, [user])

  // ================= FETCH =================
  const fetchSlots = async (docId) => {
    if (!docId) return

    setLoading(true)

    const res = await getSlotsByDoctorId(docId)

    if (res.error) {
      toast.error('Failed to load slots')
    } else {
      setSlots(res.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (doctorId) {
      fetchSlots(doctorId)
    }
  }, [doctorId])

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!doctorId) {
      return toast.error('Doctor not ready yet')
    }

    if (!form.slotDate || !form.startTime || !form.endTime) {
      return toast.error('All fields are required')
    }

    let res

    if (editingSlot) {
      // UPDATE
      res = await updateSlot(editingSlot.id, {
        doctorId, // ✅ REQUIRED by DTO
        ...form,
        isBooked: editingSlot.isBooked,
        appointmentId: editingSlot.appointmentId
      })
    } else {
      // CREATE
      res = await createSlot({
        doctorId,   // ✅ REQUIRED by DTO
        ...form
      })
    }

    if (res.error) {
      toast.error(res.error?.message || 'Operation failed')
    } else {
      toast.success(editingSlot ? 'Slot updated' : 'Slot created')

      setForm({
        slotDate: '',
        startTime: '',
        endTime: ''
      })

      setEditingSlot(null)
      fetchSlots(doctorId)
    }
  }

  // ================= EDIT =================
  const handleEdit = (slot) => {
    setEditingSlot(slot)

    setForm({
      slotDate: slot.slotDate.split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime
    })
  }

  // ================= DELETE =================
  const handleDelete = async (slot) => {
    if (!confirm('Delete this slot?')) return

    const res = await deleteSlot(slot.id)

    if (res.error) {
      toast.error('Delete failed')
    } else {
      toast.success('Slot deleted')
      fetchSlots(doctorId)
    }
  }

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1649FF] to-[#06b6d4] text-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold">Manage Availability Slots</h1>
        <p className="text-sm opacity-80">
          Create, edit, and delete your availability
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow grid md:grid-cols-4 gap-4"
      >
        <input
          type="date"
          name="slotDate"
          value={form.slotDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button className="bg-blue-600 text-white rounded p-2">
          {editingSlot ? 'Update Slot' : 'Add Slot'}
        </button>
      </form>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : slots.length === 0 ? (
        <p>No slots found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              mode="doctor"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}