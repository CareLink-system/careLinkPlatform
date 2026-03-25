import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AppDownload() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Map scroll progress to small rotation values for a 3D parallax effect
  const rotateX = useTransform(scrollYProgress, [0, 1], [6, -6])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-6, 6])
  const shadowTranslate = useTransform(scrollYProgress, [0, 1], [0, 14])

  return (
    <section ref={ref} className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          {/* Left: 3D phone mockup */}
          <div className="flex justify-center">
            <motion.div
              style={{ rotateX, rotateY }}
              className="relative perspective-1000 transform-gpu"
            >
              <motion.div
                style={{ translateY: shadowTranslate }}
                className="absolute -bottom-6 left-1/2 -z-10 h-12 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1649FF]/20 to-[#1F2937]/8 blur-3xl"
              />

              <div className="rounded-3xl border border-white/40 bg-gradient-to-tr from-white/60 to-white/40 p-1 shadow-xl">
                <div className="h-[480px] w-[240px] rounded-2xl bg-[#0f1722] overflow-hidden relative">
                  <div className="absolute inset-0 m-3 rounded-xl bg-gradient-to-b from-[#e6f0ff] to-[#ffffff] shadow-inner">
                    {/* fake app UI inside phone */}
                    <div className="flex h-full flex-col p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/90" />
                        <div className="flex-1">
                          <div className="h-3 w-3/5 rounded bg-[#e6eefc] mb-2" />
                          <div className="h-2 w-1/3 rounded bg-[#eef4ff]" />
                        </div>
                      </div>

                      <div className="mt-4 flex-1 space-y-3">
                        <div className="h-10 w-full rounded bg-white/95" />
                        <div className="h-36 w-full rounded bg-white/95" />
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-20 rounded bg-white/95" />
                          <div className="h-20 rounded bg-white/95" />
                          <div className="h-20 rounded bg-white/95" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-[#eef4ff]" />
                        <div className="h-9 w-20 rounded-full bg-[#1649FF]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Promotional text + badges */}
          <div className="flex flex-col items-start justify-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1649FF]">Mobile</h3>
            <h2 className="mt-3 text-3xl font-extrabold text-[#0f1722] sm:text-4xl md:text-5xl">Care on the go — your health, in one app</h2>
            <p className="mt-4 max-w-xl text-base text-[#1F2937]/75">Download the CareLink app to book appointments, join video consultations, and get AI-driven health insights directly from your phone.</p>

            <div className="mt-6 flex gap-4">
              <a className="inline-flex items-center gap-3 rounded-lg bg-black px-4 py-3 text-white shadow hover:scale-[1.02] transition-transform" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M7 7h10v10H7z" fill="#fff" /></svg>
                <div className="text-left text-sm">
                  <div className="text-[10px] opacity-80">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>

              <a className="inline-flex items-center gap-3 rounded-lg bg-black px-4 py-3 text-white shadow hover:scale-[1.02] transition-transform" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0"><path d="M7 7h10v10H7z" fill="#fff" /></svg>
                <div className="text-left text-sm">
                  <div className="text-[10px] opacity-80">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
