import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getAgoraToken } from '../api/telemedicine';

export default function VideoRoom({ appointmentId, appId: propAppId }) {
  const appId = propAppId || import.meta.env.VITE_AGORA_APP_ID;
  const [status, setStatus] = useState('Connecting...');
  const [joined, setJoined] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([{ sender: 'System', text: 'Chat started.', time: new Date().toLocaleTimeString() }]);

  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);

  useEffect(() => {
    if (!appointmentId || !appId) return;
    let mounted = true;

    async function init() {
      try {
        const { token, channelName, uid } = await getAgoraToken(appointmentId);
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (!mounted) return;
          
          if (mediaType === 'video') {
            if (remoteContainerRef.current) remoteContainerRef.current.innerHTML = '';
            const player = document.createElement('div');
            player.id = `remote-${user.uid}`;
            player.className = 'w-full h-full object-cover rounded-xl';
            remoteContainerRef.current?.appendChild(player);
            user.videoTrack?.play(player);
          }
          if (mediaType === 'audio') user.audioTrack?.play();
        });

        await client.join(appId, channelName, token || null, uid || undefined);

        const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audioTrack: mic, videoTrack: cam };

        if (localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
          const localDiv = document.createElement('div');
          localDiv.className = 'w-full h-full object-cover rounded-xl';
          localVideoRef.current.appendChild(localDiv);
          cam.play(localDiv);
        }

        await client.publish([mic, cam]);
        setStatus('');
        setJoined(true);
      } catch (err) {
        console.error('Agora init error', err);
        setStatus('Connection failed.');
      }
    }

    init();

    return () => {
      mounted = false;
      const { audioTrack, videoTrack } = localTracksRef.current;
      audioTrack?.close(); videoTrack?.close();
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
    audioTrack?.close(); videoTrack?.close();
    await clientRef.current?.leave();
    setJoined(false); setStatus('Call Ended.');
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([...messages, { sender: 'You', text: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 relative">
      
      {/* VIDEO AREA (Left) */}
      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner relative flex flex-col overflow-hidden h-[600px] lg:h-auto">
        {status && !joined && <div className="absolute inset-0 flex items-center justify-center text-slate-500">{status}</div>}

        {/* Remote Video Container */}
        <div ref={remoteContainerRef} className="w-full h-full flex items-center justify-center">
          {!remoteContainerRef.current?.hasChildNodes() && joined && <span className="text-slate-400">Waiting for patient...</span>}
        </div>

        {/* Local Video Overlay */}
        <div ref={localVideoRef} className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-white rounded-xl shadow-lg border-2 border-white overflow-hidden z-10" style={{ opacity: joined ? 1 : 0 }} />

        {/* Controls */}
        {joined && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 z-10">
            <button onClick={toggleAudio} className={`p-3 rounded-full ${mutedAudio ? 'bg-red-100 text-red-500' : 'bg-[#4B9AA8]/10 text-[#4B9AA8] hover:bg-[#4B9AA8]/20'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={toggleVideo} className={`p-3 rounded-full ${mutedVideo ? 'bg-red-100 text-red-500' : 'bg-[#4B9AA8]/10 text-[#4B9AA8] hover:bg-[#4B9AA8]/20'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={leaveCall} className="px-6 py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 shadow-md">
              End Call
            </button>
          </div>
        )}
      </div>

      {/* CHAT AREA (Right) */}
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] lg:h-auto">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-700">Chat</div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-400 mb-1">{msg.sender} • {msg.time}</span>
              <div className={`px-3 py-2 rounded-xl text-sm ${msg.sender === 'You' ? 'bg-[#4B9AA8] text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendChat} className="p-3 border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            value={chatMessage} 
            onChange={(e) => setChatMessage(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4B9AA8]"
          />
          <button type="submit" className="bg-[#4B9AA8] text-white p-2 rounded-lg hover:bg-[#3d7f8b]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>

    </div>
  );
}