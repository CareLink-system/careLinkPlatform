import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

// Asset Imports
import heroImage from '../../../assets/hero.webp';
import dashboardImg from '../../../assets/hero-dashboard.svg';

const headline = 'Next-Gen Telemedicine, Powered by AI';

// Expanded cards to highlight actual CareLink features
const floatingCards = [
  { title: 'Video Consult', className: 'top-[10%] -left-6 md:-left-12', delay: 0 },
  { title: 'AI Symptom Check', className: 'top-[45%] -right-4 md:-right-10', delay: 0.2 },
  { title: 'Lab Results', className: 'bottom-[15%] -left-2 md:-left-8', delay: 0.4 },
];

export default function Hero() {
  const containerRef = useRef(null);

  // Scroll Parallax Effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const yDashboard = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // 3D Tilt Effect on Mouse Move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ['10deg', '-10deg']), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ['-10deg', '10deg']), springConfig);

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
      className="relative overflow-hidden px-6 pt-32 pb-24 min-h-screen flex flex-col items-center justify-start perspective-[2000px]"
    >
      {/* Background Image with Parallax Scale */}
      <motion.div
        style={{ scale: scaleBg }}
        className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${heroImage})` }} />
      </motion.div>

      {/* Advanced Glassmorphic & Gradient Overlays */}
      <div className="absolute inset-0 -z-20 bg-white/40 backdrop-blur-[2px]" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white/10 via-white/60 to-white" />
      
      {/* Animated Glowing Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] -z-10 h-[35rem] w-[35rem] rounded-full bg-[#1649FF]/20 blur-[100px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] left-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-[#1F2937]/15 blur-[100px]" 
      />

      <div className="mx-auto w-full max-w-6xl relative z-10 flex flex-col items-center">
        
        {/* Parallax Text Container */}
        <motion.div style={{ y: yText, opacity: opacityText }} className="w-full flex flex-col items-center pointer-events-none">
          
          {/* Awwwards Style Typography Reveal */}
          <motion.h1
            className="text-center text-5xl font-black leading-[1.05] tracking-tight text-[#050711] sm:text-6xl md:text-7xl lg:text-[5.5rem] max-w-5xl drop-shadow-sm"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.02, delayChildren: 0.1 } },
            }}
          >
            {headline.split(' ').map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap mr-4 overflow-hidden py-2">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={`${char}-${charIndex}`}
                    className={`inline-block ${word === 'AI' ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#1649FF] to-[#0B2699]' : ''}`}
                    variants={{
                      hidden: { y: '100%', rotate: 5, opacity: 0 },
                      show: { y: '0%', rotate: 0, opacity: 1 },
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-center text-lg text-[#1F2937]/80 md:text-xl font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Book appointments, attend real-time video consultations, and get instant AI-driven health suggestions.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div 
            className="flex items-center gap-4 mt-10 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="rounded-full bg-[#1649FF] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(22,73,255,0.6)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(22,73,255,0.7)] hover:bg-[#0B2699]">
              Book Consultation
            </button>
            <button className="rounded-full border border-[#1649FF]/30 bg-white/50 px-8 py-4 text-sm font-bold text-[#1F2937] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl">
              Try AI Checker
            </button>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Mockup Presentation */}
        <motion.div 
          style={{ y: yDashboard, rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative mx-auto mt-16 max-w-5xl w-full perspective-[2000px] z-20 pointer-events-none"
        >
          <motion.div
            className="relative rounded-[2.5rem] border border-white/60 bg-white/40 p-4 shadow-[0_40px_100px_-20px_rgba(22,73,255,0.15)] backdrop-blur-2xl md:p-6"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Dashboard Image Container */}
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-[#F8F9FB] shadow-inner">
              <img
                src={dashboardImg}
                alt="CareLink Dashboard Preview"
                className="w-full h-auto object-cover transform scale-105"
              />
              {/* Inner glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating Glassmorphic Features Cards */}
            {floatingCards.map((card, index) => (
              <motion.div
                key={card.title}
                className={`absolute ${card.className} rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-2xl backdrop-blur-xl pointer-events-auto cursor-default`}
                style={{ transformStyle: "preserve-3d", translateZ: 50 + (index * 20) }} // 3D pop out effect
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 + card.delay, type: 'spring' }}
                whileHover={{ scale: 1.05, translateZ: 80 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#1649FF] animate-pulse" />
                  <span className="text-sm font-bold tracking-wide text-[#1F2937]">{card.title}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}