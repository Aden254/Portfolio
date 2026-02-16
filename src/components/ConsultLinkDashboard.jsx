import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ConsultLinkDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientRecordId: '',
    expiresInHours: 24
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchWithAuth = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      if (response.status === 401) { logout(); throw new Error('Session expired'); }
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [sessionsData, patientsData] = await Promise.all([
          fetchWithAuth('/consultations'),
          fetchWithAuth('/patients')
        ]);
        setSessions(sessionsData);
        setPatients(patientsData.filter(p => !p.Discharge));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const createSession = async () => {
    if (!formData.patientName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/consultations/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Refresh sessions
      const updated = await fetchWithAuth('/consultations');
      setSessions(updated);
      setShowCreateModal(false);
      setFormData({ patientName: '', patientEmail: '', patientRecordId: '', expiresInHours: 24 });
    } catch (error) {
      alert('Failed to create session: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const cancelSession = async (sessionId) => {
    if (!confirm('Cancel this consultation session?')) return;
    try {
      await fetch(`${API_URL}/consultations/${sessionId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updated = await fetchWithAuth('/consultations');
      setSessions(updated);
    } catch (error) {
      alert('Failed to cancel session');
    }
  };

  const endSession = async (sessionId) => {
    if (!confirm('End this consultation?')) return;
    try {
      await fetch(`${API_URL}/consultations/${sessionId}/end`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: '' })
      });
      const updated = await fetchWithAuth('/consultations');
      setSessions(updated);
    } catch (error) {
      alert('Failed to end session');
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      active: { bg: '#d1fae5', text: '#065f46', label: 'Active' },
      completed: { bg: '#e0e7ff', text: '#3730a3', label: 'Completed' },
      expired: { bg: '#fee2e2', text: '#991b1b', label: 'Expired' },
      cancelled: { bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' }
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const pendingSessions = sessions.filter(s => s.status === 'pending' || s.status === 'active');
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'expired' || s.status === 'cancelled');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
          <div style={{ color: '#64748b', fontSize: '16px' }}>Loading ConsultLink...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
        color: 'white',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
              📹 ConsultLink
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Telehealth Consultation Platform — Integrated with HealthHub
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{user?.role} {user?.specialty ? `• ${user.specialty}` : ''}</div>
            </div>
            <button
              onClick={() => navigate('/healthhub')}
              style={{
                padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600'
              }}
            >
              HealthHub
            </button>
            <button onClick={logout} style={{
              padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px'
            }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Active Sessions', value: sessions.filter(s => s.status === 'active').length, icon: '🟢', color: '#10b981' },
            { label: 'Pending', value: sessions.filter(s => s.status === 'pending').length, icon: '🟡', color: '#f59e0b' },
            { label: 'Completed Today', value: sessions.filter(s => s.status === 'completed' && new Date(s.ended_at).toDateString() === new Date().toDateString()).length, icon: '✅', color: '#6366f1' },
            { label: 'Total Sessions', value: sessions.length, icon: '📊', color: '#0ea5e9' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '12px', padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${stat.color}`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create Session Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '16px', fontWeight: '600', boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}
          >
            + New Consultation Session
          </button>
        </div>

        {/* Active & Pending Sessions */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Active & Pending Sessions
          </h2>
          {pendingSessions.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#94a3b8'
            }}>
              No active sessions. Create one to start a consultation.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingSessions.map(session => {
                const sc = getStatusColor(session.status);
                return (
                  <div key={session.session_id} style={{
                    background: 'white', borderRadius: '12px', padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
                  }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                          {session.patient_name}
                        </span>
                        <span style={{
                          padding: '4px 10px', background: sc.bg, color: sc.text,
                          borderRadius: '6px', fontSize: '12px', fontWeight: '600'
                        }}>
                          {sc.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {session.patient_email && <span>{session.patient_email} · </span>}
                        Created {formatDate(session.created_at)} · Expires {formatDate(session.expires_at)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => copyLink(session.session_link, session.session_id)}
                        style={{
                          padding: '8px 16px', background: copiedId === session.session_id ? '#10b981' : '#e0e7ff',
                          color: copiedId === session.session_id ? 'white' : '#4f46e5',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}
                      >
                        {copiedId === session.session_id ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={() => navigate(`/consult-room/${session.session_id}`)}
                        style={{
                          padding: '8px 16px', background: '#0ea5e9', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}
                      >
                        Join Room
                      </button>
                      {session.status === 'active' ? (
                        <button onClick={() => endSession(session.session_id)} style={{
                          padding: '8px 16px', background: '#ef4444', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}>End</button>
                      ) : (
                        <button onClick={() => cancelSession(session.session_id)} style={{
                          padding: '8px 16px', background: '#f1f5f9', color: '#64748b',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                        }}>Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
              Past Sessions
            </h2>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Patient</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Duration</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSessions.slice(0, 20).map(session => {
                    const sc = getStatusColor(session.status);
                    const mins = session.duration_seconds ? Math.round(session.duration_seconds / 60) : 0;
                    return (
                      <tr key={session.session_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{session.patient_name}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{formatDate(session.created_at)}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{mins > 0 ? `${mins} min` : '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 8px', background: sc.bg, color: sc.text, borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }} onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#1e293b' }}>
              New Consultation
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
              Create a secure video session and share the link with your patient.
            </p>

            {/* Select existing patient */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                Select Patient (optional)
              </label>
              <select
                value={formData.patientRecordId}
                onChange={(e) => {
                  const patientId = e.target.value;
                  const patient = patients.find(p => p.patientId === patientId);
                  setFormData({
                    ...formData,
                    patientRecordId: patientId,
                    patientName: patient ? `${patient.Fname} ${patient.Lname}` : formData.patientName
                  });
                }}
                style={{
                  width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white'
                }}
              >
                <option value="">— External patient (enter name below) —</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.Fname} {p.Lname} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                Patient Name *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="e.g., John Doe"
                required
                style={{
                  width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Patient Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                Patient Email (optional)
              </label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                placeholder="patient@email.com"
                style={{
                  width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Expiry */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                Link Valid For
              </label>
              <select
                value={formData.expiresInHours}
                onChange={(e) => setFormData({ ...formData, expiresInHours: parseInt(e.target.value) })}
                style={{
                  width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white'
                }}
              >
                <option value={1}>1 hour</option>
                <option value={4}>4 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                disabled={creating || !formData.patientName.trim()}
                style={{
                  flex: 2, padding: '12px',
                  background: creating || !formData.patientName.trim() ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  cursor: creating ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600'
                }}
              >
                {creating ? 'Creating...' : 'Create Session & Get Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
