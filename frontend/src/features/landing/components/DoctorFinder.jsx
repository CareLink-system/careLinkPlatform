import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// Expanded data with high-quality images and social proof
const doctors = [
  {
    specialty: 'General Practitioner',
    name: 'Dr. Amelia Hart',
    availability: 'Available Today',
    rating: '4.9',
    reviews: '128',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  },
  {
    specialty: 'Pediatrician',
    name: 'Dr. Noah Rivera',
    availability: 'Next Slot: 10:30 AM',
    rating: '4.8',
    reviews: '94',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
  },
  {
    specialty: 'Psychiatrist',
    name: 'Dr. Sophia Chen',
    availability: 'Available Tomorrow',
    rating: '5.0',
    reviews: '215',
    image: 'https://images.unsplash.com/photo-1594824460734-7c91f177e486?auto=format&fit=crop&w=400&q=80',
  },
  {
    specialty: 'Cardiologist',
    name: 'Dr. Marcus Webb',
    availability: 'Available Thursday',
    rating: '4.9',
    reviews: '302',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  },
  {
    specialty: 'Dermatologist',
    name: 'Dr. Elena Rostova',
    availability: 'Available Today',
    rating: '4.7',
    reviews: '88',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=400&q=80',
  },
];

export default function DoctorFinder() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const headerRef = useRef(null);
  
  const [maxDrag, setMaxDrag] = useState(0);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });

  useEffect(() => {
    const calculateMaxDrag = () => {
      if (!viewportRef.current || !trackRef.current) return;
      const viewportWidth = viewportRef.current.offsetWidth;
      const trackWidth = trackRef.current.scrollWidth;
      setMaxDrag(Math.max(trackWidth - viewportWidth, 0));
    };

    calculateMaxDrag();
    // Recalculate on image load to ensure accurate width
    const timeoutId = setTimeout(calculateMaxDrag, 500);
    window.addEventListener('resize', calculateMaxDrag);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateMaxDrag);
    };
  }, []);

  return (
    <section id="find-doctors" className="relative py-24 bg-[#050711] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 w-[40rem] h-[40rem] -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-6 bg-cyan-400"></span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Expert Care</p>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Specialist.</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 md:text-lg font-light leading-relaxed">
              Drag to explore our network of verified, world-class doctors available for instant telehealth sessions.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 text-sm">
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Drag to explore</span>
          </div>
        </motion.div>

        {/* Carousel Viewport with Fade Edges */}
        <div className="relative -mx-6 px-6 md:mx-0 md:px-0">
          {/* Edge Gradients for smooth fade-out */}
          <div className="absolute top-0 left-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-[#050711] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-[#050711] to-transparent z-10 pointer-events-none" />

          <div ref={viewportRef} className="overflow-hidden pb-12 pt-4">
            <motion.div
              ref={trackRef}
              className="flex cursor-grab gap-6 active:cursor-grabbing w-max"
              drag="x"
              dragConstraints={{ left: -maxDrag, right: 0 }}
              dragElastic={0.1}
              whileTap={{ cursor: 'grabbing' }}
            >
              {doctors.map((item, index) => (
                <motion.article
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isHeaderInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                  whileHover={{ y: -8 }}
                  className="group relative flex w-[300px] md:w-[340px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:border-cyan-500/30 hover:bg-white/[0.05]"
                >
                  {/* Image Container */}
                  <div className="relative h-64 w-full overflow-hidden rounded-[1.5rem] bg-slate-800">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                      draggable="false"
                    />
                    {/* Image Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
                    
                    {/* Specialty Badge */}
                    <div className="absolute top-4 left-4 inline-flex rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {item.specialty}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 -mt-6 flex flex-col px-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <div className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-1 border border-white/5">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs font-bold text-white">{item.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-4">{item.reviews} reviews</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-sm font-medium text-emerald-400">{item.availability}</p>
                    </div>

                    <button className="w-full rounded-full border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-slate-900 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      View Profile
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}