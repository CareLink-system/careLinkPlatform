import React from 'react'
import { motion } from 'framer-motion'
import DoctorsImg from '../../assets/dashboard/doctors.svg'

const stats = [
  { id: 1, label: 'Appointments', value: 12 },
  { id: 2, label: 'Records', value: 34 },
  { id: 3, label: 'Quick Find', value: 'Search doctors' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export default function ContentArea() {
  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Welcome back, Amelia</h2>
          <p className="text-sm text-slate-600">Have a healthy day — find doctors, check schedules and more</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <input className="px-3 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20" placeholder="Find doctors" />
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg">Search</button>
        </div>
      </motion.header>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <motion.div key={s.id} variants={item} className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow">
            <div className="text-sm text-slate-600">{s.label}</div>
            <div className="text-2xl font-bold mt-2">{s.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                <p className="text-sm text-slate-600">June 2023</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-md border border-white/20 bg-white/40">Prev</button>
                <button className="px-3 py-1 rounded-md border border-white/20 bg-white/40">Next</button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {/* mock schedule items */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <div className="font-semibold">Dr. Ashton Cleve</div>
                    <div className="text-sm text-slate-600">10:00am - 10:30am</div>
                  </div>
                  <div className="text-sm text-slate-700">Fri {12 + i}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Health Records</h3>
            <p className="text-sm text-slate-600 mt-2">Recent activity and records</p>
            <div className="mt-4 grid gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-white/50 rounded-lg">
                  <div className="font-medium">Lab Result #{i}</div>
                  <div className="text-sm text-slate-600">Details about the result</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex flex-col items-center">
            <img src={DoctorsImg} alt="doctors" className="w-full h-36 object-contain" />
            <h4 className="font-semibold mt-3">No need to visit local hospitals</h4>
            <p className="text-sm text-slate-600">Get your consultation online — audio/text/video/in-person</p>
          </div>

          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <h4 className="font-semibold">Recommended Doctors</h4>
            <div className="mt-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-white/50 rounded-lg">
                  <div className="font-medium">Dr. Amanda Clara</div>
                  <div className="text-sm text-slate-600">Pediatrician • 12 years exp</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </motion.section>
    </div>
  )
}
