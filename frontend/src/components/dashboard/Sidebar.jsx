import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DoctorLady from '../../assets/dashboard/doctor-lady.svg';

const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 mx-4 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-[#4B9AA8] text-white shadow-[0_4px_12px_rgba(75,154,168,0.3)] font-semibold' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`
    }
  >
    {icon && <span className="text-[1.1rem]">{icon}</span>}
    <span>{children}</span>
  </NavLink>
);

export default function Sidebar({ close }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('carelink.auth');
    navigate('/auth/login');
    if (close) close();
  };

  return (
    <div className="h-full flex flex-col py-6 relative">
      
      {/* Ghost Scroll CSS Injection */}
      <style>{`
        .ghost-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .ghost-scroll:hover {
          scrollbar-color: rgba(75, 154, 168, 0.3) transparent;
        }
        .ghost-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ghost-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ghost-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .ghost-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(75, 154, 168, 0.3);
        }
      `}</style>

      {/* Logo */}
      <div className="px-8 pb-8 flex items-center gap-2 flex-shrink-0">
        <svg className="w-7 h-7 text-[#4B9AA8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <div className="text-[#4B9AA8] font-extrabold text-2xl tracking-tight">CareLink</div>
      </div>

      {/* Scrollable Nav Section (Ghost Scroll) */}
      <nav className="flex-1 overflow-y-auto space-y-1 ghost-scroll pb-4">
        <NavItem to="/dashboard" icon="⊞">Dashboard</NavItem>
        <NavItem to="/schedule" icon="📅">Calendar</NavItem>
        <NavItem to="/profile" icon="👤">Profile</NavItem>
        <NavItem to="/find" icon="🔍">Find Doctors</NavItem>
        <NavItem to="/prescriptions" icon="📋">Prescriptions</NavItem>
        <NavItem to="/help" icon="❓">Help</NavItem>
      </nav>

      {/* Fixed Bottom Section */}
      <div className="px-6 space-y-6 mt-2 flex-shrink-0">
        
        {/* Go Pro Card */}
        <div className="relative mt-12 rounded-[1.5rem] bg-[#2C2C2C] p-5 text-center text-white shadow-xl overflow-visible">
          <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 w-[110px] pointer-events-none">
            <img src={DoctorLady} alt="Upgrade to Pro" className="w-full h-auto drop-shadow-2xl" />
          </div>
          
          <div className="mt-12 relative z-10">
            <h4 className="text-[13px] font-bold leading-snug tracking-wide">Get faster<br/>and better<br/>Healthcare</h4>
            <button className="mt-4 w-full rounded-lg bg-[#4B9AA8] py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95">
              Go Pro
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50/50 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-semibold text-sm border border-red-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </div>
    </div>
  );
}