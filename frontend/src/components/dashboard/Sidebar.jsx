import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Ensure you have a valid auth context or adjust this logic
import { useAuth } from '../../features/auth/context/AuthContext'; 

// Asset imports
import GoProImg from '../../assets/dashboard/go-pro.svg';
import DoctorLady from '../../assets/dashboard/doctor-lady.svg';

const NavItem = ({ to, icon, children, close }) => (
  <NavLink
    to={to}
    onClick={close}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-[#1649FF] text-white shadow-md shadow-blue-500/20 font-semibold' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

export default function Sidebar({ close, isMobile }) {
  // const { logout } = useAuth(); // Uncomment if AuthContext is implemented
  const navigate = useNavigate();

  const handleLogout = () => {
    // logout();
    localStorage.removeItem('carelink.auth');
    navigate('/auth/login');
    if (close) close();
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Brand (Desktop only, mobile handles this in header) */}
      {!isMobile && (
        <div className="flex items-center gap-2 mb-10 px-2">
          <svg className="w-7 h-7 text-[#1649FF]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <div className="text-xl font-bold tracking-tight text-slate-900">CareLink</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem to="/dashboard" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}>Dashboard</NavItem>
        <NavItem to="/schedule" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>My Schedule</NavItem>
        <NavItem to="/find" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}>Find Doctors</NavItem>
        <NavItem to="/prescriptions" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>Digital Prescriptions</NavItem>
        <NavItem to="/labs" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}>Lab Results</NavItem>
        <NavItem to="/symptom-check" close={close} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}>AI Checker</NavItem>
      </nav>

      {/* Bottom Actions Container */}
      <div className="mt-8 space-y-6">
        
        {/* Pro Upgrade Card (Figma Match) */}
        <div className="relative mt-12 rounded-[2rem] bg-[#1E2330] p-5 text-center text-white shadow-xl overflow-visible">
          {/* Doctor Lady overlapping the top */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none">
            <img src={DoctorLady} alt="Doctor" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          
          <div className="mt-14 relative z-10">
            <h4 className="text-[15px] font-bold leading-tight">Get faster and better Healthcare</h4>
            <p className="mt-1 text-xs text-slate-400">Upgrade to CareLink Pro</p>
            <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-[#1649FF] py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
              Go Pro
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>

      </div>
    </div>
  );
}