import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    title: 'Real-time Video Consultations',
    description: 'Secure, high-definition telehealth sessions seamlessly integrated into your browser or mobile device.',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    className: 'md:col-span-2',
    glow: 'group-hover:bg-blue-500/10',
    // Abstract UI representation
    visual: (
      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 flex items-end gap-3 opacity-40 transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
        <div className="h-24 w-32 rounded-xl bg-slate-700 border border-white/10" />
        <div className="h-32 w-48 rounded-xl bg-slate-800 border border-white/10" />
      </div>
    )
  },
  {
    title: 'Digital Prescriptions',
    description: 'Instantly receive, manage, and forward encrypted prescriptions to your local pharmacy.',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    className: 'md:col-span-1',
    glow: 'group-hover:bg-purple-500/10',
  },
  {
    title: 'Smart Booking',
    description: 'Intelligent calendar sync with automated reminders and real-time availability routing.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    className: 'md:col-span-1',
    glow: 'group-hover:bg-emerald-500/10',
  },
  {
    title: 'AI Symptom Checker',
    description: 'Advanced machine learning models instantly triage your symptoms and recommend the precise specialist you need.',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    className: 'md:col-span-2',
    glow: 'group-hover:bg-cyan-500/10',
    // Abstract UI representation
    visual: (
      <div className="absolute right-6 bottom-0 translate-y-8 flex flex-col gap-2 opacity-40 transition-transform duration-500 group-hover:-translate-y-4">
        <div className="h-8 w-32 rounded-t-xl rounded-bl-xl bg-cyan-900/50 self-end border border-cyan-500/20" />
        <div className="h-12 w-48 rounded-t-xl rounded-br-xl bg-slate-800 self-start border border-white/10" />
      </div>
    )
  },
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
      }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-500 hover:border-white/10 ${feature.className}`}
    >
      {/* Dynamic Hover Glow */}
      <div className={`absolute inset-0 -z-10 transition-colors duration-500 ${feature.glow}`} />
      
      {/* Top right subtle gradient mesh */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/5 blur-[50px] transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 shadow-inner">
          {feature.icon}
        </div>
        
        <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">{feature.title}</h3>
        <p className="max-w-sm text-sm font-light leading-relaxed text-slate-400">
          {feature.description}
        </p>

        {feature.visual}
      </div>
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" className="relative py-24 bg-[#050711] overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 md:w-2/3"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-cyan-400"></span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Platform Features</p>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Everything you need for <span className="text-slate-400">modern healthcare.</span>
          </h2>
        </motion.div>

        <motion.div 
          ref={ref}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } }
          }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]"
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}