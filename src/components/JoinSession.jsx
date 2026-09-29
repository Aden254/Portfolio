import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const CrossIcon = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round">
    <rect x="6" y="6" width="36" height="36" rx="6" strokeWidth="2.5" fill="#eff6ff"/>
    <line x1="24" y1="14" x2="24" y2="34"/>
    <line x1="14" y1="24" x2="34" y2="24"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8 1.5L2 4v4.5C2 12.1 5 15 8 15.5c3-0.5 6-3.4 6-7V4L8 1.5z"/>
    <path d="M5.5 8.5l2 2 3-3"/>
  </svg>
);

export default function JoinSession() {
  const { sessionId }   = useParams();
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const sessionToken    = searchParams.get('token');

  const [sessionInfo, setInfo] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(null);
  const [name, setName]        = useState('');
  const [joining, setJoining]  = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!sessionId || !sessionToken) {
      setError('Missing session ID or token. Please use the link provided by your doctor.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/consultations/join/${sessionId}?token=${sessionToken}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid session');
        setInfo(data);
        setName(data.patientName || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, sessionToken]);

  const handleJoin = () => {
    if (!name.trim()) return;
    setJoining(true);
    navigate(`/consult-room/${sessionId}?token=${sessionToken}&name=${encodeURIComponent(name)}&role=patient`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <CrossIcon />
          <div style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>Validating your session…</div>
        </div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign: 'center' }}>
          <svg viewBox="0 0 40 40" width="44" height="44" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: '14px' }}>
            <circle cx="20" cy="20" r="18"/>
            <line x1="20" y1="12" x2="20" y2="22"/>
            <circle cx="20" cy="28" r="1.5" fill="#e11d48"/>
          </svg>
          <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '20px' }}>Unable to Join</h2>
          <p style={{ margin: '0 0 14px', color: '#e11d48', fontSize: '14px' }}>{error}</p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
            If you believe this is an error, please contact your healthcare provider for a new link.
          </p>
        </div>
      </div>
    </div>
  );

  // ── Join form ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <CrossIcon />
          </div>
          <h1 style={{ margin: '0 0 5px', color: '#0f172a', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Video Consultation
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            Secure telehealth session · ConsultLink
          </p>
        </div>

        {/* Doctor info */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Attending Physician
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{sessionInfo.doctorName}</div>
          {sessionInfo.specialty && (
            <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '2px' }}>{sessionInfo.specialty}</div>
          )}
        </div>

        {/* Name field */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '13px', fontWeight: '500' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your full name"
            autoFocus
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fafafa', transition: 'border-color 0.15s' }}
            onFocus={(e) => e.target.style.borderColor = '#1d4ed8'}
            onBlur={(e)  => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Permission notice */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '7px', padding: '10px 12px', marginBottom: '20px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
          Your browser will request camera and microphone access. Please allow both for the video call to work.
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={!name.trim() || joining}
          style={{
            width: '100%', padding: '11px',
            background: !name.trim() ? '#94a3b8' : '#1d4ed8',
            color: 'white', border: 'none', borderRadius: '7px',
            cursor: !name.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: '600', letterSpacing: '0.01em',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) => name.trim() && (e.currentTarget.style.background = '#1e40af')}
          onMouseOut={(e)  => name.trim() && (e.currentTarget.style.background = '#1d4ed8')}
        >
          {joining ? 'Connecting…' : 'Join Consultation'}
        </button>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '18px', color: '#94a3b8', fontSize: '11px' }}>
          <ShieldIcon />
          End-to-end encrypted · HIPAA compliant · Access logged
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f1f5f9', padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'white', borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.07)',
    padding: '36px 32px', width: '100%', maxWidth: '420px',
    border: '1px solid #e2e8f0',
  },
};
