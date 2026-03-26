import React, { useState } from 'react'
import Sidebar from './Sidebar'
import ContentArea from './ContentArea'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-cyan-600 font-bold">CareLink</div>
          </div>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 rounded-md bg-white/60 shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-700">
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto lg:px-6 px-4">
          <div className="lg:flex lg:gap-6">
            {/* Sidebar - desktop */}
            <aside className="hidden lg:block lg:w-72 sticky top-6 self-start">
              <Sidebar />
            </aside>

            {/* Content */}
            <main className="flex-1">
              <ContentArea />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 p-4">
              <div className="h-full bg-white/40 backdrop-blur-lg border border-white/20 rounded-lg p-4 shadow-xl overflow-auto">
                <Sidebar close={() => setOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
