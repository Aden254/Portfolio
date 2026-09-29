import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = {
  Cross: () => (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round">
      <rect x="2" y="2" width="24" height="24" rx="5" strokeWidth="2" fill="#eff6ff"/>
      <line x1="14" y1="8" x2="14" y2="20"/>
      <line x1="8" y1="14" x2="20" y2="14"/>
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="6" width="12" height="9" rx="2"/>
      <path d="M14 9l5-3v8l-5-3"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 12a4 4 0 005.66 0l2-2a4 4 0 00-5.66-5.66l-1 1"/>
      <path d="M12 8a4 4 0 00-5.66 0l-2 2a4 4 0 005.66 5.66l1-1"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 8l4 4 6-6"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10 3L5 8l5 5"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3M13 14l4-4-4-4M17 10H7"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 1.5L2 4v4.5C2 12.1 5 15 8 15.5c3-0.5 6-3.4 6-7V4L8 1.5z"/>
      <path d="M5.5 8.5l2 2 3-3"/>
    </svg>
  ),
  End: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13"/>
      <line x1="13" y1="3" x2="3" y2="13"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 5.5v4.5l3 2"/>
    </svg>
  ),
};

// ── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:      '#1d4ed8',
  primaryHover: '#1e40af',
  primaryLight: '#eff6ff',
  primaryBorder:'#bfdbfe',
  navy:         '#0f172a',
  navyMid:      '#1e293b',
  bg:           '#f1f5f9',
  surface:      '#ffffff',
  border:       '#e2e8f0',
  borderLight:  '#f8fafc',
  text:         '#0f172a',
  textSec:      '#475569',
  textMuted:    '#94a3b8',
  success:      '#059669',
  successLight: '#d1fae5',
  warning:      '#d97706',
  warningLight: '#fef3c7',
  danger:       '#e11d48',
  dangerLight:  '#ffe4e6',
  teal:         '#0891b2',
  tealLight:    '#e0f2fe',
  purple:       '#7e22ce',
  purpleLight:  '#f5f3ff',
};

