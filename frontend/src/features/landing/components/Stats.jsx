import React, { useRef, useEffect, useState } from 'react';
import { useInView, useMotionValue, animate, motion } from 'framer-motion';

// Refined stats array for smoother animations
const stats = [
  { label: 'Patients', end: 10, suffix: 'k+' }, // Animates 0 to 10 smoothly
  { label: 'Verified Doctors', end: 1500, suffix: '+' },
  { label: 'Patient Trust', end: 98, suffix: '%' },
  { label: 'Global Partners', end: 50, suffix: '+' },
];

function StatItem({ end, label, suffix, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const m = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = m.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [m]);

  useEffect(() => {
    if (inView) {
      const controls = animate(m, end, { 
        duration: 2, 
        ease: [0.16, 1, 0.3, 1] // Premium easing curve
      });
      return () => controls.stop();
    }
  }, [inView, end, m]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
      className="relative flex flex-col items-center justify-center text-center group py-4"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm">
        {display}{suffix}
      </div>
      <div className="mt-4 text-[10px] md:text-xs font-bold tracking-[0.2em] text-cyan-400/80 uppercase">
        {label}
      </div>
      
      {/* Subtle hover glow */}
      <div className="absolute inset-0 -z-10 bg-cyan-400/0 transition-colors duration-500 group-hover:bg-cyan-400/5 rounded-2xl blur-xl" />
    </motion.div>
  );
}

export default function Stats() {
  return (
    <section className="relative z-20 pb-24 bg-[#050711]">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Premium Glassmorphic Container */}
        <div className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] px-8 py-10 shadow-[0_0_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl overflow-hidden">
          
          {/* Subtle inner glare */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          {/* Desktop Dividers applied via Tailwind's divide utilities */}
          <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-y-0 divide-x-0 md:divide-x divide-white/10 relative z-10">
            {stats.map((s, i) => (
              <StatItem 
                key={s.label} 
                end={s.end} 
                label={s.label} 
                suffix={s.suffix} 
                index={i} 
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}