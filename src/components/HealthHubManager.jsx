import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AddPatientModal from './AddPatientModal';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Patients: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="10" cy="6" r="3.5"/>
      <path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
    </svg>
  ),
  Personnel: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="7.5" cy="6" r="2.8"/>
      <path d="M2 18c0-3 2.5-5.5 5.5-5.5"/>
      <circle cx="14" cy="6" r="2.8"/>
      <path d="M14 12.5c3 0 5.5 2.5 5.5 5.5"/>
      <path d="M9.5 18c0-2.5 2-4.5 4.5-4.5"/>
    </svg>
  ),
  Prescriptions: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
      <path d="M8 7h4M7 11h6M7 14h4"/>
      <path d="M8 2v3h4V2"/>
    </svg>
  ),
  Tests: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 2v7L3.5 16a1 1 0 00.9 1.5h11.2a1 1 0 00.9-1.5L12 9V2"/>
      <line x1="7" y1="2" x2="13" y2="2"/>
      <path d="M5.5 14h9"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="6" width="12" height="9" rx="2"/>
      <path d="M14 9l5-3v8l-5-3"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3M13 14l4-4-4-4M17 10H7"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="9" r="6"/>
      <line x1="14" y1="14" x2="18" y2="18"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 5.5v4.5l3 2"/>
    </svg>
  ),
  Report: () => (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M11 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z"/>
      <path d="M11 2v6h6M7 11h6M7 14h4"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 1.5L2 4v4.5C2 12.1 5 15 8 15.5c3-0.5 6-3.4 6-7V4L8 1.5z"/>
      <path d="M5.5 8.5l2 2 3-3"/>
    </svg>
  ),
  Cross: () => (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round">
      <rect x="2" y="2" width="24" height="24" rx="5" stroke="#1d4ed8" strokeWidth="2" fill="#eff6ff"/>
      <line x1="14" y1="8" x2="14" y2="20"/>
      <line x1="8" y1="14" x2="20" y2="14"/>
    </svg>
  ),
  // Stat card background icons (large, decorative)
  People: () => (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="15" cy="13" r="5"/>
      <path d="M5 35c0-5.5 4.5-10 10-10s10 4.5 10 10"/>
      <circle cx="28" cy="13" r="4"/>
      <path d="M26 25c3 0 9 2 9 10"/>
    </svg>
  ),
  Heartbeat: () => (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 20h7l4-10 5 20 4-12 3 6 4-4h5"/>
    </svg>
  ),
  Stethoscope: () => (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 8v10a10 10 0 0020 0v-4"/>
      <circle cx="30" cy="10" r="3"/>
      <circle cx="20" cy="34" r="4"/>
      <path d="M20 28v2"/>
    </svg>
  ),
  Nurse: () => (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="11" r="6"/>
      <path d="M8 36c0-6.6 5.4-12 12-12s12 5.4 12 12"/>
      <line x1="17" y1="8" x2="23" y2="8"/>
      <line x1="20" y1="5" x2="20" y2="11"/>
    </svg>
  ),
  Pill: () => (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="8" y="16" width="24" height="10" rx="5" transform="rotate(-30 8 16)"/>
      <line x1="12" y1="28" x2="28" y2="12"/>
    </svg>
  ),
};

// ── Color tokens ────────────────────────────────────────────────────────────
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
  borderLight:  '#f1f5f9',
  text:         '#0f172a',
  textSec:      '#475569',
  textMuted:    '#94a3b8',
  success:      '#059669',
  successLight: '#d1fae5',
  warning:      '#d97706',
  warningLight: '#fef3c7',
  danger:       '#e11d48',
  dangerLight:  '#ffe4e6',
  purple:       '#7e22ce',
  purpleLight:  '#f5f3ff',
};

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard',     label: 'Dashboard',     Ico: Icon.Dashboard     },
  { id: 'patients',      label: 'Patients',       Ico: Icon.Patients      },
  { id: 'personnel',     label: 'Personnel',      Ico: Icon.Personnel     },
  { id: 'prescriptions', label: 'Prescriptions',  Ico: Icon.Prescriptions },
  { id: 'tests',         label: 'Tests',          Ico: Icon.Tests         },
];

