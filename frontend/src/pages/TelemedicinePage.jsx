import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoRoom from '../components/VideoRoom';

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const isValidAppointmentId = /^\d+$/.test(String(appointmentId || ''));

  if (!isValidAppointmentId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Consultation</h1>
          <p className="text-sm text-red-500 mt-1">
            Invalid appointment id. Open a call from your appointments list.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-3">
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 rounded-lg bg-[#4B9AA8] text-white text-sm font-semibold"
          >
            Go to My Appointments
          </button>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold"
          >
            Go to Doctor Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-[#4B9AA8] hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Consultation</h1>
            <p className="text-slate-500 text-xs">ID: {appointmentId}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-[600px]">
        <VideoRoom appointmentId={appointmentId} />
      </div>
    </div>
  );
}