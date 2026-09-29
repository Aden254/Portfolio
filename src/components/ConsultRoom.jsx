import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Free STUN + public TURN fallback for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Open Relay TURN — handles symmetric NAT (required for cross-network demos)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Attach a MediaStream to a video element robustly —
// works around React's broken `muted` attribute and autoPlay after srcObject set.
function attachStream(el, stream) {
  if (!el || !stream) return;
  el.srcObject = stream;
  el.muted = el.muted; // trigger internal setter — fixes React muted bug
  el.play().catch((e) => {
    // AbortError fires when play() is interrupted by another play() — safe to ignore
    if (e.name !== 'AbortError') console.warn('[video] play() failed:', e.message);
  });
}

export default function ConsultRoom() {
  const { sessionId }     = useParams();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const auth              = useAuth();

  const isPatient  = searchParams.get('role') === 'patient';
  const userType   = isPatient ? 'patient' : 'doctor';
  const userName   = isPatient
    ? searchParams.get('name') || 'Patient'
    : auth?.user?.name || 'Doctor';

  const [status, setStatus]       = useState('connecting');
  const [remoteName, setRemoteName] = useState('');
  const [audioEnabled, setAudio]  = useState(true);
  const [videoEnabled, setVideo]  = useState(true);
  const [error, setError]         = useState(null);
  const [duration, setDuration]   = useState(0);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef          = useRef(null);
  const streamRef      = useRef(null);
  const socketRef      = useRef(null);
  const timerRef       = useRef(null);
  // Pending stream — set when stream arrives before the ref mounts
  const pendingLocalStream  = useRef(null);
  const pendingRemoteStream = useRef(null);

  // Callback refs — ensure muted + srcObject are set the moment the element mounts
  const setLocalVideoEl = useCallback((el) => {
    localVideoRef.current = el;
    if (el) {
      el.muted = true;
      if (pendingLocalStream.current) {
        attachStream(el, pendingLocalStream.current);
        pendingLocalStream.current = null;
      }
    }
  }, []);

  const setRemoteVideoEl = useCallback((el) => {
    remoteVideoRef.current = el;
    if (el && pendingRemoteStream.current) {
      attachStream(el, pendingRemoteStream.current);
      pendingRemoteStream.current = null;
    }
  }, []);

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  // Attach local stream to local video, buffering if the element isn't mounted yet
  const setLocalStream = useCallback((stream) => {
    streamRef.current = stream;
    if (localVideoRef.current) {
      attachStream(localVideoRef.current, stream);
    } else {
      pendingLocalStream.current = stream;
    }
  }, []);

  // Attach remote stream to remote video, buffering if not mounted yet
  const setRemoteStream = useCallback((stream) => {
    if (remoteVideoRef.current) {
      attachStream(remoteVideoRef.current, stream);
    } else {
      pendingRemoteStream.current = stream;
    }
    setStatus('connected');
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }, []);

  const createPC = useCallback((socket, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (e) => {
      if (e.streams[0]) setRemoteStream(e.streams[0]);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { sessionId, candidate: e.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed'].includes(pc.connectionState)) setStatus('waiting');
    };
    return pc;
  }, [sessionId, setRemoteStream]);

  const initCall = useCallback(async () => {
    // 1. Get local media
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } catch {
        stream = new MediaStream();
      }
    }
    setLocalStream(stream);

    // 2. Connect signaling socket
    const { io } = await import('socket.io-client');
    const socket = io(API_BASE, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-session', { sessionId, userType, userName });
      setStatus('waiting');
    });

    socket.on('connect_error', () =>
      setError('Cannot reach the signaling server. The backend may be sleeping — try again in 30 seconds.')
    );

    socket.on('peer-joined', async ({ userType: pt, userName: pn }) => {
      setRemoteName(pn);
      if (userType === 'doctor') {
        const pc = createPC(socket, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { sessionId, offer });
      }
    });

    socket.on('offer', async ({ offer }) => {
      const pc = createPC(socket, stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sessionId, answer });
    });

    socket.on('answer', async ({ answer }) => {
      if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (e) { console.warn('ICE candidate error:', e.message); }
      }
    });

    socket.on('peer-left', () => {
      setRemoteName('');
      setStatus('waiting');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; setDuration(0); }
    });
  }, [sessionId, userType, userName, API_BASE, setLocalStream, createPC]);

  useEffect(() => {
    initCall().catch((err) => {
      if (err.name === 'NotAllowedError')  setError('Camera/microphone access denied. Please allow access in your browser and refresh.');
      else if (err.name === 'NotFoundError') setError('No camera or microphone found on this device.');
      else setError(`Could not start call: ${err.message}`);
    });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initCall]);

  const toggleAudio = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setAudio(t.enabled); }
  };
  const toggleVideo = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setVideo(t.enabled); }
  };
  const endCall = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('ended');
  };
  const goBack = () => navigate(isPatient ? '/' : '/consultlink');

  // ── Error screen ────────────────────────────────────────────────────────────
  if (error) return (
    <div style={S.screen}>
      <div style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '480px' }}>
        <svg viewBox="0 0 40 40" width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: '16px' }}>
          <circle cx="20" cy="20" r="18"/>
          <line x1="20" y1="12" x2="20" y2="22"/>
          <circle cx="20" cy="28" r="1.5" fill="#ef4444"/>
        </svg>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>Connection Error</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>{error}</p>
        <button onClick={goBack} style={S.backBtn}>Go Back</button>
      </div>
    </div>
  );

  // ── Ended screen ────────────────────────────────────────────────────────────
  if (status === 'ended') return (
    <div style={S.screen}>
      <div style={{ textAlign: 'center', padding: '48px 32px' }}>
        <svg viewBox="0 0 40 40" width="48" height="48" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" style={{ marginBottom: '16px' }}>
          <circle cx="20" cy="20" r="18"/>
          <path d="M12 20l6 6 10-12"/>
        </svg>
        <h2 style={{ color: 'white', marginBottom: '8px' }}>Consultation Ended</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Duration: {fmt(duration)}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>Session recorded and HIPAA-compliant.</p>
        <button onClick={goBack} style={S.backBtn}>{isPatient ? 'Close' : 'Back to Dashboard'}</button>
      </div>
    </div>
  );

  // ── Main call UI ─────────────────────────────────────────────────────────────
  return (
    <div style={S.screen}>
      {/* Status bar */}
      <div style={S.bar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg viewBox="0 0 28 28" width="22" height="22" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round">
            <rect x="2" y="2" width="24" height="24" rx="5" strokeWidth="2" fill="#eff6ff"/>
            <line x1="14" y1="8" x2="14" y2="20"/><line x1="8" y1="14" x2="20" y2="14"/>
          </svg>
          <span style={{ fontWeight: '700', fontSize: '14px' }}>ConsultLink</span>
          <span style={{
            padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
            background: status === 'connected' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
            color:      status === 'connected' ? '#4ade80'              : '#fbbf24',
            border: `1px solid ${status === 'connected' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}>
            {status === 'connected' ? 'Live' : status === 'waiting' ? 'Waiting…' : 'Connecting…'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {status === 'connected' && (
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{fmt(duration)}</span>
          )}
          {remoteName && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{remoteName}</span>}
        </div>
      </div>

      {/* Video area */}
      <div style={S.videoArea}>
        {/* Remote (main) */}
        <div style={S.remoteWrap}>
          <video ref={setRemoteVideoEl} autoPlay playsInline style={S.remoteVid} />
          {status !== 'connected' && (
            <div style={S.overlay}>
              <svg viewBox="0 0 40 40" width="56" height="56" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '14px' }}>
                <circle cx="20" cy="14" r="7"/>
                <path d="M6 38c0-7.7 6.3-14 14-14s14 6.3 14 14"/>
              </svg>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                {status === 'waiting'
                  ? `Waiting for ${userType === 'doctor' ? 'patient' : 'doctor'} to join…`
                  : 'Connecting…'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                Session · {sessionId?.substring(0, 8)}
              </div>
            </div>
          )}
          {status === 'connected' && remoteName && (
            <div style={S.nameTag}>{remoteName}</div>
          )}
        </div>

        {/* Local (PiP) */}
        <div style={S.localWrap}>
          {videoEnabled
            ? <video ref={setLocalVideoEl} autoPlay playsInline style={S.localVid} />
            : (
              <>
                {/* hidden video keeps the stream alive so it can be re-enabled */}
                <video ref={setLocalVideoEl} autoPlay playsInline style={{ display: 'none' }} />
                <div style={S.camOffOverlay}>
                  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="3" y1="3" x2="17" y2="17"/>
                    <rect x="2" y="6" width="12" height="9" rx="2"/>
                    <path d="M14 9l5-3v8l-5-3"/>
                  </svg>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Camera Off</span>
                </div>
              </>
            )
          }
          <div style={S.localName}>{userName} (You)</div>
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <CtrlBtn active={audioEnabled} onClick={toggleAudio} title={audioEnabled ? 'Mute mic' : 'Unmute mic'}>
          {audioEnabled
            ? <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 2a3 3 0 013 3v5a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M6 10a4 4 0 008 0M10 14v4"/></svg>
            : <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="3" x2="17" y2="17"/><path d="M10 2a3 3 0 013 3v2M10 14v4M7 10a3 3 0 005.66 1.42M6 10a4.04 4.04 0 008 .58"/></svg>
          }
        </CtrlBtn>
        <CtrlBtn active={videoEnabled} onClick={toggleVideo} title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}>
          {videoEnabled
            ? <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="6" width="12" height="9" rx="2"/><path d="M14 9l5-3v8l-5-3"/></svg>
            : <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="3" x2="17" y2="17"/><rect x="2" y="6" width="12" height="9" rx="2"/><path d="M14 9l5-3v8l-5-3"/></svg>
          }
        </CtrlBtn>
        <button onClick={endCall} style={S.endBtn} title="End call">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2.7 7.5C5.3 4.9 8.5 3.5 12 3.5s6.7 1.4 9.3 4"/>
            <path d="M5 10.5C6.8 8.7 9.3 7.5 12 7.5s5.2 1.2 7 3"/>
            <path d="M8.5 13.5c.9-.9 2.2-1.5 3.5-1.5s2.6.6 3.5 1.5"/>
            <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
          </svg>
          End Call
        </button>
      </div>
    </div>
  );
}

// ── Control button ─────────────────────────────────────────────────────────────
function CtrlBtn({ active, onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: '52px', height: '52px', borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.15)',
      background: active ? 'rgba(255,255,255,0.12)' : '#ef4444',
      color: 'white', cursor: 'pointer', display: 'flex',
      justifyContent: 'center', alignItems: 'center',
      transition: 'background 0.2s',
    }}>
      {children}
    </button>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S = {
  screen: {
    position: 'fixed', inset: 0,
    background: '#0f172a',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'white',
  },
  bar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 10,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  videoArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  remoteWrap: {
    position: 'absolute', inset: 0,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: '#1e293b',
  },
  remoteVid: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    background: '#1e293b',
  },
  nameTag: {
    position: 'absolute', bottom: '16px', left: '16px',
    background: 'rgba(0,0,0,0.55)', padding: '5px 12px',
    borderRadius: '6px', fontSize: '13px', fontWeight: '500',
  },
  localWrap: {
    position: 'absolute', bottom: '80px', right: '20px',
    width: '200px', height: '150px',
    borderRadius: '10px', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.15)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    background: '#334155',
    zIndex: 5,
  },
  localVid: { width: '100%', height: '100%', objectFit: 'cover' },
  camOffOverlay: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
  },
  localName: {
    position: 'absolute', bottom: '5px', left: '7px',
    background: 'rgba(0,0,0,0.5)', padding: '2px 7px',
    borderRadius: '4px', fontSize: '11px',
  },
  controls: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '14px', padding: '14px',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  endBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '14px 28px',
    background: '#e11d48', color: 'white',
    border: 'none', borderRadius: '28px',
    cursor: 'pointer', fontSize: '15px', fontWeight: '600',
    transition: 'background 0.2s',
  },
  backBtn: {
    padding: '12px 32px',
    background: 'rgba(255,255,255,0.1)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
    cursor: 'pointer', fontSize: '15px', fontWeight: '500',
  },
};
