import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  {
    title: 'Appointment Booking',
    description: 'Schedule visits with ease and manage appointments in one place.',
  },
  {
    title: 'Real-time Video Consultations',
    description: 'Secure HD video calls with your healthcare providers.',
  },
  {
    title: 'Digital Prescriptions',
    description: 'Receive and manage prescriptions electronically.',
  },
  {
    title: 'AI Symptom Checker',
    description: 'Get instant AI-driven guidance to triage symptoms.',
  },
]

function FeatureCard({ title, description }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className="rounded-xl border border-[#e6eefc] bg-blue-50/60 p-6 shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.98 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <h3 className="text-lg font-semibold text-[#0f1722]">{title}</h3>
      <p className="mt-2 text-sm text-[#0f1722]/75">{description}</p>
    </motion.div>
  )
}

export default function Services() {
  return (
    <section id="services" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1649FF]">Features</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1F2937] md:text-4xl">What CareLink Provides</h2>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
          <div className="md:col-span-2 md:row-span-1">
            <FeatureCard title={features[0].title} description={features[0].description} />
          </div>
          <div>
            <FeatureCard title={features[1].title} description={features[1].description} />
          </div>
          <div>
            <FeatureCard title={features[2].title} description={features[2].description} />
          </div>
          <div className="md:col-span-2 md:row-span-1">
            <FeatureCard title={features[3].title} description={features[3].description} />
          </div>
        </div>
      </div>
    </section>
  )
}
