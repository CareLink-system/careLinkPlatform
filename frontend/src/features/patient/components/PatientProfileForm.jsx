import React, { useState } from 'react'

export default function PatientProfileForm({ initialData = {}, onSubmit, isEdit }) {
  const [form, setForm] = useState({
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    bloodGroup: initialData.bloodGroup || '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const Input = ({ ...props }) => (
    <input
      {...props}
      className="
        w-full h-11 px-3 text-sm
        rounded-xl border border-slate-200 bg-slate-50
        outline-none transition
        focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/20
      "
    />
  )

  return (
    <div className="flex justify-center w-full">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-xl
          bg-white border border-slate-100
          rounded-2xl shadow-xl
          p-6 sm:p-8 space-y-5
        "
      >
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Update Patient Profile' : 'Create Patient Profile'}
          </h2>
          <p className="text-sm text-slate-500">
            Manage your medical profile information securely
          </p>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">
              Full Name
            </label>
            <Input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-slate-600">
              Phone Number
            </label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-xs font-medium text-slate-600">
              Date of Birth
            </label>
            <Input
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              type="date"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-slate-600">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="
                w-full h-11 px-3 text-sm
                rounded-xl border border-slate-200 bg-slate-50
                focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/20
              "
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="text-xs font-medium text-slate-600">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="
                w-full h-11 px-3 text-sm
                rounded-xl border border-slate-200 bg-slate-50
                focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/20
              "
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="
            w-full h-11 mt-2
            bg-gradient-to-r from-[#06b6d4] to-[#1649FF]
            text-white font-semibold text-sm
            rounded-xl shadow-md
            hover:scale-[1.01] transition
            cursor-pointer
          "
        >
          {isEdit ? 'Update Patient Profile' : 'Create Patient Profile'}
        </button>
      </form>
    </div>
  )
}