const STAT_CARDS = [
  { key: 'totalPatients',      label: 'Total Patients',        Ico: Icon.People,      color: C.primary   },
  { key: 'activePatients',     label: 'Active Patients',       Ico: Icon.Heartbeat,   color: C.success   },
  { key: 'totalDoctors',       label: 'Physicians',            Ico: Icon.Stethoscope, color: C.purple    },
  { key: 'totalNurses',        label: 'Nursing Staff',         Ico: Icon.Nurse,       color: '#0891b2'   },
  { key: 'totalPrescriptions', label: 'Active Prescriptions',  Ico: Icon.Pill,        color: C.warning   },
];

// ── Table styles ─────────────────────────────────────────────────────────────
const th = { textAlign: 'left', padding: '10px 14px', color: C.textMuted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1.5px solid ${C.border}` };
const td = { padding: '12px 14px', color: C.text, fontSize: '13px', borderBottom: `1px solid ${C.borderLight}` };

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, variant = 'neutral' }) {
  const map = {
    active:     { bg: C.successLight, color: C.success,  border: '#6ee7b7' },
    discharged: { bg: C.dangerLight,  color: C.danger,   border: '#fda4af' },
    scheduled:  { bg: C.primaryLight, color: C.primary,  border: C.primaryBorder },
    refill:     { bg: C.warningLight, color: C.warning,  border: '#fcd34d' },
    urgent:     { bg: C.dangerLight,  color: C.danger,   border: '#fda4af' },
    doctor:     { bg: C.primaryLight, color: C.primary,  border: C.primaryBorder },
    nurse:      { bg: C.successLight, color: C.success,  border: '#6ee7b7' },
    admin:      { bg: C.purpleLight,  color: C.purple,   border: '#d8b4fe' },
    neutral:    { bg: '#f8fafc',      color: C.textSec,  border: C.border },
  };
  const s = map[variant] || map.neutral;
  return (
    <span style={{ padding: '3px 9px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '5px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, Ico, color }) {
  return (
    <div style={{ background: C.surface, borderRadius: '8px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: C.text, lineHeight: 1 }}>
            {value ?? '—'}
          </div>
        </div>
        <div style={{ color, opacity: 0.18 }}>
          <Ico />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HealthHubManager() {
  const { user, logout, isDoctor, token } = useAuth();
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [stats, setStats]                 = useState(null);
  const [patients, setPatients]           = useState([]);
  const [medicalPersonnel, setMedical]    = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [tests, setTests]                 = useState([]);
  const [reports, setReports]             = useState([]);
  const [refillsDue, setRefills]          = useState([]);
  const [selectedPatient, setSelected]    = useState(null);
  const [searchTerm, setSearch]           = useState('');
  const [showAddModal, setAddModal]       = useState(false);
  const [loading, setLoading]             = useState(true);

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
        const [s, p, m, rx, t, r, rf] = await Promise.all([
          fetchAuth('/stats'), fetchAuth('/patients'), fetchAuth('/medical-personnel'),
          fetchAuth('/prescriptions'), fetchAuth('/tests/scheduled'),
          fetchAuth('/reports'), fetchAuth('/prescriptions/refills-due'),
        ]);
        setStats(s); setPatients(p); setMedical(m); setPrescriptions(rx);
        setTests(t); setReports(r); setRefills(rf);
      } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to load data');
      } finally { setLoading(false); }
    })();
  }, [token]);

  const handleDischarge = async (patientId) => {
    if (!isDoctor()) return alert('Only physicians can discharge patients');
    if (!confirm(`Discharge patient ${patientId}?`)) return;
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/discharge`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to discharge');
      alert('Patient discharged successfully');
      const [p, s] = await Promise.all([fetchAuth('/patients'), fetchAuth('/stats')]);
      setPatients(p); setStats(s);
    } catch (err) { alert(err.message); }
  };

  const filtered = patients.filter(p =>
    p.Fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: C.bg, flexDirection: 'column', gap: '12px' }}>
      <Icon.Cross />
      <div style={{ color: C.textSec, fontSize: '14px', fontWeight: '500' }}>Loading HealthHub…</div>
    </div>
  );

  const roleVariant = user?.role === 'Doctor' ? 'doctor' : user?.role === 'Nurse' ? 'nurse' : 'admin';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ background: C.navy, color: 'white', padding: '0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon.Cross />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em' }}>HealthHub</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Enterprise Health Management</div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80', fontSize: '11px', fontWeight: '500' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}/>
              System Online
            </div>

            {/* User info */}
            <div style={{ width: '1px', height: '28px', background: '#334155' }}/>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user?.role}{user?.specialty ? ` · ${user.specialty}` : ''}</div>
            </div>

            {/* ConsultLink */}
            {(user?.role === 'Doctor' || user?.role === 'Admin') && (
              <button
                onClick={() => window.location.href = '/consultlink'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseOut={e  => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <Icon.Video /> ConsultLink
              </button>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#475569'; }}
              onMouseOut={e  => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
            >
              <Icon.Logout /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Sub-nav / tabs ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2px' }}>
          {TABS.map(({ id, label, Ico }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '14px 16px', background: 'none',
                color: active ? C.primary : C.textSec,
                border: 'none', borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
                marginBottom: '-1px', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '500',
                transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
              }}>
                <Ico /> {label}
              </button>
            );
          })}

          <button
            onClick={() => setAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', padding: '7px 14px', background: C.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = C.primaryHover}
            onMouseOut={e  => e.currentTarget.style.background = C.primary}
          >
            <Icon.Plus /> Admit Patient
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {STAT_CARDS.map(({ key, label, Ico, color }) => (
                <StatCard key={key} label={label} value={stats[key]} Ico={Ico} color={color} />
              ))}
            </div>

            {refillsDue.length > 0 && (
              <Panel icon={<Icon.Clock />} title="Prescription Refills Due — Next 7 Days" accent={C.warning}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Patient</th><th style={th}>Medication</th><th style={th}>Refill Date</th><th style={th}>Days Remaining</th></tr></thead>
                  <tbody>
                    {refillsDue.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td style={td}>{r.PatientFname} {r.PatientLname}</td>
                        <td style={td}>{r.DrugsName}</td>
                        <td style={td}>{new Date(r.RefillDate).toLocaleDateString()}</td>
                        <td style={td}><Badge label={`${r.days_until_refill}d`} variant={r.days_until_refill <= 2 ? 'urgent' : 'refill'}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )}

            {reports.length > 0 && (
              <Panel icon={<Icon.Report />} title="Recent Clinical Reports" style={{ marginTop: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Patient</th><th style={th}>Attending Physician</th><th style={th}>Report Type</th><th style={th}>Date</th></tr></thead>
                  <tbody>
                    {reports.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td style={td}>{r.PatientFname} {r.PatientLname}</td>
                        <td style={td}>Dr. {r.DoctorFname} {r.DoctorLname}</td>
                        <td style={td}>{r.reportType}</td>
                        <td style={td}>{new Date(r.Date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )}
          </div>
        )}

        {/* Patients */}
        {activeTab === 'patients' && (
          <Panel title={`Patient Registry (${filtered.length})`} icon={<Icon.Patients />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', background: '#fafafa', border: `1px solid ${C.border}`, borderRadius: '7px', padding: '8px 12px' }}>
              <Icon.Search /><input type="text" placeholder="Search by name or patient ID…" value={searchTerm} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '13px', color: C.text }}/>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Patient ID</th><th style={th}>Name</th><th style={th}>Age</th><th style={th}>Attending Physician</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.patientId} style={{ cursor: 'pointer', transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px', color: C.textSec }}>{p.patientId}</td>
                      <td style={{ ...td, fontWeight: '600', color: C.primary, cursor: 'pointer' }} onClick={() => setSelected(p)}>{p.Fname} {p.Lname}</td>
                      <td style={td}>{new Date().getFullYear() - new Date(p.Birthdate).getFullYear()}</td>
                      <td style={td}>{p.DoctorFname ? `Dr. ${p.DoctorFname} ${p.DoctorLname}` : <span style={{ color: C.textMuted }}>Unassigned</span>}</td>
                      <td style={td}><Badge label={p.Discharge ? 'Discharged' : 'Active'} variant={p.Discharge ? 'discharged' : 'active'}/></td>
                      <td style={td}>
                        {!p.Discharge && isDoctor() && (
                          <button onClick={() => handleDischarge(p.patientId)} style={{ padding: '4px 12px', background: 'white', color: C.danger, border: `1px solid ${C.dangerLight}`, borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.1s' }}
                            onMouseOver={e => { e.currentTarget.style.background = C.dangerLight; }}
                            onMouseOut={e  => { e.currentTarget.style.background = 'white'; }}>
                            Discharge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* Personnel */}
        {activeTab === 'personnel' && (
          <Panel title="Medical Personnel" icon={<Icon.Personnel />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Name</th><th style={th}>Role</th><th style={th}>Specialty</th><th style={th}>License</th><th style={th}>Patients</th></tr></thead>
                <tbody>
                  {medicalPersonnel.map(p => (
                    <tr key={p.MedicalPersonnelId} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...td, fontWeight: '600' }}>{p.Fname} {p.Lname}</td>
                      <td style={td}><Badge label={p.DoctorId ? 'Physician' : 'Nurse'} variant={p.DoctorId ? 'doctor' : 'nurse'}/></td>
                      <td style={td}>{p.Specialty || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px', color: C.textSec }}>{p.License}</td>
                      <td style={td}>{p.patient_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* Prescriptions */}
        {activeTab === 'prescriptions' && (
          <Panel title="Active Prescriptions" icon={<Icon.Prescriptions />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Patient</th><th style={th}>Medication</th><th style={th}>Dosage</th><th style={th}>Prescribing Physician</th><th style={th}>Date</th><th style={th}>Status</th></tr></thead>
                <tbody>
                  {prescriptions.map((rx, i) => (
                    <tr key={i} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...td, fontWeight: '500' }}>{rx.PatientFname} {rx.PatientLname}</td>
                      <td style={{ ...td, fontWeight: '600' }}>{rx.DrugsName}</td>
                      <td style={td}>{rx.Dosage}</td>
                      <td style={td}>Dr. {rx.DoctorFname} {rx.DoctorLname}</td>
                      <td style={td}>{new Date(rx.Date).toLocaleDateString()}</td>
                      <td style={td}><Badge label={rx.Status || 'Active'} variant="active"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* Tests */}
        {activeTab === 'tests' && (
          <Panel title="Scheduled Diagnostics" icon={<Icon.Tests />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>Patient</th><th style={th}>Test</th><th style={th}>Department</th><th style={th}>Scheduled Date</th><th style={th}>Status</th></tr></thead>
                <tbody>
                  {tests.map((t, i) => (
                    <tr key={i} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...td, fontWeight: '500' }}>{t.PatientFname} {t.PatientLname}</td>
                      <td style={{ ...td, fontWeight: '600' }}>{t.TestName}</td>
                      <td style={td}>{t['Testing Department']}</td>
                      <td style={td}>{new Date(t.Date).toLocaleDateString()}</td>
                      <td style={td}><Badge label={t.Status} variant="scheduled"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '12px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.textMuted, fontSize: '11px' }}>
            <Icon.Shield />
            HIPAA Compliant · All access is logged and audited · Unauthorized access is prohibited
          </div>
          <div style={{ color: C.textMuted, fontSize: '11px' }}>
            HealthHub v3.0 · {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* ── Patient Details Modal ── */}
      {selectedPatient && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '10px', padding: '28px', maxWidth: '560px', width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '4px' }}>Patient Record</div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: C.text }}>{selectedPatient.Fname} {selectedPatient.Lname}</h2>
              </div>
              <Badge label={selectedPatient.Discharge ? 'Discharged' : 'Active'} variant={selectedPatient.Discharge ? 'discharged' : 'active'}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                ['Patient ID',         selectedPatient.patientId],
                ['Date of Birth',      new Date(selectedPatient.Birthdate).toLocaleDateString()],
                ['Phone',              selectedPatient.Phone],
                ['Address',            selectedPatient.Address],
                ['Emergency Contact',  `${selectedPatient.ECname} (${selectedPatient.ECcontact})`],
                ['Diet',               selectedPatient.Diet],
                ['Attending Physician',selectedPatient.DoctorFname ? `Dr. ${selectedPatient.DoctorFname} ${selectedPatient.DoctorLname}` : 'Unassigned'],
                ['Specialty',          selectedPatient.Specialty || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '10px 12px', background: C.bg, borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{k}</div>
                  <div style={{ fontSize: '13px', color: C.text, fontWeight: '500' }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', background: C.navy, color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* ── Add Patient Modal ── */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setAddModal(false)}
        onSuccess={async () => {
          const [p, s] = await Promise.all([fetchAuth('/patients'), fetchAuth('/stats')]);
          setPatients(p); setStats(s);
          alert('Patient admitted successfully');
        }}
      />
    </div>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ title, icon, children, accent, style: extraStyle }) {
  return (
    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, marginBottom: '14px', overflow: 'hidden', ...extraStyle }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, color: C.textSec }}>
        <span style={{ color: accent || C.primary }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>{title}</span>
      </div>
      <div style={{ padding: '0' }}>{children}</div>
    </div>
  );
}
