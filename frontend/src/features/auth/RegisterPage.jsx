import React from 'react'
import Navbar from '../../components/ui/Navbar'
import FrameSvg from '../../assets/auth/Frame 5.svg'
import AuthSvg from '../../assets/auth/auth.svg'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-lg rounded-xl overflow-hidden">
          {/* Left frame with images */}
          <div className="relative hidden md:block bg-slate-100">
            <img src={FrameSvg} alt="frame" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={AuthSvg} alt="auth art" className="max-w-[420px]" />
            </div>
          </div>

          {/* Right: white card with empty form area */}
          <div className="bg-white p-8 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Create an account</h2>
              <p className="text-sm text-slate-500 mb-6">Join CareLink — create your account</p>

              {/* Empty form placeholder - kept intentionally empty for wiring later */}
              <div className="h-64 rounded-md border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                Form goes here
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
