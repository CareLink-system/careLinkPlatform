import React from 'react'

const supportItems = [
  {
    title: 'Booking Appointments',
    description:
      'Use Find Doctors to choose a doctor, open availability, and book a slot that fits your schedule.',
  },
  {
    title: 'Managing Appointments',
    description:
      'Open Booked Appointments to review status, cancel upcoming visits, or track completed consultations.',
  },
  {
    title: 'Medical Reports',
    description:
      'Upload and manage your reports from Medical Reports. You can view, edit, and delete when needed.',
  },
  {
    title: 'Account & Profile',
    description:
      'Keep your Patient Profile up to date to improve booking accuracy and doctor recommendations.',
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-[#8dd9e4] to-[#4B9AA8] text-slate-900 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="text-sm text-slate-700 mt-1">
          Find quick answers and guidance for common CareLink actions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportItems.map((item) => (
          <section
            key={item.title}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="text-sm text-slate-600 mt-2">{item.description}</p>
          </section>
        ))}
      </div>

      <section className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-[#2f7f8d]">Need more help?</h2>
        <p className="text-sm text-slate-700 mt-1">
          Contact your clinic support team or use CareLink Chat from the sidebar for assistance.
        </p>
      </section>
    </div>
  )
}
