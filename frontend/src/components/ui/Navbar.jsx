import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-4 px-3 py-2 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg max-w-4xl w-full mx-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="CareLink" width={28} height={28} style={{ maxWidth: '100%', display: 'block' }} className="h-6 w-6 md:h-7 md:w-7 rounded-md object-contain" />
          <span className="text-primary font-semibold tracking-wide text-sm md:text-base">CareLink</span>
        </Link>

        <nav className="flex-1 flex justify-center gap-6 text-sm text-primary hidden md:flex">
          <a href="#home" className="hover:text-accent transition-colors">Home</a>
          <a href="#services" className="hover:text-accent transition-colors">Services</a>
          <a href="#find-doctors" className="hover:text-accent transition-colors">Find Doctors</a>
        </nav>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link to="/auth/register" className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-accent text-white text-sm font-medium shadow-lg hover:scale-[1.02] transition-transform">Get Started</Link>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="md:hidden inline-flex items-center justify-center p-1.5 rounded-md bg-white/30 text-primary hover:bg-white/40 transition-colors"
          >
            <svg className={`${open ? 'hidden' : 'block'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            <svg className={`${open ? 'block' : 'hidden'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown: positioned below header */}
      {open && (
        <div className="pointer-events-auto absolute top-[64px] left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur-md border border-white/20 rounded-xl p-3 z-40 md:hidden">
          <nav className="flex flex-col gap-2 text-sm text-primary">
            <a onClick={() => setOpen(false)} href="#home" className="block px-3 py-2 rounded hover:bg-white/30">Home</a>
            <a onClick={() => setOpen(false)} href="#services" className="block px-3 py-2 rounded hover:bg-white/30">Services</a>
            <a onClick={() => setOpen(false)} href="#find-doctors" className="block px-3 py-2 rounded hover:bg-white/30">Find Doctors</a>
            <Link onClick={() => setOpen(false)} to="/auth/register" className="mt-2 inline-flex items-center justify-center w-full px-4 py-2 rounded-full bg-accent text-white text-sm font-medium shadow">Get Started</Link>
          </nav>
        </div>
      )}
    </motion.header>
  )
}

export default Navbar
