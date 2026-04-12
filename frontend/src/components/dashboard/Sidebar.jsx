import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DoctorLady from '../../assets/dashboard/doctor-lady.svg';
import { useAuth } from '../../features/auth/context/AuthContext';
import { getRoleLabel, normalizeRole } from '../../features/auth/utils/roleRouting';

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
  const { logout, user } = useAuth();
  const role = normalizeRole(user?.role);

  const roleConfig = {
    patient: {
      navItems: [
        { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
        { to: '/calendar', icon: '📅', label: 'Calendar' },
        { to: '/patient-profile', icon: '👤', label: 'Patient Profile' },
        { to: '/find', icon: '🔍', label: 'Find Doctors' },
        { to: '/medical-reports', icon: '📈', label: 'Medical Reports'},
        { to: '/prescriptions', icon: '📋', label: 'Prescriptions' },
        { to: '/telemedicine/demo', icon: '🎥', label: 'Video Call' },
        { to: '/symptom-checker', label: 'Symptom Checker', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8a5 5 0 00-10 0v3"></path><path d="M7 11v2a5 5 0 005 5h0a5 5 0 005-5v-2"></path><path d="M19 18v3"></path><circle cx="19" cy="21" r="2"/></svg> },
        { to: '/help', icon: '❓', label: 'Help' },
      ],
      badge: 'Patient Care',
      headline: 'Get faster\nand better\nHealthcare',
    },
    doctor: {
      navItems: [
        { to: '/doctor-dashboard', icon: '⊞', label: 'Dashboard' },
        { to: '/doctor-dashboard', icon: '📅', label: 'Schedule' },
        { to: '/telemedicine/demo', icon: '🎥', label: 'Consultations' },
        { to: '/patients', icon: '👥', label: 'Patients' },
        { to: '/all-medical-reports', icon: '📈', label: 'Medical Reports'},
        { to: '/prescriptions', icon: '📋', label: 'Prescriptions' },
        { to: '/reports', icon: '📈', label: 'Reports' },
        { to: '/help', icon: '❓', label: 'Support' },
      ],
      badge: 'Doctor Tools',
      headline: 'Manage consultations\nand follow-ups',
    },
    admin: {
      navItems: [
        { to: '/admin-dashboard', icon: '⊞', label: 'Dashboard' },
        { to: '/admin-dashboard', icon: '👥', label: 'Users' },
        { to: '/admin-dashboard', icon: '🛡', label: 'Roles' },
        { to: '/admin-dashboard', icon: '🧾', label: 'Audit Logs' },
        { to: '/admin-dashboard', icon: '⚙', label: 'System Settings' },
        { to: '/help', icon: '❓', label: 'Support' },
      ],
      badge: 'Admin Console',
      headline: 'Oversee users\nand platform health',
    },
  }

  const config = roleConfig[role] || roleConfig.patient;

  const handleLogout = () => {
    logout();
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
      <div className="px-8 pb-8 flex items-center gap-2 shrink-0">
        <svg className="w-7 h-7 text-[#4B9AA8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <div>
          <div className="text-[#4B9AA8] font-extrabold text-2xl tracking-tight">CareLink</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{getRoleLabel(role)}</div>
        </div>
      </div>

      {/* Scrollable Nav Section (Ghost Scroll) */}
      <nav className="flex-1 overflow-y-auto space-y-1 ghost-scroll pb-4">
        {config.navItems.map((item) => (
          <NavItem key={`${item.to}-${item.label}`} to={item.to} icon={item.icon}>{item.label}</NavItem>
        ))}
      </nav>

      {/* Fixed Bottom Section */}
      <div className="px-6 space-y-6 mt-2 shrink-0 pb-8">
        
        {/* Go Pro semicircle */}
        <div className="relative mt-6 flex items-center justify-center">
          {/* Doctor image - lower so only head peeks above semicircle */}
          <div className="absolute -top-14 left-[55%] -translate-x-1/2 w-27.5 pointer-events-none">
            <img src={DoctorLady} alt="Upgrade to Pro" className="w-full h-auto drop-shadow-2xl" />
          </div>

          {/* True semicircle: use a full circle clipped by an overflow-hidden half-height container */}
          <div className="w-full max-w-55">
            <div className="h-27.5 overflow-hidden flex justify-center">
              <div className="w-55 h-55 rounded-full bg-[#2C2C2C] shadow-xl flex items-start justify-center">
                <div className="mt-12 text-center text-white px-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/60 mb-2">{config.badge}</div>
                  <h4 className="text-[13px] font-bold leading-snug tracking-wide whitespace-pre-line">{config.headline}</h4>
                  <button className="mt-3 w-32 rounded-md bg-[#4B9AA8] py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95">
                    {role === 'patient' ? 'Go Pro' : 'Open Tools'}
                  </button>
                </div>
              </div>
            </div>
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