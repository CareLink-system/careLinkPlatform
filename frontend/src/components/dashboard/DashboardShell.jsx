import React, { useState } from 'react';
import Sidebar from './Sidebar';
// Use Outlet so nested routes can render inside the dashboard layout
import { Outlet } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/context/AuthContext';
import { getRoleLabel, normalizeRole } from '../../features/auth/utils/roleRouting';

export default function DashboardShell() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  return (
    <div className="flex h-screen w-full bg-[#F4F7F9] font-sans text-slate-900 overflow-hidden">
      
      {/* Light Pastel Mesh Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#4B9AA8]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-100/40 blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#4B9AA8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div>
              <div className="text-[#4B9AA8] font-bold text-lg tracking-tight">CareLink</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{getRoleLabel(role)} Portal</div>
            </div>
          </div>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 active:scale-95 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-65 xl:w-70 flex-col border-r border-slate-200/60 bg-white/70 backdrop-blur-2xl z-20 shrink-0">
        <Sidebar />
      </aside>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 scroll-smooth relative w-full">
        <div className="max-w-350 mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-70 bg-white shadow-2xl border-r border-slate-200 p-0 overflow-y-auto lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 z-10 bg-slate-100 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <Sidebar close={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}