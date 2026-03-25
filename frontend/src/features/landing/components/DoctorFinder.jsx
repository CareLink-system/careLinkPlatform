import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const specialties = [
  {
    specialty: 'General Practitioner',
    doctor: 'Dr. Amelia Hart',
    availability: 'Available Today',
  },
  {
    specialty: 'Pediatrician',
    doctor: 'Dr. Noah Rivera',
    availability: 'Next Slot: 10:30 AM',
  },
  {
    specialty: 'Psychiatrist',
    doctor: 'Dr. Sophia Chen',
    availability: 'Available Tomorrow',
  },
]

export default function DoctorFinder() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [maxDrag, setMaxDrag] = useState(0)

  useEffect(() => {
    const calculateMaxDrag = () => {
      if (!viewportRef.current || !trackRef.current) return

      const viewportWidth = viewportRef.current.offsetWidth
      const trackWidth = trackRef.current.scrollWidth
      setMaxDrag(Math.max(trackWidth - viewportWidth, 0))
    }

    calculateMaxDrag()
    window.addEventListener('resize', calculateMaxDrag)

    return () => {
      window.removeEventListener('resize', calculateMaxDrag)
    }
  }, [])

  return (
    <section id="find-doctors" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1649FF]">Doctor Finder</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1F2937] md:text-4xl">
              Browse Doctors by Specialty
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[#1F2937]/70 md:text-base">
              Drag to explore available specialists and connect with the right doctor for your care needs.
            </p>
          </div>
        </div>

        <div ref={viewportRef} className="overflow-hidden rounded-3xl border border-[#1F2937]/10 bg-white/70 p-3 backdrop-blur">
          <motion.div
            ref={trackRef}
            className="flex cursor-grab gap-4 active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -maxDrag, right: 0 }}
            dragElastic={0.08}
            whileTap={{ cursor: 'grabbing' }}
          >
            {specialties.map((item) => (
              <motion.article
                key={item.specialty}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="min-w-[280px] rounded-2xl border border-[#1F2937]/10 bg-white px-5 py-6 shadow-[0_12px_28px_-16px_rgba(31,41,55,0.45)]"
              >
                <div className="mb-4 inline-flex rounded-full bg-[#1649FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#1649FF]">
                  {item.specialty}
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937]">{item.doctor}</h3>
                <p className="mt-2 text-sm text-[#1F2937]/65">{item.availability}</p>
                <button className="mt-6 inline-flex rounded-full border border-[#1649FF]/25 px-4 py-2 text-sm font-medium text-[#1649FF] transition-colors hover:bg-[#1649FF] hover:text-white">
                  View Profile
                </button>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
