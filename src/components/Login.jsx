import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    { username: 'doc01', password: 'password123', role: 'Doctor', name: 'Dr. John Doe' },
    { username: 'nurse01', password: 'password123', role: 'Nurse', name: 'Nurse Ivy Taylor' },
    { username: 'admin', password: 'password123', role: 'Admin', name: 'Administrator' }
  ];

  const fillDemo = (username, password) => {
    setUsername(username);
    setPassword(password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏥</div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#1e293b',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            HealthHub Manager
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Enterprise Healthcare Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#94a3b8' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = '#5568d3')}
            onMouseOut={(e) => !loading && (e.target.style.background = '#667eea')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px'
        }}>
          <p style={{ 
            margin: '0 0 12px 0', 
            color: '#64748b',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Demo Accounts (Click to fill)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoLogins.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => fillDemo(demo.username, demo.password)}
                style={{
                  padding: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                    {demo.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    {demo.username} / {demo.password}
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  background: demo.role === 'Doctor' ? '#dbeafe' : demo.role === 'Nurse' ? '#fef3c7' : '#e0e7ff',
                  color: demo.role === 'Doctor' ? '#1e40af' : demo.role === 'Nurse' ? '#92400e' : '#3730a3',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {demo.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
            ✨ Built with React, Node.js, Express & MySQL
          </p>
        </div>
      </div>
    </div>
  );
}
