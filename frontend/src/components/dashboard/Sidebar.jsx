import React from 'react'
import { NavLink } from 'react-router-dom'
import GoProImg from '../../assets/dashboard/go-pro.svg'
import DoctorLady from '../../assets/dashboard/doctor-lady.svg'

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/30 transition-colors ${isActive ? 'bg-white/30 font-semibold' : 'text-slate-700'}`
    }
  >
    {children}
  </NavLink>
)

export default function Sidebar({ close }) {
  return (
    <div className="space-y-6">
      <div className="px-3">
        <div className="text-cyan-600 font-extrabold text-xl">CareLink</div>
      </div>

      <nav className="px-3 space-y-1">
        <div className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-xl p-3">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/schedule">My Schedule</NavItem>
          <NavItem to="/find">Find Doctors</NavItem>
          <NavItem to="/prescriptions">Digital Prescriptions</NavItem>
          <NavItem to="/labs">Lab Results</NavItem>
          <NavItem to="/symptom-check">AI Symptom Checker</NavItem>
          <NavItem to="/wallet">Wallet</NavItem>
        </div>
      </nav>

      {/* Go Pro Card */}
      <div className="px-3">
        <div className="relative bg-white/40 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <img src={GoProImg} alt="go-pro" className="w-full h-36 object-cover" />
          <div className="absolute inset-0 flex items-end p-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">Get faster and better Healthcare</h4>
              <p className="text-xs text-slate-700">Upgrade to CareLink Pro</p>
              <button onClick={close} className="mt-3 bg-cyan-600 text-white px-3 py-1 rounded-md text-sm">Go Pro</button>
            </div>
            <img src={DoctorLady} alt="doctor" className="w-24 -mr-4 translate-y-6" />
          </div>
        </div>
      </div>
    </div>
  )
}
