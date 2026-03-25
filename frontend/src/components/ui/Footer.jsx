import React from 'react';
import { motion } from 'framer-motion';
import Grainient from './Grainient'; // Adjust import path if needed

const Footer = () => {
  return (
    // Removed the solid background color to let the Grainient be the base
    <footer className="relative overflow-hidden text-white pt-24 border-t border-white/10">
      
      {/* Dark Premium Grainient Background */}
      <div className="absolute inset-0 -z-30">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Grainient
            color1="#030712" // Deepest slate/black
            color2="#0f172a" // Slate 900
            color3="#0284c7" // Deep Sky Blue (mixes to create a rich glow)
            timeSpeed={0.15}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={4}
            warpSpeed={1.5}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.7} 
            rotationAmount={300}
            noiseScale={2}
            grainAmount={0.08}
            grainScale={2}
            grainAnimated={true} // Added subtle animation
            contrast={1.2}
            gamma={1}
            saturation={1.2}
            centerX={0}
            centerY={0}
            zoom={1.5}
          />
        </div>
      </div>

      {/* Replaced full overlay with a bottom gradient fade for smooth edge blending */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#050711] via-[#050711]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 pb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/favicon.ico" alt="CareLink" className="h-8 w-8 rounded object-contain" />
              <span className="font-bold text-xl tracking-tight text-white">CareLink</span>
            </div>
            <p className="text-slate-400 font-light leading-relaxed max-w-sm mb-8">
              Seamless healthcare booking, HD video consultations, and AI-driven insights—all in one secure, unified platform.
            </p>
            <div className="flex items-center gap-4">
              {/* Premium Social Icons */}
              <a href="#" aria-label="Twitter" className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:-translate-y-1">
                <svg className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:-translate-y-1">
                <svg className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:-translate-y-1">
                <svg className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Columns with Hover Micro-interactions */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">About Us</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Careers</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Press</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-6">Services</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Find a Doctor</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Book Appointment</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Telemedicine</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">AI Symptom Check</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Privacy Policy</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Terms of Service</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Security</a></li>
              <li><a href="#" className="inline-block transition-transform hover:translate-x-1 hover:text-cyan-400">Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Massive Brand Watermark with Gradient Clip */}
        <div className="border-t border-white/10 pt-12 pb-8 overflow-hidden relative">
          <h1 className="text-[12vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-white/0 select-none text-center">
            CARELINK
          </h1>
          
          <div className="absolute bottom-8 left-0 w-full flex flex-col md:flex-row items-center justify-between text-xs font-medium text-slate-500">
            <p>© {new Date().getFullYear()} CareLink. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Designed for care, built with precision.</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;