const th = { textAlign: 'left', padding: '10px 14px', color: C.textMuted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1.5px solid ${C.border}` };
const td = { padding: '12px 14px', color: C.text, fontSize: '13px', borderBottom: `1px solid ${C.borderLight}` };

function Badge({ label, variant }) {
  const map = {
    active:    { bg: C.successLight, color: C.success,  border: '#6ee7b7' },
    pending:   { bg: C.warningLight, color: C.warning,  border: '#fcd34d' },
    completed: { bg: C.purpleLight,  color: C.purple,   border: '#d8b4fe' },
    expired:   { bg: C.dangerLight,  color: C.danger,   border: '#fda4af' },
    cancelled: { bg: '#f1f5f9',      color: C.textSec,  border: C.border  },
  };
  const s = map[variant] || map.cancelled;
  return (
    <span style={{ padding: '3px 9px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '5px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: C.surface, borderRadius: '8px', padding: '18px 20px', border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '11px', color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', color: C.text }}>{value}</div>
    </div>
  );
}

const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ConsultLinkDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions]         = useState([]);
  const [patients, setPatients]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [creating, setCreating]         = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [copiedId, setCopiedId]         = useState(null);
  const [formData, setFormData]         = useState({ patientName: '', patientEmail: '', patientRecordId: '', expiresInHours: 24 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchAuth = async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { if (res.status === 401) { logout(); throw new Error('Session expired'); } throw new Error(`HTTP ${res.status}`); }
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, p] = await Promise.all([fetchAuth('/consultations'), fetchAuth('/patients')]);
        setSessions(s);
        setPatients(p.filter(pt => !pt.Discharge));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const createSession = async () => {
    if (!formData.patientName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/consultations/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updated = await fetchAuth('/consultations');
      setSessions(updated);
      setShowModal(false);
      setFormData({ patientName: '', patientEmail: '', patientRecordId: '', expiresInHours: 24 });

      // Inform the doctor whether the email was delivered
      if (formData.patientEmail) {
        if (data.emailSent) {
          alert(`Session created. Consultation link sent to ${formData.patientEmail}.`);
        } else {
          // Email not configured on backend — show the link so the doctor can share it manually
          const link = data.sessionLink;
          window.prompt(
            `Session created, but email delivery is not configured on the server.\nCopy the link below and send it to the patient manually:`,
            link
          );
        }
      }
    } catch (err) { alert('Failed to create session: ' + err.message); }
    finally { setCreating(false); }
  };

  const cancelSession = async (id) => {
    if (!confirm('Cancel this consultation session?')) return;
    try {
      await fetch(`${API_URL}/consultations/${id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setSessions(await fetchAuth('/consultations'));
    } catch { alert('Failed to cancel session'); }
  };

  const endSession = async (id) => {
    if (!confirm('End this consultation?')) return;
    try {
      await fetch(`${API_URL}/consultations/${id}/end`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });
      setSessions(await fetchAuth('/consultations'));
    } catch { alert('Failed to end session'); }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pending   = sessions.filter(s => s.status === 'pending' || s.status === 'active');
  const past      = sessions.filter(s => ['completed', 'expired', 'cancelled'].includes(s.status));
  const today     = new Date().toDateString();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: C.bg, flexDirection: 'column', gap: '12px' }}>
      <Icon.Cross />
      <div style={{ color: C.textSec, fontSize: '14px', fontWeight: '500' }}>Loading ConsultLink…</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ background: C.navy, color: 'white', padding: '0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon.Cross />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em' }}>ConsultLink</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Telehealth · HealthHub Integration</div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80', fontSize: '11px', fontWeight: '500' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}/>
              System Online
            </div>
            <div style={{ width: '1px', height: '28px', background: '#334155' }}/>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user?.role}{user?.specialty ? ` · ${user.specialty}` : ''}</div>
            </div>
            <button onClick={() => navigate('/healthhub')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              <Icon.ArrowLeft /> HealthHub
            </button>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              <Icon.Logout /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <StatCard label="Active Sessions"   value={sessions.filter(s => s.status === 'active').length}   color={C.success} />
          <StatCard label="Pending"           value={sessions.filter(s => s.status === 'pending').length}  color={C.warning} />
          <StatCard label="Completed Today"   value={sessions.filter(s => s.status === 'completed' && new Date(s.ended_at).toDateString() === today).length} color={C.purple} />
          <StatCard label="Total Sessions"    value={sessions.length}                                       color={C.teal}    />
        </div>

        {/* New session button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: C.primary, color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = C.primaryHover}
            onMouseOut={e  => e.currentTarget.style.background = C.primary}
          >
            <Icon.Plus /> New Consultation Session
          </button>
        </div>

        {/* Active & Pending */}
        <Panel title="Active & Pending Sessions" icon={<Icon.Video />} accent={C.primary}>
          {pending.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: C.textMuted, fontSize: '13px' }}>
              No active sessions. Create one to begin a consultation.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pending.map(s => (
                <div key={s.session_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 18px', borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{s.patient_name}</span>
                      <Badge label={s.status} variant={s.status}/>
                    </div>
                    <div style={{ fontSize: '12px', color: C.textMuted, display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Icon.Clock />
                      {s.patient_email && <span>{s.patient_email} ·&nbsp;</span>}
                      Created {formatDate(s.created_at)} · Expires {formatDate(s.expires_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => copyLink(s.session_link, s.session_id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: copiedId === s.session_id ? C.successLight : C.primaryLight, color: copiedId === s.session_id ? C.success : C.primary, border: `1px solid ${copiedId === s.session_id ? '#6ee7b7' : C.primaryBorder}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {copiedId === s.session_id ? <><Icon.Check /> Copied</> : <><Icon.Link /> Copy Link</>}
                    </button>
                    <button
                      onClick={() => navigate(`/consult-room/${s.session_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: C.teal, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      <Icon.Video /> Join Room
                    </button>
                    {s.status === 'active'
                      ? <button onClick={() => endSession(s.session_id)}    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', background: 'white', color: C.danger, border: `1px solid ${C.dangerLight}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}><Icon.End /> End</button>
                      : <button onClick={() => cancelSession(s.session_id)} style={{ padding: '7px 13px', background: 'white', color: C.textSec, border: `1px solid ${C.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Past sessions */}
        {past.length > 0 && (
          <Panel title="Session History" icon={<Icon.Clock />} style={{ marginTop: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Patient</th><th style={th}>Date</th><th style={th}>Duration</th><th style={th}>Status</th></tr></thead>
              <tbody>
                {past.slice(0, 20).map(s => {
                  const mins = s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0;
                  return (
                    <tr key={s.session_id} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...td, fontWeight: '500' }}>{s.patient_name}</td>
                      <td style={td}>{formatDate(s.created_at)}</td>
                      <td style={td}>{mins > 0 ? `${mins} min` : '—'}</td>
                      <td style={td}><Badge label={s.status} variant={s.status}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '12px 28px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.textMuted, fontSize: '11px' }}>
            <Icon.Shield />
            HIPAA Compliant · All consultations are encrypted · Access is logged
          </div>
          <div style={{ color: C.textMuted, fontSize: '11px' }}>ConsultLink v2.0 · {new Date().getFullYear()}</div>
        </div>
      </footer>

      {/* ── New Session Modal ── */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: C.surface, borderRadius: '10px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${C.border}` }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '4px' }}>Telehealth</div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: C.text }}>New Consultation Session</h2>
              <p style={{ margin: '5px 0 0', color: C.textSec, fontSize: '13px' }}>Create a secure video link to share with your patient.</p>
            </div>

            {[
              { label: 'Select Patient (optional)', type: 'select', key: 'patientRecordId' },
              { label: 'Patient Name *',            type: 'text',   key: 'patientName',   placeholder: 'e.g. Jane Doe' },
              { label: 'Patient Email (optional)',   type: 'email',  key: 'patientEmail',  placeholder: 'patient@email.com' },
              { label: 'Link Valid For',             type: 'select2',key: 'expiresInHours' },
            ].map(({ label, type, key, placeholder }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: C.textSec, fontSize: '12px', fontWeight: '600' }}>{label}</label>
                {type === 'select' ? (
                  <select value={formData.patientRecordId} onChange={e => {
                    const id = e.target.value;
                    const pt = patients.find(p => p.patientId === id);
                    setFormData({ ...formData, patientRecordId: id, patientName: pt ? `${pt.Fname} ${pt.Lname}` : formData.patientName });
                  }} style={inputStyle}>
                    <option value="">— External patient (enter name below) —</option>
                    {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.Fname} {p.Lname} ({p.patientId})</option>)}
                  </select>
                ) : type === 'select2' ? (
                  <select value={formData.expiresInHours} onChange={e => setFormData({ ...formData, expiresInHours: parseInt(e.target.value) })} style={inputStyle}>
                    {[1, 4, 12, 24, 48].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                  </select>
                ) : (
                  <input type={type} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} placeholder={placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border}/>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: C.bg, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={createSession} disabled={creating || !formData.patientName.trim()} style={{ flex: 2, padding: '10px', background: creating || !formData.patientName.trim() ? C.textMuted : C.primary, color: 'white', border: 'none', borderRadius: '7px', cursor: creating ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {creating ? 'Creating…' : 'Create Session & Get Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
const C2 = { border: '#e2e8f0', surface: '#ffffff', text: '#0f172a', primary: '#1d4ed8' };
function Panel({ title, icon, children, accent, style: extra }) {
  return (
    <div style={{ background: C2.surface, borderRadius: '8px', border: `1px solid ${C2.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden', ...extra }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 18px', borderBottom: `1px solid ${C2.border}` }}>
        <span style={{ color: accent || C2.primary }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: C2.text }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
  borderRadius: '7px', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box', background: '#fafafa', color: '#0f172a',
  transition: 'border-color 0.15s',
};
