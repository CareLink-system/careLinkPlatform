import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getAgoraToken } from '../api/telemedicine';

export default function VideoRoom({ appointmentId, appId: propAppId }) {
  const appId = propAppId || import.meta.env.VITE_AGORA_APP_ID;
  const [joined, setJoined] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const remoteContainerRef = useRef(null);

  useEffect(() => {
    if (!appointmentId || !appId) return;

    let mounted = true;

    async function init() {
      const data = await getAgoraToken(appointmentId);
      const { token, channelName, uid } = data;

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
          remoteContainerRef.current?.appendChild(player);
          user.videoTrack?.play(player);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user) => {
        const el = document.getElementById(`remote-player-${user.uid}`);
        if (el?.parentNode) el.parentNode.removeChild(el);
      });

      // join
      await client.join(appId, channelName, token || null, uid || undefined);

      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current.audioTrack = microphoneTrack;
      localTracksRef.current.videoTrack = cameraTrack;

      // attach local video element
      const localDiv = document.createElement('div');
      localDiv.id = 'local-player';
      localDiv.style.width = '320px';
      localDiv.style.height = '240px';
      localVideoRef.current?.appendChild(localDiv);
      cameraTrack.play(localDiv);

      await client.publish([microphoneTrack, cameraTrack]);
      setJoined(true);
    }

    init().catch((err) => console.error('Agora init error', err));

    return () => {
      mounted = false;
      (async () => {
        const client = clientRef.current;
        const { audioTrack, videoTrack } = localTracksRef.current;
        try {
          audioTrack?.stop();
          audioTrack?.close();
          videoTrack?.stop();
          videoTrack?.close();
          await client?.leave();
        } catch (e) {
          /* ignore */
        }
      })();
    };
  }, [appointmentId, appId]);

  const toggleAudio = async () => {
    const t = localTracksRef.current.audioTrack;
    if (!t) return;
    const enabled = !mutedAudio;
    await t.setEnabled(enabled);
    setMutedAudio(!enabled);
  };

  const toggleVideo = async () => {
    const t = localTracksRef.current.videoTrack;
    if (!t) return;
    const enabled = !mutedVideo;
    await t.setEnabled(enabled);
    setMutedVideo(!enabled);
  };

  const leaveCall = async () => {
    const client = clientRef.current;
    const { audioTrack, videoTrack } = localTracksRef.current;
    try {
      audioTrack?.stop();
      audioTrack?.close();
      videoTrack?.stop();
      videoTrack?.close();
      await client?.leave();
    } catch (e) {
      console.error(e);
    }
    // cleanup DOM
    const local = document.getElementById('local-player');
    if (local?.parentNode) local.parentNode.removeChild(local);
    remoteContainerRef.current && (remoteContainerRef.current.innerHTML = '');
    setJoined(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div ref={localVideoRef} />
        <div ref={remoteContainerRef} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={toggleAudio}>{mutedAudio ? 'Unmute Audio' : 'Mute Audio'}</button>
        <button onClick={toggleVideo} style={{ marginLeft: 8 }}>{mutedVideo ? 'Unmute Video' : 'Mute Video'}</button>
        <button onClick={leaveCall} style={{ marginLeft: 8 }}>{joined ? 'Leave Call' : 'Close'}</button>
      </div>
    </div>
  );
}
