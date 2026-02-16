import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function ConsultRoom() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  // Determine if user is doctor or patient
  const isPatient = searchParams.get('role') === 'patient';
  const userType = isPatient ? 'patient' : 'doctor';
  const userName = isPatient
    ? searchParams.get('name') || 'Patient'
    : auth?.user?.name || 'Doctor';

  const [status, setStatus] = useState('connecting'); // connecting, waiting, connected, ended
  const [remoteName, setRemoteName] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  // Format call duration
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC
  const initializeCall = useCallback(async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (mediaErr) {
        console.warn('Camera unavailable, trying audio only:', mediaErr.message);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        } catch (audioErr) {
          console.warn('Audio also unavailable, continuing without media:', audioErr.message);
          stream = new MediaStream();
        }
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to signaling server
      // Dynamically import socket.io-client
      const { io } = await import('socket.io-client');
      const socket = io(API_URL);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to signaling server');
        socket.emit('join-session', { sessionId, userType, userName });
        setStatus('waiting');
      });

      socket.on('connect_error', () => {
        setError('Cannot connect to signaling server. Make sure the backend is running.');
      });

      // When the other peer joins
      socket.on('peer-joined', async ({ userType: peerType, userName: peerName }) => {
        console.log(`${peerType} "${peerName}" joined`);
        setRemoteName(peerName);

        // Doctor creates the offer
        if (userType === 'doctor') {
          await createPeerConnection(socket, stream);
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit('offer', { sessionId, offer });
        }
      });

      // Handle incoming offer (patient receives this)
      socket.on('offer', async ({ offer }) => {
        console.log('Received offer');
        await createPeerConnection(socket, stream);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('answer', { sessionId, answer });
      });

      // Handle incoming answer (doctor receives this)
      socket.on('answer', async ({ answer }) => {
        console.log('Received answer');
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      // Handle ICE candidates
      socket.on('ice-candidate', async ({ candidate }) => {
        if (peerConnectionRef.current && candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      });

      // Handle peer leaving
      socket.on('peer-left', ({ userType: peerType, userName: peerName }) => {
        console.log(`${peerType} "${peerName}" left`);
        setRemoteName('');
        setStatus('waiting');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      });

    } catch (err) {
      console.error('Failed to initialize call:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera/microphone access was denied. Please allow access and refresh.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found on this device.');
      } else {
        setError(`Failed to start: ${err.message}`);
      }
    }
  }, [sessionId, userType, userName, API_URL]);

  const createPeerConnection = async (socket, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local tracks to connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus('connected');
        // Start timer
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { sessionId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('waiting');
      }
    };

    return pc;
  };

  useEffect(() => {
    initializeCall();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initializeCall]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('ended');
  };

  const goBack = () => {
    if (isPatient) {
      navigate('/');
    } else {
      navigate('/consultlink');
    }
  };

  // Error state
  if (error) {
    return (
      <div style={styles.fullscreen}>
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px' }}>Connection Error</h2>
          <p style={{ marginBottom: '24px', opacity: 0.8 }}>{error}</p>
          <button onClick={goBack} style={styles.backBtn}>Go Back</button>
        </div>
      </div>
    );
  }

  // Call ended
  if (status === 'ended') {
    return (
      <div style={styles.fullscreen}>
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '12px' }}>Consultation Ended</h2>
          <p style={{ marginBottom: '8px', opacity: 0.8 }}>
            Duration: {formatDuration(callDuration)}
          </p>
          <p style={{ marginBottom: '24px', opacity: 0.6, fontSize: '14px' }}>
            Thank you for using ConsultLink.
          </p>
          <button onClick={goBack} style={styles.backBtn}>
            {isPatient ? 'Close' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.fullscreen}>
      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>📹</span>
          <span style={{ fontWeight: '600' }}>ConsultLink</span>
          <span style={{
            padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
            background: status === 'connected' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
            color: status === 'connected' ? '#10b981' : '#f59e0b'
          }}>
            {status === 'connected' ? 'Connected' : status === 'waiting' ? 'Waiting for other participant...' : 'Connecting...'}
          </span>
        </div>
        {status === 'connected' && (
          <div style={{ fontSize: '14px', opacity: 0.8, fontFamily: 'monospace' }}>
            {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Video Area */}
      <div style={styles.videoArea}>
        {/* Remote Video (large) */}
        <div style={styles.remoteVideoContainer}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.remoteVideo}
          />
          {status !== 'connected' && (
            <div style={styles.waitingOverlay}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {userType === 'doctor' ? '👤' : '👨‍⚕️'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {status === 'waiting'
                  ? `Waiting for ${userType === 'doctor' ? 'patient' : 'doctor'} to join...`
                  : 'Connecting...'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.6 }}>
                Session ID: {sessionId?.substring(0, 8)}...
              </div>
            </div>
          )}
          {status === 'connected' && remoteName && (
            <div style={styles.remoteNameTag}>{remoteName}</div>
          )}
        </div>

        {/* Local Video (picture-in-picture) */}
        <div style={styles.localVideoContainer}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              ...styles.localVideo,
              ...(videoEnabled ? {} : { display: 'none' })
            }}
          />
          {!videoEnabled && (
            <div style={styles.videoOffOverlay}>
              <span style={{ fontSize: '24px' }}>📷</span>
              <span style={{ fontSize: '11px' }}>Camera Off</span>
            </div>
          )}
          <div style={styles.localNameTag}>{userName} (You)</div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          onClick={toggleAudio}
          style={{
            ...styles.controlBtn,
            background: audioEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444'
          }}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '🎤' : '🔇'}
        </button>
        <button
          onClick={toggleVideo}
          style={{
            ...styles.controlBtn,
            background: videoEnabled ? 'rgba(255,255,255,0.15)' : '#ef4444'
          }}
          title={videoEnabled ? 'Camera Off' : 'Camera On'}
        >
          {videoEnabled ? '📷' : '📷'}
        </button>
        <button
          onClick={endCall}
          style={styles.endCallBtn}
          title="End Call"
        >
          📞 End
        </button>
      </div>
    </div>
  );
}

