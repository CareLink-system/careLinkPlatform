import React from 'react';
import { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VideoRoom from '../components/VideoRoom';
import { useAuth } from '../features/auth/context/AuthContext';
import { normalizeRole } from '../features/auth/utils/roleRouting';

const DEMO_APPOINTMENT_ID = 'demo-consult-room';

function normalizeAppointmentId(value) {
  const safe = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');

  return safe || DEMO_APPOINTMENT_ID;
}

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const routeAppointmentId = useMemo(() => normalizeAppointmentId(appointmentId), [appointmentId]);
  const [joinRoomId, setJoinRoomId] = useState(routeAppointmentId);

  const roleLabel = role === 'doctor' ? 'Doctor' : 'Patient';
  const startOrJoinLabel = role === 'doctor' ? 'Start consultation' : 'Join consultation';

  const canJoin = Boolean(joinRoomId.trim());
  const sessionLink = `${window.location.origin}/telemedicine/${routeAppointmentId}`;

  const joinDifferentRoom = () => {
    const nextId = normalizeAppointmentId(joinRoomId);
    navigate(`/telemedicine/${nextId}`);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(sessionLink);
    } catch {
      // Keep this non-blocking if clipboard APIs are not available.
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-[#4B9AA8] hover:bg-slate-100 rounded-lg transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800">Consultation</h1>
            <p className="text-slate-500 text-xs truncate">Session ID: {routeAppointmentId}</p>
            <p className="text-slate-500 text-xs">Role: {roleLabel}</p>
          </div>
        </div>
        <button
          onClick={copyInviteLink}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Copy invite link
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1">
          <label htmlFor="session-id" className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Appointment / Room ID
          </label>
          <input
            id="session-id"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder={DEMO_APPOINTMENT_ID}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
          />
          <p className="mt-2 text-xs text-slate-500">
            Use the same ID on both sides to connect doctor and patient. Until booking is implemented, share this manually.
          </p>
        </div>
        <button
          onClick={joinDifferentRoom}
          disabled={!canJoin}
          className="h-10 px-4 rounded-lg bg-[#4B9AA8] text-white text-sm font-semibold hover:bg-[#3d7f8b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {startOrJoinLabel}
        </button>
      </div>

      <div className="flex-1 min-h-[600px]">
        <VideoRoom appointmentId={routeAppointmentId} participantRole={role} key={location.pathname} />
      </div>
    </div>
  );
}