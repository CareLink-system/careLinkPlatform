import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import appImg from '../../../assets/app.webp'; // Keep your existing image import

export default function AppDownload() {
  const ref = useRef(null);
  
  // Track scroll progress relative to this section
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ['start end', 'end start'] 
  });

  // Premium 3D Parallax mappings
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const floatingCardY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="relative py-32 bg-[#050711] overflow-hidden">
      
      {/* Intense Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-[40rem] h-[40rem] -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          {/* LEFT: 3D Phone Mockup Presentation */}
          <div className="relative flex justify-center items-center perspective-[2000px] mt-10 lg:mt-0 order-2 lg:order-1">
            
            {/* The Phone */}
            <motion.div
              style={{ rotateX, rotateY, y: phoneY, transformStyle: "preserve-3d" }}
              className="relative z-10 w-[280px] md:w-[320px]"
            >
              {/* Ultra-premium glassmorphic bezel */}
              <div className="rounded-[3rem] border border-white/20 bg-white/5 p-3 shadow-[0_0_80px_rgba(34,211,238,0.15)] backdrop-blur-3xl relative">
                
                {/* Dynamic Edge Highlight */}
                <div className="absolute inset-0 rounded-[3rem] border-t border-l border-white/30 pointer-events-none" />

                {/* Inner Screen */}
                         <div className="h-[660px] md:h-[720px] w-full rounded-[2.2rem] bg-[#0F172A] overflow-hidden relative shadow-inner border border-white/10">
                  <img 
                            src={appImg}
                            alt="CareLink app interface"
                            className="h-full w-full object-cover object-top transform-gpu scale-110 -translate-y-2 opacity-90 transition-opacity duration-500 hover:opacity-100"
                  />
                  {/* Screen Glare Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
                </div>
              </div>
            </motion.div>

            {/* Floating UI Element (Creates depth) */}
            <motion.div
              style={{ y: floatingCardY, translateZ: 100 }}
              className="absolute -right-4 bottom-20 md:-right-12 z-20 flex items-center gap-4 rounded-2xl border border-white/10 border-t-white/20 bg-slate-800/80 px-5 py-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Appointment Confirmed</h4>
                <p className="text-xs font-medium text-cyan-400">Dr. Amelia Hart • Today 2:30 PM</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Promotional text + badges */}
          <div className="flex flex-col items-start justify-center order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-cyan-400"></span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">CareLink Mobile</p>
            </div>
            
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
              Care on the go — <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">in one app.</span>
            </h2>
            
            <p className="mt-6 max-w-lg text-lg text-slate-400 font-light leading-relaxed">
              Download the CareLink app to book appointments, join secure video consultations, and get AI-driven health insights directly from your pocket.
            </p>

            {/* Premium Download Badges */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a 
                href="#" 
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Apple Icon */}
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current group-hover:text-white text-slate-300 transition-colors">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.47-.63 1.58.15 2.81.74 3.65 1.88-3.12 1.82-2.62 5.86.32 7.07-.74 1.82-1.72 3.53-2.52 3.85zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.35 2.37-2.01 4.29-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Download on the</div>
                  <div className="text-lg font-bold tracking-tight">App Store</div>
                </div>
              </a>

              <a 
                href="#" 
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Google Play Icon (Simplified visually for consistency) */}
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current group-hover:text-white text-slate-300 transition-colors">
                  <path d="M4.3 2.6c-.2.2-.3.6-.3 1.1v16.6c0 .5.1.9.3 1.1l.1.1 9.4-9.4v-.2L4.4 2.5l-.1.1zM14.8 13.1l-2.6-2.6v-.2l2.6-2.6.2.1 3.1 1.7c.9.5.9 1.3 0 1.8l-3.1 1.7-.2.1zM15.4 13.7l-10.4 6 1.1 1.1 9.3-7.1zM5 3.2l10.4 6-9.3-7.1L5 3.2z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Get it on</div>
                  <div className="text-lg font-bold tracking-tight">Google Play</div>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}