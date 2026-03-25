import React from 'react'
import { motion } from 'framer-motion'
import heroImage from '../../../assets/hero.png'

const headline = 'Next-Gen Telemedicine, Powered by AI'
const cards = [
  { title: 'Video Consult', className: 'top-10 -left-2 md:-left-8' },
  { title: 'AI Checker', className: 'bottom-8 left-6 md:left-20' },
  { title: 'Lab Results', className: 'top-20 -right-2 md:-right-8' },
]

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          className="text-center text-[2.6rem] font-black leading-[0.95] tracking-[-0.03em] text-primary sm:text-6xl md:text-7xl lg:text-8xl"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.018,
                delayChildren: 0.12,
              },
            },
          }}
        >
          {headline.split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              variants={{
                hidden: { y: 34, opacity: 0, filter: 'blur(6px)' },
                show: { y: 0, opacity: 1, filter: 'blur(0px)' },
              }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mx-auto mt-7 max-w-3xl text-center text-base text-primary/75 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          Book appointments, attend real-time video consultations, and get instant AI-driven health suggestions.
        </motion.p>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <motion.div
            className="relative mx-auto w-full max-w-3xl rounded-[2rem] border border-white/50 bg-white/60 p-4 shadow-[0_20px_60px_-25px_rgba(22,73,255,0.35)] backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <img
              src={heroImage}
              alt="CareLink telemedicine dashboard"
              className="h-[320px] w-full rounded-[1.5rem] object-cover md:h-[430px]"
            />
          </motion.div>

          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className={`absolute ${card.className} rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-xl`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -9, 0] }}
              transition={{
                opacity: { duration: 0.35, delay: 0.45 + index * 0.12 },
                y: {
                  duration: 3.2 + index * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.65 + index * 0.15,
                },
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{card.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
