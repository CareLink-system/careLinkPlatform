import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getAgoraToken } from '../api/telemedicine';

export default function VideoRoom({ appointmentId, appId: propAppId }) {
  const appId = propAppId || import.meta.env.VITE_AGORA_APP_ID;
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  
  const [joined, setJoined] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);

  useEffect(() => {
    if (!appointmentId) {
      setError("Missing Appointment ID in URL.");
      return;
    }
    if (!appId) {
      setError("Missing VITE_AGORA_APP_ID in .env file.");
      return;
    }

    let mounted = true;

    async function init() {
      try {
        setStatus('Fetching token...');
        const data = await getAgoraToken(appointmentId);
        const { token, channelName, uid } = data;

        setStatus('Connecting to Agora...');
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (!mounted) return;
          
          if (mediaType === 'video') {
            const player = document.createElement('div');
            player.id = `remote-player-${user.uid}`;
            player.style.width = '320px';
            player.style.height = '240px';
            player.style.backgroundColor = 'black';
            remoteContainerRef.current?.appendChild(player);
            user.videoTrack?.play(player);
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (user) => {
          const el = document.getElementById(`remote-player-${user.uid}`);
          if (el) el.remove();
        });

        await client.join(appId, channelName, token || null, uid || undefined);

        setStatus('Starting camera...');
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audioTrack: microphoneTrack, videoTrack: cameraTrack };

        const localDiv = document.createElement('div');
        localDiv.id = 'local-player';
        localDiv.style.width = '320px';
        localDiv.style.height = '240px';
        localDiv.style.backgroundColor = 'black';
        localVideoRef.current?.appendChild(localDiv);
        cameraTrack.play(localDiv);

        await client.publish([microphoneTrack, cameraTrack]);
        setStatus('Connected');
        setJoined(true);
      } catch (err) {
        console.error('Agora init error', err);
        setError(err.message || "Failed to connect to video session.");
      }
    }

    init();

    return () => {
      mounted = false;
      const cleanup = async () => {
        const { audioTrack, videoTrack } = localTracksRef.current;
        audioTrack?.close();
        videoTrack?.close();
        await clientRef.current?.leave();
      };
      cleanup();
    };
  }, [appointmentId, appId]);

  const toggleAudio = async () => {
    const track = localTracksRef.current.audioTrack;
    if (track) {
      await track.setEnabled(mutedAudio);
      setMutedAudio(!mutedAudio);
    }
  };

  const toggleVideo = async () => {
    const track = localTracksRef.current.videoTrack;
    if (track) {
      await track.setEnabled(mutedVideo);
      setMutedVideo(!mutedVideo);
    }
  };

  const leaveCall = async () => {
    const { audioTrack, videoTrack } = localTracksRef.current;
    audioTrack?.close();
    videoTrack?.close();
    await clientRef.current?.leave();
    
    if (localVideoRef.current) localVideoRef.current.innerHTML = '';
    if (remoteContainerRef.current) remoteContainerRef.current.innerHTML = '';
    setJoined(false);
    setStatus('Call Ended');
  };

  if (error) return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;

  return (
    <div>
      <div className="mb-4 text-gray-600">{status}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div ref={localVideoRef} className="bg-gray-200" style={{ width: 320, height: 240 }} />
        <div ref={remoteContainerRef} className="bg-gray-100" style={{ minWidth: 320, minHeight: 240 }} />
      </div>

      {joined && (
        <div style={{ marginTop: 12 }}>
          <button onClick={toggleAudio} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
            {mutedAudio ? 'Unmute Audio' : 'Mute Audio'}
          </button>
          <button onClick={toggleVideo} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
            {mutedVideo ? 'Unmute Video' : 'Mute Video'}
          </button>
          <button onClick={leaveCall} className="px-4 py-2 bg-red-500 text-white rounded">
            Leave Call
          </button>
        </div>
      )}
    </div>
  );
}