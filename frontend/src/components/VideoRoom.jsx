import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { endSession, getAgoraToken, postDoctorSessionNote, postSessionMessage, startSession } from '../api/telemedicine';
import { getAppointmentById } from '../features/appointment/api/appointmentApi';
import { getDoctorByUserId } from '../features/doctor/api/doctorApi';
import { createPrescription } from '../features/prescription/api/prescriptionApi';

export default function VideoRoom({ appointmentId, appId: propAppId }) {
  const appId = propAppId || import.meta.env.VITE_AGORA_APP_ID;
  const [status, setStatus] = useState('Connecting...');
  const [cameraHint, setCameraHint] = useState('');
  const [joined, setJoined] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  
  const [chatMessage, setChatMessage] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [doctorNoteSaving, setDoctorNoteSaving] = useState(false);
  const [doctorNoteStatus, setDoctorNoteStatus] = useState('');
  const [doctorProfileId, setDoctorProfileId] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionStatus, setPrescriptionStatus] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({ diagnosis: '', medicines: '', notes: '' });
  const [messages, setMessages] = useState([{ sender: 'System', text: 'Chat started.', time: new Date().toLocaleTimeString() }]);

  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remotePlayerHostRef = useRef(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem('carelink.auth') || 'null');
    } catch {
      return null;
    }
  })();
  const currentRole = auth?.user?.role || 'Patient';
  const isDoctor = String(currentRole).toLowerCase() === 'doctor';

  const getCameraErrorHint = (err) => {
    const message = String(err?.message || '').toLowerCase();
    const code = String(err?.code || '').toUpperCase();

    if (code.includes('NOT_ALLOWED') || code.includes('PERMISSION') || message.includes('permission') || message.includes('denied')) {
      return 'Camera access was blocked by the browser. Allow camera/microphone access in the address bar or browser site settings, then refresh the page.';
    }

    if (code.includes('NOT_READABLE') || message.includes('not readable') || message.includes('no camera') || message.includes('device')) {
      return 'No webcam was found or the camera is in use by another app. Close other camera apps or choose a different camera in browser settings.';
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return 'Camera access requires a secure context. Open the app over HTTPS or localhost.';
    }

    return 'Check browser camera permissions and confirm a webcam is available.';
  };

  useEffect(() => {
    let active = true;

    async function loadDoctorProfile() {
      if (!isDoctor || !auth?.user?.id) return;
      const doctorRes = await getDoctorByUserId(auth.user.id);
      if (!active) return;

      if (doctorRes.data?.id) {
        setDoctorProfileId(doctorRes.data.id);
      } else {
        setPrescriptionStatus('Doctor profile not found. Unable to issue prescription.');
      }
    }

    loadDoctorProfile();
    return () => {
      active = false;
    };
  }, [auth?.user?.id, isDoctor]);

  useEffect(() => {
    let active = true;

    async function loadAppointment() {
      if (!appointmentId) return;

      const result = await getAppointmentById(appointmentId);
      if (!active) return;

      if (result.data) {
        setAppointmentDetails(result.data);
      }
    }

    loadAppointment();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId || !appId) return;
    let mounted = true;
    const hostElement = remotePlayerHostRef.current;

    async function init() {
      try {
        await startSession(appointmentId);
        const { token, channelName, uid } = await getAgoraToken(appointmentId);
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
          } catch (error) {
            // Prevent UI crashes for short-lived remote stream transitions.
            console.warn('Subscribe failed', { uid: user.uid, mediaType, error });
            return;
          }

          if (!mounted) return;

          if (mediaType === 'video' && user.videoTrack) {
            if (remotePlayerHostRef.current) {
              remotePlayerHostRef.current.innerHTML = '';
              const player = document.createElement('div');
              player.id = `remote-${user.uid}`;
              player.className = 'w-full h-full object-cover';
              remotePlayerHostRef.current.appendChild(player);
              user.videoTrack.play(player);
              setHasRemoteVideo(true);
            }
          }

          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.play();
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video' && remotePlayerHostRef.current) {
            remotePlayerHostRef.current.innerHTML = '';
            setHasRemoteVideo(false);
          }
          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.stop();
          }
        });

        client.on('user-left', () => {
          if (remotePlayerHostRef.current) {
            remotePlayerHostRef.current.innerHTML = '';
          }
          setHasRemoteVideo(false);
        });

        await client.join(appId, channelName, token || null, uid || undefined);

        const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audioTrack: mic, videoTrack: cam };
        setCameraHint('');

        if (localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
          const localDiv = document.createElement('div');
          localDiv.className = 'w-full h-full object-cover';
          localVideoRef.current.appendChild(localDiv);
          cam.play(localDiv);
        }

        await client.publish([mic, cam]);
        setStatus('');
        setJoined(true);
      } catch (err) {
        console.error('Agora init error', err);
        const apiError = err?.response?.data?.error || err?.response?.data?.detail || err?.message;
        setStatus(apiError ? `Connection failed: ${apiError}` : 'Connection failed.');
        setCameraHint(getCameraErrorHint(err));
      }
    }

    init();

    return () => {
      mounted = false;
      const { audioTrack, videoTrack } = localTracksRef.current;
      audioTrack?.stop();
      videoTrack?.stop();
      audioTrack?.close();
      videoTrack?.close();
      if (hostElement) {
        hostElement.innerHTML = '';
      }
      clientRef.current?.leave();
    };
  }, [appointmentId, appId]);

  const toggleAudio = async () => {
    await localTracksRef.current.audioTrack?.setEnabled(mutedAudio);
    setMutedAudio(!mutedAudio);
  };

  const toggleVideo = async () => {
    await localTracksRef.current.videoTrack?.setEnabled(mutedVideo);
    setMutedVideo(!mutedVideo);
  };

  const leaveCall = async () => {
    const { audioTrack, videoTrack } = localTracksRef.current;
    audioTrack?.stop();
    videoTrack?.stop();
    audioTrack?.close();
    videoTrack?.close();
    if (remotePlayerHostRef.current) {
      remotePlayerHostRef.current.innerHTML = '';
    }
    setHasRemoteVideo(false);
    await clientRef.current?.leave();
    try {
      await endSession(appointmentId);
    } catch (error) {
      console.warn('Unable to mark telemedicine session ended', error);
    }
    setJoined(false); setStatus('Call Ended.');
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage.trim();
    try {
      await postSessionMessage(appointmentId, msg);
    } catch (error) {
      console.warn('Failed to persist session message', error);
    }
    setMessages((prev) => [
      ...prev,
      { sender: 'You', text: msg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    setChatMessage('');
  };

  const saveDoctorNote = async () => {
    if (!doctorNote.trim()) return;
    setDoctorNoteSaving(true);
    setDoctorNoteStatus('');
    try {
      await postDoctorSessionNote(appointmentId, doctorNote.trim());
      setDoctorNote('');
      setDoctorNoteStatus('Consultation note saved');
    } catch {
      setDoctorNoteStatus('Could not save note');
    } finally {
      setDoctorNoteSaving(false);
    }
  };

  const submitPrescription = async () => {
    if (!isDoctor) return;
    if (!doctorProfileId || !appointmentDetails?.patientId) {
      setPrescriptionStatus('Missing doctor/patient information for prescription.');
      return;
    }

    if (!prescriptionForm.diagnosis.trim() || !prescriptionForm.medicines.trim()) {
      setPrescriptionStatus('Diagnosis and medicines are required.');
      return;
    }

    setPrescriptionSaving(true);
    setPrescriptionStatus('');

    const payload = {
      doctorId: doctorProfileId,
      patientId: appointmentDetails.patientId,
      appointmentId: Number(appointmentId),
      diagnosis: prescriptionForm.diagnosis.trim(),
      medicines: prescriptionForm.medicines.trim(),
      notes: prescriptionForm.notes.trim() || null,
    };

    const result = await createPrescription(payload);

    if (result.data) {
      setPrescriptionForm({ diagnosis: '', medicines: '', notes: '' });
      setPrescriptionStatus('Prescription issued successfully. It will appear on the prescriptions page.');
    } else {
      setPrescriptionStatus(result.error || 'Failed to issue prescription.');
    }

    setPrescriptionSaving(false);
  };

  return (
    // Changed: Height to 100% to fill parent, removed rigid fixed heights
    <div className="flex flex-col lg:flex-row h-full w-full gap-5">
      
      {/* VIDEO AREA */}
      {/* Changed: Dark background, flex-grow, min-height for better aspect ratio */}
      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg relative flex flex-col overflow-hidden min-h-[500px] lg:min-h-[65vh]">
        {status && !joined && <div className="absolute inset-0 flex items-center justify-center text-slate-300 animate-pulse">{status}</div>}
        {cameraHint && !joined && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[90%] rounded-xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-lg backdrop-blur">
            {cameraHint}
          </div>
        )}

        <div className="w-full h-full relative flex items-center justify-center">
          <div ref={remotePlayerHostRef} className="absolute inset-0" />
          {!hasRemoteVideo && joined && <span className="text-slate-500">Waiting for patient...</span>}
        </div>

        {/* Local Video Overlay - improved aspect ratio and positioning */}
        <div ref={localVideoRef} className="absolute top-5 right-5 w-36 md:w-48 aspect-[4/3] bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600 overflow-hidden z-10 transition-opacity duration-300" style={{ opacity: joined ? 1 : 0 }} />

        {/* Controls */}
        {joined && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-200 z-10">
            <button onClick={toggleAudio} className={`p-3 rounded-full transition-colors ${mutedAudio ? 'bg-red-100 text-red-500' : 'bg-[#4B9AA8]/10 text-[#4B9AA8] hover:bg-[#4B9AA8]/20'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${mutedVideo ? 'bg-red-100 text-red-500' : 'bg-[#4B9AA8]/10 text-[#4B9AA8] hover:bg-[#4B9AA8]/20'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={leaveCall} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors shadow-md">
              End Call
            </button>
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      {/* Changed: Set to match height of video area perfectly */}
      <div className="w-full lg:w-[320px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[500px] lg:min-h-[65vh]">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-800 flex items-center justify-between">
          <span>Chat</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-400 mb-1 font-medium">{msg.sender} • {msg.time}</span>
              <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'You' ? 'bg-[#4B9AA8] text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendChat} className="p-3 border-t border-slate-100 flex gap-2 bg-white rounded-b-2xl">
          <input 
            type="text" 
            value={chatMessage} 
            onChange={(e) => setChatMessage(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30 transition-all"
          />
          <button type="submit" className="bg-[#4B9AA8] text-white p-2.5 rounded-xl hover:bg-[#3d7f8b] transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>

        {isDoctor && (
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="text-xs font-semibold text-slate-700 mb-2">Private consultation note</div>
            <textarea
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              placeholder="Add doctor-only consultation notes"
              className="w-full min-h-[72px] rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={saveDoctorNote}
                disabled={doctorNoteSaving || !doctorNote.trim()}
                className="px-3 py-1.5 text-xs rounded-md bg-[#4B9AA8] text-white disabled:opacity-60"
              >
                {doctorNoteSaving ? 'Saving...' : 'Save note'}
              </button>
              {doctorNoteStatus && <span className="text-xs text-slate-500">{doctorNoteStatus}</span>}
            </div>
          </div>
        )}

        {isDoctor && (
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="text-xs font-semibold text-slate-700 mb-2">Issue prescription</div>
            <input
              type="text"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Diagnosis"
              className="w-full mb-2 rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
            />
            <textarea
              value={prescriptionForm.medicines}
              onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, medicines: e.target.value }))}
              placeholder="Medicines and dosage"
              className="w-full min-h-[70px] mb-2 rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
            />
            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes (optional)"
              className="w-full min-h-[60px] rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9AA8]/30"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={submitPrescription}
                disabled={prescriptionSaving}
                className="px-3 py-1.5 text-xs rounded-md bg-[#4B9AA8] text-white disabled:opacity-60"
              >
                {prescriptionSaving ? 'Issuing...' : 'Issue prescription'}
              </button>
              {prescriptionStatus && <span className="text-xs text-slate-500 text-right">{prescriptionStatus}</span>}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}