const styles = {
  fullscreen: {
    position: 'fixed', inset: 0,
    background: '#111827',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'white'
  },
  statusBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px',
    background: 'rgba(0,0,0,0.3)',
    zIndex: 10
  },
  videoArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  remoteVideoContainer: {
    position: 'absolute', inset: 0,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: '#1f2937'
  },
  remoteVideo: {
    width: '100%', height: '100%',
    objectFit: 'cover'
  },
  waitingOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    background: '#1f2937', color: 'white'
  },
  remoteNameTag: {
    position: 'absolute', bottom: '16px', left: '16px',
    background: 'rgba(0,0,0,0.6)', padding: '6px 14px',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500'
  },
  localVideoContainer: {
    position: 'absolute', bottom: '80px', right: '20px',
    width: '200px', height: '150px',
    borderRadius: '12px', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    background: '#374151',
    zIndex: 5
  },
  localVideo: {
    width: '100%', height: '100%',
    objectFit: 'cover'
  },
  videoOffOverlay: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    gap: '4px', color: 'rgba(255,255,255,0.6)'
  },
  localNameTag: {
    position: 'absolute', bottom: '6px', left: '8px',
    background: 'rgba(0,0,0,0.5)', padding: '2px 8px',
    borderRadius: '4px', fontSize: '11px'
  },
  controls: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '16px', padding: '16px',
    background: 'rgba(0,0,0,0.3)',
    zIndex: 10
  },
  controlBtn: {
    width: '56px', height: '56px',
    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer', fontSize: '22px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    color: 'white', transition: 'all 0.2s'
  },
  endCallBtn: {
    padding: '14px 28px',
    background: '#ef4444', color: 'white',
    border: 'none', borderRadius: '28px',
    cursor: 'pointer', fontSize: '16px', fontWeight: '600',
    transition: 'all 0.2s'
  },
  backBtn: {
    padding: '12px 32px',
    background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
    cursor: 'pointer', fontSize: '16px', fontWeight: '500'
  }
};
