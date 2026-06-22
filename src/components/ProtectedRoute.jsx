import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" style={{ marginBottom: '16px' }}>
            <rect x="6" y="6" width="36" height="36" rx="6" strokeWidth="2" fill="#eff6ff"/>
            <line x1="24" y1="14" x2="24" y2="34"/>
            <line x1="14" y1="24" x2="34" y2="24"/>
          </svg>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Verifying credentials…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
