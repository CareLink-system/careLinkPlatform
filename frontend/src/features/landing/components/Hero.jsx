import React from 'react'
import { motion } from 'framer-motion'
import heroImage from '../../../assets/hero.webp'

const headline = 'Next-Gen Telemedicine, Powered by AI'
const cards = [
  { title: 'Video Consult', className: 'top-10 -left-2 md:-left-8' },
  { title: 'AI Checker', className: 'bottom-8 left-6 md:left-20' },
  { title: 'Lab Results', className: 'top-20 -right-2 md:-right-8' },
]

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-6 pb-24 pt-28 md:pb-32 md:pt-34">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/95 via-white/88 to-white/96" />
      <div className="absolute -top-24 right-[-12rem] -z-10 h-[28rem] w-[28rem] rounded-full bg-[#1649FF]/20 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-[-10rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#1F2937]/10 blur-3xl" />

      <div className="mx-auto max-w-6xl">
        <motion.h1
          className="text-center text-[2.6rem] font-black leading-[0.92] tracking-[-0.035em] text-[#101827] drop-shadow-[0_4px_20px_rgba(255,255,255,0.6)] sm:text-6xl md:text-7xl lg:text-8xl"
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
          className="mx-auto mt-8 max-w-3xl text-center text-base text-[#1F2937]/80 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          Book appointments, attend real-time video consultations, and get instant AI-driven health suggestions.
        </motion.p>

        <div className="relative mx-auto mt-14 max-w-5xl rounded-[2.25rem] border border-white/60 bg-white/35 p-6 shadow-[0_28px_80px_-32px_rgba(16,24,39,0.55)] backdrop-blur-md md:p-9">
          <motion.div
            className="relative mx-auto max-w-4xl"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <div className="h-[280px] w-full rounded-[1.8rem] border border-white/50 bg-gradient-to-br from-[#1649FF]/10 to-[#1F2937]/10 md:h-[360px]" />
          </motion.div>

          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className={`absolute ${card.className} rounded-2xl border border-white/55 bg-white/82 px-4 py-3 shadow-xl backdrop-blur-xl`}
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
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1649FF]">{card.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
