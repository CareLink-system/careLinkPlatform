import React, { useRef, useEffect, useState } from 'react'
import { useInView, useMotionValue, animate } from 'framer-motion'

const stats = [
  { label: 'Patients', end: 10000, type: 'kplus' },
  { label: 'Doctors', end: 1500, type: 'plus' },
  { label: 'Trust', end: 98, type: 'percent' },
  { label: 'Partners', end: 50, type: 'plus' },
]

function formatValue(type, value) {
  if (type === 'kplus') {
    const k = Math.floor(value / 1000)
    return `${k}k+`
  }
  if (type === 'percent') return `${Math.round(value)}%`
  if (type === 'plus') return `${Math.round(value)}+`
  return value
}

function StatItem({ end, label, type }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const m = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsub = m.on('change', (v) => setDisplay(v))
    return unsub
  }, [m])

  useEffect(() => {
    if (inView) {
      const controls = animate(m, end, { duration: 1.6, ease: 'easeOut' })
      return () => controls.stop()
    }
  }, [inView, end, m])

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div aria-live="polite" className="text-3xl md:text-4xl font-extrabold text-primary">
        {formatValue(type, display)}
      </div>
      <div className="mt-1 text-sm text-primary/70">{label}</div>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <StatItem key={s.label} end={s.end} label={s.label} type={s.type} />
          ))}
        </div>
      </div>
    </section>
  )
}
