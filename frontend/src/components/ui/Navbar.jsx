import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
	const [open, setOpen] = useState(false)

	return (
		<motion.header
			initial={{ y: -24, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.45, ease: 'easeOut' }}
			className="sticky top-0 z-50 w-full"
		>
			<div className="mx-auto w-full max-w-6xl px-4 pt-4">
				<div className="flex items-center gap-4 rounded-full border border-white/50 bg-white/80 px-4 py-2 shadow-[0_16px_40px_-24px_rgba(31,41,55,0.5)] backdrop-blur-xl">
					<Link to="/" className="flex items-center gap-3">
						<img src="/favicon.ico" alt="CareLink" className="h-7 w-7 rounded-md object-contain" />
						<span className="font-semibold tracking-wide text-[#1F2937]">CareLink</span>
					</Link>

					<nav className="flex-1 hidden justify-center gap-8 text-sm text-[#1F2937] md:flex">
						<a href="#home" className="group relative py-1 font-medium transition-colors hover:text-[#1649FF]">
							Home
							<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded bg-[#1649FF] transition-transform duration-300 group-hover:scale-x-100" />
						</a>
						<a href="#services" className="group relative py-1 font-medium transition-colors hover:text-[#1649FF]">
							Services
							<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded bg-[#1649FF] transition-transform duration-300 group-hover:scale-x-100" />
						</a>
						<a href="#find-doctors" className="group relative py-1 font-medium transition-colors hover:text-[#1649FF]">
							Find Doctors
							<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded bg-[#1649FF] transition-transform duration-300 group-hover:scale-x-100" />
						</a>
					</nav>

					<div className="flex items-center gap-3 ml-auto md:ml-0">
						<Link
							to="/auth/register"
							className="hidden md:inline-flex items-center rounded-full bg-[#1649FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_28px_-14px_rgba(22,73,255,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0d39d4] hover:shadow-[0_14px_32px_-14px_rgba(22,73,255,0.9)]"
						>
							Get Started
						</Link>

						<button
							aria-label={open ? 'Close menu' : 'Open menu'}
							aria-expanded={open}
							onClick={() => setOpen((s) => !s)}
							className="inline-flex items-center justify-center rounded-md bg-white/40 p-1.5 text-[#1F2937] transition-colors hover:bg-white/60 md:hidden"
						>
							<svg className={`${open ? 'hidden' : 'block'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
							<svg className={`${open ? 'block' : 'hidden'} h-5 w-5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
						</button>
					</div>
				</div>

				{open && (
					<div className="mt-2 w-full rounded-2xl border border-white/50 bg-white/85 p-3 shadow-lg backdrop-blur-xl md:hidden">
						<nav className="flex flex-col gap-2 text-sm text-[#1F2937]">
							<a onClick={() => setOpen(false)} href="#home" className="block rounded px-3 py-2 transition-colors hover:bg-white/60">Home</a>
							<a onClick={() => setOpen(false)} href="#services" className="block rounded px-3 py-2 transition-colors hover:bg-white/60">Services</a>
							<a onClick={() => setOpen(false)} href="#find-doctors" className="block rounded px-3 py-2 transition-colors hover:bg-white/60">Find Doctors</a>
							<Link onClick={() => setOpen(false)} to="/auth/register" className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#1649FF] px-4 py-2 text-sm font-medium text-white shadow">Get Started</Link>
						</nav>
					</div>
				)}
			</div>
		</motion.header>
	)
}

export default Navbar

