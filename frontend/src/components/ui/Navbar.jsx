import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../../features/auth/context/AuthContext';

const navLinks = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'doctors', label: 'Find Doctors', href: '#find-doctors' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);
    const { isAuthenticated, user } = useAuth();
    const { scrollY } = useScroll();

    // Dynamically change navbar styling based on scroll position
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <Motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed top-0 left-0 z-50 w-full flex justify-center pt-4 px-4 pointer-events-none"
        >
            <div className="w-full max-w-6xl pointer-events-auto flex flex-col items-center">
                {/* Main Navbar Container */}
                <Motion.div
                    initial={{
                        width: '100%',
                        maxWidth: '1152px',
                        backgroundColor: 'rgba(15, 23, 42, 0)',
                        boxShadow: '0 0px 0px 0px rgba(0,0,0,0)',
                        borderColor: 'rgba(255, 255, 255, 0)',
                    }}
                    animate={{
                        width: "100%",
                        maxWidth: isScrolled ? "800px" : "1152px",
                        backgroundColor: isScrolled ? "rgba(15, 23, 42, 0.75)" : "rgba(15, 23, 42, 0)", // Transparent to Slate-900
                        boxShadow: isScrolled
                            ? "0 20px 40px -15px rgba(0,0,0,0.5)"
                            : "0 0px 0px 0px rgba(0,0,0,0)",
                        borderColor: isScrolled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)"
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="flex items-center justify-between rounded-full border px-4 py-2.5 backdrop-blur-xl transition-all"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 z-10 pl-2">
                        <Motion.img 
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5, ease: "backOut" }}
                            src="/favicon.ico" 
                            alt="CareLink" 
                            className="h-8 w-8 rounded object-contain" 
                        />
                        <span className="font-bold text-lg tracking-tight text-white">CareLink</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
                        {navLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.href}
                                onMouseEnter={() => setHoveredTab(link.id)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className="relative px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                            >
                                {hoveredTab === link.id && (
                                    <Motion.span
                                        layoutId="nav-pill"
                                        className="absolute inset-0 z-[-1] rounded-full bg-white/10 shadow-sm border border-white/5"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-3 z-10">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/"
                                    className="hidden md:inline-flex items-center justify-center rounded-full bg-transparent border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/"
                                    className="hidden md:inline-flex items-center justify-center rounded-full bg-[#1649FF] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(22,73,255,0.4)] hover:scale-105 active:scale-95"
                                >
                                    {user?.firstName ? `${user.firstName} Profile` : 'Profile'}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/auth/login"
                                    className="hidden md:inline-flex items-center justify-center rounded-full bg-transparent border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                                >
                                    Log in
                                </Link>

                                <Link
                                    to="/auth/register"
                                    className="hidden md:inline-flex items-center justify-center rounded-full bg-[#1649FF] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(22,73,255,0.4)] hover:scale-105 active:scale-95"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button - Dark Theme */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex md:hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
                        >
                            <Motion.div animate={{ rotate: isOpen ? 45 : 0 }} className="absolute h-0.5 w-4 bg-current" style={{ y: isOpen ? 0 : -4 }} />
                            <Motion.div animate={{ opacity: isOpen ? 0 : 1 }} className="absolute h-0.5 w-4 bg-current" />
                            <Motion.div animate={{ rotate: isOpen ? -45 : 0 }} className="absolute h-0.5 w-4 bg-current" style={{ y: isOpen ? 0 : 4 }} />
                        </button>
                    </div>
                </Motion.div>

                {/* Mobile Dropdown Menu - Dark Theme */}
                <AnimatePresence>
                    {isOpen && (
                        <Motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 10, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden mt-2"
                        >
                            <nav className="flex flex-col gap-1 text-sm font-medium text-slate-300">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block rounded-xl px-4 py-3 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <div className="h-px w-full bg-slate-700/50 my-2" />
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/"
                                            onClick={() => setIsOpen(false)}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1649FF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                                        >
                                            {user?.firstName ? `${user.firstName} Profile` : 'Profile'}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/auth/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                                        >
                                            Log in
                                        </Link>

                                        <Link
                                            to="/auth/register"
                                            onClick={() => setIsOpen(false)}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1649FF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Motion.header>
    );
};

export default Navbar;