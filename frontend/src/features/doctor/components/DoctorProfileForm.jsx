import React, { useState } from 'react'

const Input = (props) => (
  <input
    {...props}
    className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/20"
  />
)

export default function DoctorProfileForm({ initialData = {}, onSubmit, isEdit }) {
  const [form, setForm] = useState({
    doctorName: initialData.doctorName || '',
    specializationId: initialData.specializationId || '',
    licenseNumber: initialData.licenseNumber || '',
    qualifications: initialData.qualifications || '',
    experience: initialData.experience || '',
    bio: initialData.bio || '',
    department: initialData.department || '',
    consultationFee: initialData.consultationFee || '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      ...form,
      consultationFee: Number(form.consultationFee || 0),
    })
  }

  return (
    <div className="flex justify-center w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white border rounded-2xl shadow-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">
          {isEdit ? 'Update Doctor Profile' : 'Create Doctor Profile'}
        </h2>

        <Input
          name="doctorName"
          value={form.doctorName}
          onChange={handleChange}
          placeholder="Doctor Name"
        />

        <Input
          name="specializationId"
          value={form.specializationId}
          onChange={handleChange}
          placeholder="Specialization ID"
        />

        <Input
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          placeholder="License Number"
        />

        <Input
          name="qualifications"
          value={form.qualifications}
          onChange={handleChange}
          placeholder="Qualifications"
        />

        <Input
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="Experience"
        />

        <Input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
        />

        <Input
          name="consultationFee"
          type="number"
          value={form.consultationFee}
          onChange={handleChange}
          placeholder="Consultation Fee"
        />

        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full p-3 border rounded-xl"
        />

        <button className="w-full h-11 bg-gradient-to-r from-[#06b6d4] to-[#1649FF] text-white rounded-xl">
          {isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  )
}