import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // State for Real Data
  const [user, setUser] = useState({ firstName: 'Guest' });
  const [appointments, setAppointments] = useState([]);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH REAL DATA
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('carelink.auth');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        
        const [userRes, aptRes, nearRes, recRes] = await Promise.allSettled([
          fetch('http://localhost:5000/api/v1/users/me', { headers }),
          fetch('http://localhost:5000/api/v1/appointments/upcoming', { headers }),
          fetch('http://localhost:5000/api/v1/doctors/nearby', { headers }),
          fetch('http://localhost:5000/api/v1/doctors/recommended', { headers })
        ]);

        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          const userData = await userRes.value.json();
          setUser(userData.data || { firstName: 'Amelia' }); 
        }

        if (aptRes.status === 'fulfilled' && aptRes.value.ok) {
          const aptData = await aptRes.value.json();
          setAppointments(aptData.data || []);
        } else { setAppointments([]); } 

        if (nearRes.status === 'fulfilled' && nearRes.value.ok) {
          const nearData = await nearRes.value.json();
          setNearbyDoctors(nearData.data || []);
        } else { setNearbyDoctors([]); }

        if (recRes.status === 'fulfilled' && recRes.value.ok) {
          const recData = await recRes.value.json();
          setRecommendedDoctors(recData.data || []);
        } else { setRecommendedDoctors([]); }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Top Header Row */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6"
      >
        {/* Mobile Header grouping: Title + Mobile Profile on same row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500 mb-0.5 md:mb-1">Hi, {user.firstName || 'There'}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          </div>
          
          {/* Mobile Bell & Profile (Hidden on Desktop) */}
          <div className="flex md:hidden items-center gap-2">
            <button className="relative p-2 text-slate-400 hover:text-slate-800 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <img src="https://i.pravatar.cc/100?u=user" alt="User" className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative w-full sm:w-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Find doctors" 
              className="w-full sm:w-64 pl-11 pr-4 py-2.5 rounded-full bg-white border border-slate-200/80 shadow-[0_2px_8px_rgb(0,0,0,0.02)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/20 focus:border-[#4B9AA8] transition-all"
            />
          </div>
          <button className="hidden sm:block bg-[#4B9AA8] text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-md shadow-[#4B9AA8]/20 hover:bg-[#3c828e] transition-colors active:scale-95">
            Search
          </button>
          
          <div className="h-8 w-px bg-slate-200 hidden md:block mx-1" />
          
          {/* Desktop Bell & Profile */}
          <div className="hidden md:flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-800 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2 bg-white py-1.5 pl-1.5 pr-4 rounded-full border border-slate-100 shadow-sm">
              <img src="https://i.pravatar.cc/100?u=user" alt="User" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-bold text-slate-700">{user.firstName || 'User'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 font-medium animate-pulse">Loading Dashboard Data...</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT/CENTER COLUMN */}
          <div className="xl:col-span-8 flex flex-col gap-6 md:gap-8 min-w-0">
            
            {/* Hero Banner - Mobile Scaled Typography */}
            <motion.div variants={itemVariants} className="relative bg-gradient-to-r from-[#7DA1A9] to-[#9CB8C0] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-10 overflow-hidden shadow-sm flex items-center min-h-[180px] md:min-h-[240px]">
              <div className="relative z-10 max-w-[70%] md:max-w-[65%]">
                {/* Text scales cleanly on mobile without breaking weirdly */}
                <h2 className="text-[1.1rem] sm:text-xl md:text-3xl font-bold text-white leading-snug md:leading-tight mb-2 md:mb-3">
                  No need to visit local hospitals.<br className="hidden md:block"/>
                  <span className="md:hidden"> </span>Get your consultation online.
                </h2>
                <p className="text-white/80 text-[10px] sm:text-xs md:text-sm mb-4 md:mb-6 font-medium tracking-wide">Audio / text / video / in-person</p>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex -space-x-2 md:-space-x-3">
                    <img src="https://i.pravatar.cc/40?img=1" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-[#7DA1A9] object-cover" alt="doc" />
                    <img src="https://i.pravatar.cc/40?img=2" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-[#7DA1A9] object-cover" alt="doc" />
                    <img src="https://i.pravatar.cc/40?img=3" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-[#7DA1A9] object-cover" alt="doc" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-semibold">+180 doctors online</span>
                </div>
              </div>
              {/* Image scales down and drops opacity on small mobile to not block text */}
              <img src={DoctorsImg} alt="Doctors" className="absolute -right-8 sm:-right-4 md:right-0 bottom-0 h-[85%] sm:h-[90%] md:h-[105%] object-contain drop-shadow-2xl opacity-40 sm:opacity-60 md:opacity-100 pointer-events-none" />
            </motion.div>

            {/* Nearby Doctors Section */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Nearby Doctors</h3>
                {nearbyDoctors.length > 0 && <a href="#" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">View All {'>'}</a>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {nearbyDoctors.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[1.5rem] p-8 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No doctors nearby</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[250px]">We couldn't find any specialists in your immediate area.</p>
                  </div>
                ) : (
                  nearbyDoctors.map((doc, i) => (
                    <div key={i} className="bg-white rounded-[1.2rem] md:rounded-[1.5rem] p-4 md:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={doc.image || `https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 md:w-12 md:h-12 rounded-[0.8rem] object-cover bg-slate-50" alt="Doctor" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{doc.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{doc.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {doc.distance || '1.5 km'} away
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Recommended Doctors */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Recommended Doctors</h3>
                {recommendedDoctors.length > 0 && <a href="#" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">View All {'>'}</a>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recommendedDoctors.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[1.5rem] p-8 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No recommendations yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[250px]">Try filling out the AI Symptom Checker to get personalized recommendations.</p>
                  </div>
                ) : (
                  recommendedDoctors.map((doc, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-cyan-100 transition-colors">
                      <div className="flex items-center gap-4 mb-5">
                        <img src={doc.image || `https://i.pravatar.cc/100?img=${i+20}`} className="w-12 h-12 rounded-full object-cover bg-slate-50 border border-slate-100" alt="Doctor" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">{doc.name}</h4>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-50/80 text-cyan-600 rounded text-[10px] font-bold tracking-wide truncate max-w-full">{doc.specialty}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-5 px-1">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {doc.availableDays || 'Tue, Thu'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">${doc.consultationFee || '25'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Starting</div>
                        </div>
                      </div>
                      
                      <button className="mt-auto w-full py-2.5 bg-[#4B9AA8] hover:bg-[#3c828e] text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm shadow-[#4B9AA8]/20">
                        Book an appointment
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Upcoming Appointments */}
          <motion.div variants={itemVariants} className="xl:col-span-4 h-full">
            <div className="bg-white rounded-[2rem] p-5 sm:p-6 md:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Upcoming Appointments</h3>
                {appointments.length > 0 && <a href="#" className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">View All {'>'}</a>}
              </div>

              {/* Date Selector */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">June 2023</span>
                <div className="flex gap-2 text-slate-400">
                  <button className="p-1 hover:text-slate-800 transition-colors bg-slate-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  <button className="p-1 hover:text-slate-800 transition-colors bg-slate-50 rounded"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>

              {/* List */}
              <div className="flex flex-col gap-3">
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No appointments scheduled</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-6 max-w-[200px]">You don't have any upcoming telemedicine or in-person visits.</p>
                  </div>
                ) : (
                  appointments.map((apt, i) => {
                    const isActive = i === 0; 
                    return (
                      <div key={i} className={`flex items-center gap-4 p-3 rounded-[1.2rem] cursor-pointer transition-all ${isActive ? 'bg-[#FFF0F2] shadow-sm border border-red-50' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}>
                        
                        <div className={`flex flex-col items-center justify-center w-[56px] h-[56px] rounded-xl flex-shrink-0 ${isActive ? 'bg-white text-red-500 shadow-sm' : 'bg-[#F8F9FB] text-slate-500 border border-slate-100'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{apt.day || 'Fri'}</span>
                          <span className="text-lg font-black leading-none mt-0.5">{apt.date || '14'}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{apt.doctorName || 'Dr. Ashton Cleve'}</h4>
                          <p className="text-xs font-medium text-slate-500 mt-1 truncate">{apt.time || '10:00am - 10:30am'}</p>
                        </div>
                        
                        <svg className={`w-5 h-5 flex-shrink-0 mr-1 ${isActive ? 'text-red-400' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    );
                  })
                )}
              </div>
              
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}