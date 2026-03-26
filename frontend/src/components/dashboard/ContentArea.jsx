import React from 'react';
import { motion } from 'framer-motion';
import DoctorsImg from '../../assets/dashboard/doctors.svg';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
};

export default function ContentArea() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Top Header Row */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Hi, Shalon</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Find doctors" 
              className="w-64 pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#1649FF]/20 focus:border-[#1649FF]"
            />
          </div>
          <button className="hidden md:block bg-[#1649FF] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors">
            Search
          </button>
          
          <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />
          
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FB]" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer bg-white py-1.5 pl-2 pr-4 rounded-full border border-slate-200 shadow-sm">
              <img src="https://i.pravatar.cc/100?u=shalon" alt="User" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">Shalon</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT/CENTER COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Hero Banner (Figma Match) */}
          <motion.div variants={itemVariants} className="relative bg-gradient-to-r from-[#7DA1A9] to-[#9CB8C0] rounded-3xl p-8 overflow-hidden shadow-sm h-[220px] flex items-center">
            <div className="relative z-10 max-w-[60%]">
              <h2 className="text-2xl font-bold text-white leading-snug mb-2">No need to visit local hospitals<br/>Get your consultation online</h2>
              <p className="text-white/80 text-sm mb-6 font-medium">Audio / text / video / in-person</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/40?img=1" className="w-8 h-8 rounded-full border-2 border-[#7DA1A9]" alt="doc" />
                  <img src="https://i.pravatar.cc/40?img=2" className="w-8 h-8 rounded-full border-2 border-[#7DA1A9]" alt="doc" />
                  <img src="https://i.pravatar.cc/40?img=3" className="w-8 h-8 rounded-full border-2 border-[#7DA1A9]" alt="doc" />
                </div>
                <span className="text-white text-xs font-semibold">+180 doctors are online</span>
              </div>
            </div>
            {/* The absolute positioned SVG matching the Figma */}
            <img src={DoctorsImg} alt="Doctors" className="absolute right-0 bottom-0 h-[110%] object-contain object-bottom drop-shadow-xl" />
          </motion.div>

          {/* Nearby Doctors Section */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Nearby Doctors</h3>
              <a href="#" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600">View All {'>'}</a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Aline Carvalho", spec: "Heart health", dist: "1 km" },
                { name: "Nicolas Sousa", spec: "Gastrologist", dist: "1.5 km" },
                { name: "Emily Cardoso", spec: "Pediatric", dist: "2 km" }
              ].length === 0 ? (
                <div className="col-span-full bg-white/60 backdrop-blur rounded-2xl p-8 border border-slate-100 text-center">
                  <p className="text-sm text-slate-500">Looks like there are no nearby doctors available right now</p>
                </div>
              ) : (
                [
                  { name: "Aline Carvalho", spec: "Heart health", dist: "1 km" },
                  { name: "Nicolas Sousa", spec: "Gastrologist", dist: "1.5 km" },
                  { name: "Emily Cardoso", spec: "Pediatric", dist: "2 km" }
                ].map((doc, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-lg object-cover" alt="Doctor" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-[11px] text-slate-500">{doc.spec}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {doc.dist} away
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recommended Doctors (Full width bottom row) */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Recommended Doctors</h3>
              <a href="#" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600">View All {'>'}</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Amanda Clara", exp: "12", spec: "Pediatric", price: "$25" },
                { name: "Jason Shatsky", exp: "10", spec: "Surgical", price: "$35" },
                { name: "Jessie Dux", exp: "7", spec: "Gastroenterology", price: "$15" }
              ].length === 0 ? (
                <div className="col-span-full bg-white/60 backdrop-blur rounded-2xl p-8 border border-slate-100 text-center">
                  <p className="text-sm text-slate-500">No recommended doctors at the moment. Check back soon!</p>
                </div>
              ) : (
                [
                { name: "Amanda Clara", exp: "12", spec: "Pediatric", price: "$25" },
                { name: "Jason Shatsky", exp: "10", spec: "Surgical", price: "$35" },
                { name: "Jessie Dux", exp: "7", spec: "Gastroenterology", price: "$15" }
              ].map((doc, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-12 h-12 rounded-full object-cover bg-slate-100" alt="Doctor" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-500">specialist | {doc.exp} years experience</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded text-[10px] font-semibold">{doc.spec}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-5 px-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Tue, Thu
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 ml-5">10:00 AM - 01:00 PM</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{doc.price}</div>
                      <div className="text-[10px] text-slate-400">Starting</div>
                    </div>
                  </div>
                  
                  <button className="mt-auto w-full py-2.5 bg-[#4B9AA8] hover:bg-[#3d8390] text-white text-xs font-semibold rounded-xl transition-colors">
                    Book an appointment
                  </button>
                </div>
              ))
              )}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Upcoming Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm h-full flex flex-col">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
              <a href="#" className="text-xs font-semibold text-emerald-500 hover:text-emerald-600">View All {'>'}</a>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">June 2023</span>
              <div className="flex gap-2 text-slate-400">
                <svg className="w-4 h-4 cursor-pointer hover:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <svg className="w-4 h-4 cursor-pointer hover:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 flex-1">
              {[
                { date: "14", day: "Fri", doc: "Dr. Ashton Cleve", active: true },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false }
              ].length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No appointments scheduled yet</p>
                  <p className="text-xs text-slate-300 mt-1">Book your first consultation</p>
                </div>
              ) : (
                [
                { date: "14", day: "Fri", doc: "Dr. Ashton Cleve", active: true },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false },
                { date: "15", day: "Sat", doc: "Dr. Ashton Cleve", active: false }
              ].map((apt, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors ${apt.active ? 'bg-[#FFF0F2] border border-red-100' : 'hover:bg-slate-50'}`}>
                  
                  <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl ${apt.active ? 'bg-white text-red-500 shadow-sm' : 'bg-slate-50 text-slate-500'}`}>
                    <span className="text-[10px] font-semibold uppercase">{apt.day}</span>
                    <span className="text-lg font-bold leading-none">{apt.date}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{apt.doc}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">10:00am - 10:30am</p>
                  </div>
                  
                  <svg className={`w-4 h-4 ${apt.active ? 'text-red-400' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
              )}
            </div>
            
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}