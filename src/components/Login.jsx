import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CrossIcon = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round">
    <rect x="6" y="6" width="36" height="36" rx="6" stroke="#1d4ed8" strokeWidth="2.5" fill="#eff6ff"/>
    <line x1="24" y1="14" x2="24" y2="34"/>
    <line x1="14" y1="24" x2="34" y2="24"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 15s6-3 6-7.5V3.5L8 1.5 2 3.5V7.5C2 12 8 15 8 15z"/>
    <path d="M5.5 8l2 2 3-3"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="9" width="12" height="9" rx="2"/>
    <path d="M7 9V6a3 3 0 016 0v3"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 2L2 17h16L10 2z"/>
    <line x1="10" y1="9" x2="10" y2="12"/>
    <circle cx="10" cy="15" r="0.5" fill="currentColor"/>
  </svg>
);

const ROLES = {
  Doctor:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Nurse:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Admin:   { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/healthhub');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { username: 'doc01',   password: 'password123', role: 'Doctor', name: 'Dr. John Doe'       },
    { username: 'nurse01', password: 'password123', role: 'Nurse',  name: 'Nurse Ivy Taylor'   },
    { username: 'admin',   password: 'password123', role: 'Admin',  name: 'Administrator'      },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Authorized access banner */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#64748b',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        <LockIcon />
        Authorized Personnel Only — Restricted System Access
      </div>

      <div style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #e2e8f0',
      }}>
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <CrossIcon />
          </div>
          <h1 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em' }}>
            HealthHub Manager
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            Enterprise Healthcare Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #d1d5db', borderRadius: '7px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                color: '#0f172a', background: '#fafafa',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => { e.target.style.borderColor = '#1d4ed8'; e.target.style.background = '#fff'; }}
              onBlur={e   => { e.target.style.borderColor = '#d1d5db'; e.target.style.background = '#fafafa'; }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #d1d5db', borderRadius: '7px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                color: '#0f172a', background: '#fafafa',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => { e.target.style.borderColor = '#1d4ed8'; e.target.style.background = '#fff'; }}
              onBlur={e   => { e.target.style.borderColor = '#d1d5db'; e.target.style.background = '#fafafa'; }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', padding: '10px 12px', borderRadius: '7px',
              marginBottom: '16px', fontSize: '13px',
            }}>
              <span style={{ marginTop: '1px', flexShrink: 0 }}><AlertIcon /></span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#93c5fd' : '#1d4ed8',
              color: 'white', border: 'none', borderRadius: '7px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', marginBottom: '20px',
              letterSpacing: '0.01em',
            }}
            onMouseOver={e => !loading && (e.target.style.background = '#1e40af')}
            onMouseOut={e  => !loading && (e.target.style.background = '#1d4ed8')}
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '11px', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Demo Access — Click to Fill
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {demoLogins.map((demo, idx) => {
              const role = ROLES[demo.role];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setUsername(demo.username); setPassword(demo.password); }}
                  style={{
                    padding: '9px 12px', background: '#fafafa',
                    border: '1px solid #e5e7eb', borderRadius: '7px',
                    cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.1s, border-color 0.1s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={e  => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px', fontSize: '13px' }}>
                      {demo.name}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                      {demo.username}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    background: role.bg, color: role.color,
                    border: `1px solid ${role.border}`,
                    borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                  }}>
                    {demo.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HIPAA Footer */}
        <div style={{
          marginTop: '20px', paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '5px', color: '#94a3b8', fontSize: '11px',
        }}>
          <ShieldIcon />
          HIPAA-compliant · Encrypted session · Access logged
        </div>
      </div>

      {/* Bottom system note */}
      <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
        HealthHub v3.0 · React · Node.js · MySQL
      </p>
    </div>
  );
}
