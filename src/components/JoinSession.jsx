import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

export default function JoinSession() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionToken = searchParams.get('token');

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [joining, setJoining] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const validateSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/consultations/join/${sessionId}?token=${sessionToken}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid session');
        }

        setSessionInfo(data);
        setPatientName(data.patientName || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && sessionToken) {
      validateSession();
    } else {
      setError('Missing session ID or token. Please use the link provided by your doctor.');
      setLoading(false);
    }
  }, [sessionId, sessionToken]);

  const handleJoin = () => {
    if (!patientName.trim()) return;
    setJoining(true);
    // Navigate to the consultation room with patient context
    navigate(`/consult-room/${sessionId}?token=${sessionToken}&name=${encodeURIComponent(patientName)}&role=patient`);
  };

  // Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
          <div style={{ color: '#64748b', fontSize: '16px' }}>Validating your session...</div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '22px' }}>
            Unable to Join
          </h2>
          <p style={{ margin: '0 0 24px 0', color: '#ef4444', fontSize: '15px' }}>
            {error}
          </p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            If you believe this is an error, please contact your healthcare provider for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Valid session - show join form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍⚕️</div>
          <h1 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px', fontWeight: '600' }}>
            Video Consultation
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Secure telehealth session via ConsultLink
          </p>
        </div>

        {/* Doctor Info */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px',
          padding: '16px', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600', marginBottom: '8px' }}>
            YOUR DOCTOR
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e' }}>
            {sessionInfo.doctorName}
          </div>
          {sessionInfo.specialty && (
            <div style={{ fontSize: '14px', color: '#0369a1', marginTop: '4px' }}>
              {sessionInfo.specialty}
            </div>
          )}
        </div>

        {/* Patient Name Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
            Your Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%', padding: '12px', border: '2px solid #e2e8f0',
              borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Permissions Notice */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
          padding: '12px', marginBottom: '24px', fontSize: '13px', color: '#92400e'
        }}>
          Your browser will ask for camera and microphone access. Please allow both for the video consultation to work.
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={!patientName.trim() || joining}
          style={{
            width: '100%', padding: '16px',
            background: !patientName.trim() ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            color: 'white', border: 'none', borderRadius: '10px',
            cursor: !patientName.trim() ? 'not-allowed' : 'pointer',
            fontSize: '18px', fontWeight: '600',
            boxShadow: patientName.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
          }}
        >
          {joining ? 'Connecting...' : 'Join Consultation'}
        </button>

        {/* Footer */}
        <p style={{ margin: '20px 0 0 0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
          End-to-end encrypted · HIPAA compliant · Powered by ConsultLink
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px'
  }
};
