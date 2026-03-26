import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden font-sans text-slate-900">
      
      {/* Light Pastel Mesh Background (Replaces pure white for better glassmorphism) */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-100/40 blur-[120px]" />
      </div>

      {/* Mobile header (Glassmorphic) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#1649FF]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div className="text-[#1649FF] font-bold text-lg">CareLink</div>
          </div>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 rounded-lg bg-white shadow-sm border border-slate-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="pt-20 lg:pt-6 pb-12">
        <div className="max-w-[1400px] mx-auto lg:px-8 px-4">
          <div className="lg:flex lg:gap-8">
            
            {/* Sidebar - Desktop Sticky */}
            <aside className="hidden lg:block lg:w-[260px] flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)]">
              <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <ContentArea />
            </main>
            
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-slate-200/50 p-6 overflow-y-auto lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <Sidebar close={() => setOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}