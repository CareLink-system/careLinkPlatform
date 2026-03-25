import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

// Asset Imports
import dashboardImg from '../../../assets/hero-dashboard.svg';

const headline = 'Next-Gen Telemedicine, Powered by AI';

// Floating feature cards with icons
const floatingCards = [
  { id: 'video', title: 'Video Consult', subtitle: 'HD Secure', className: 'top-[10%] -left-6 md:-left-12', delay: 0 },
  { id: 'ai', title: 'AI Symptom Check', subtitle: 'Instant Analysis', className: 'top-[45%] -right-4 md:-right-10', delay: 0.2 },
  { id: 'lab', title: 'Lab Results', subtitle: 'Encrypted', className: 'bottom-[15%] -left-2 md:-left-8', delay: 0.4 },
];
const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
];

export default function Hero() {
  const containerRef = useRef(null);

  // 3D Tilt Effect on Mouse Move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ['6deg', '-6deg']), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ['-6deg', '6deg']), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden px-6 pt-32 pb-24 min-h-screen flex items-center bg-[#050711] perspective-[2000px]"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        
        {/* INCREASED INTENSITY: Vibrant glowing halo behind the dashboard */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[-5%] w-[55rem] h-[55rem] rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-600/30 to-purple-600/20 blur-[120px]" 
        />
      </div>

      <div className="mx-auto w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT COLUMN: Text & CTAs */}
        <motion.div className="w-full lg:col-span-5 flex flex-col text-left pointer-events-none pt-10 lg:pt-0 z-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-max mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-cyan-100 uppercase">CareLink Platform 2.0</span>
          </motion.div>

          <motion.h1
            className="text-5xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
            }}
          >
            Next-Gen <br />
            <span className="text-slate-300">Telemedicine,</span> <br />
            Powered by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
              AI.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-slate-400 font-light leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Book appointments, attend real-time video consultations, and get instant AI-driven health suggestions all in one secure place.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="w-full sm:w-auto group flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-900 transition-all hover:scale-105 hover:bg-cyan-50">
              Book Consultation
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button className="w-full sm:w-auto rounded-full border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-slate-800 hover:border-slate-600">
              Try AI Checker
            </button>
          </motion.div>

          {/* PULLED UP: Social Proof */}
          <motion.div 
            className="mt-8 flex items-center gap-4 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <img 
                  key={i} 
                  src={src} 
                  alt="Patient" 
                  className="h-10 w-10 rounded-full border-2 border-[#050711] object-cover"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-cyan-400 text-sm">★★★★★</div>
              <span className="text-xs font-medium text-slate-400">Trusted by 10k+ patients</span>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: 3D Dashboard Mockup */}
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full lg:col-span-7 relative perspective-[2000px] z-10 pointer-events-none mt-16 lg:mt-0"
        >
          <motion.div
            className="relative rounded-[2rem] border border-white/10 bg-white/[0.02] p-3 shadow-[0_0_80px_rgba(34,211,238,0.15)] backdrop-blur-3xl md:p-4"
            initial={{ opacity: 0, scale: 0.8, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#0F172A] shadow-2xl">
              <img
                src={dashboardImg}
                alt="CareLink Dashboard Preview"
                className="w-full h-auto object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />
            </div>

            {/* REFINED FLOATING CARDS: Thinner borders, simulated top-light reflection */}
            {floatingCards.map((card, index) => (
              <motion.div
                key={card.title}
                className={`absolute ${card.className} flex items-center gap-4 rounded-2xl border border-white/5 border-t-white/20 bg-slate-800/40 px-5 py-3 shadow-2xl backdrop-blur-2xl pointer-events-auto cursor-default`}
                style={{ transformStyle: "preserve-3d", translateZ: 60 + (index * 30) }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + card.delay, type: 'spring' }}
                whileHover={{ scale: 1.05, translateZ: 100, borderColor: 'rgba(34,211,238,0.4)' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg border border-white/10 shadow-inner">
                  {card.id === 'video' && (
                    <svg className="h-5 w-5 text-[#1649FF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M16 10l5-3v10l-5-3" fill="currentColor" />
                    </svg>
                  )}
                  {card.id === 'ai' && (
                    <svg className="h-5 w-5 text-[#1649FF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 12h8M8 8h8M8 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                  {card.id === 'lab' && (
                    <svg className="h-5 w-5 text-[#1649FF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2h8l-2 6v9a3 3 0 0 1-3 3 3 3 0 0 1-3-3V8L8 2z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 15h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{card.title}</h4>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400">{card.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}