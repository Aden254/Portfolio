import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AddPatientModal from './AddPatientModal';

export default function HealthHubManager() {
  const { user, logout, isDoctor, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medicalPersonnel, setMedicalPersonnel] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [refillsDue, setRefillsDue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Helper function to make authenticated requests
  const fetchWithAuth = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout(); // Token expired, logout
        throw new Error('Session expired, please login again');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          patientsData,
          personnelData,
          prescriptionsData,
          testsData,
          reportsData,
          refillsData
        ] = await Promise.all([
          fetchWithAuth('/stats'),
          fetchWithAuth('/patients'),
          fetchWithAuth('/medical-personnel'),
          fetchWithAuth('/prescriptions'),
          fetchWithAuth('/tests/scheduled'),
          fetchWithAuth('/reports'),
          fetchWithAuth('/prescriptions/refills-due')
        ]);

        setStats(statsData);
        setPatients(patientsData);
        setMedicalPersonnel(personnelData);
        setPrescriptions(prescriptionsData);
        setTests(testsData);
        setReports(reportsData);
        setRefillsDue(refillsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDischargePatient = async (patientId) => {
    if (!isDoctor()) {
      alert('Only doctors can discharge patients');
      return;
    }

    if (!confirm(`Are you sure you want to discharge patient ${patientId}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/patients/${patientId}/discharge`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to discharge patient');
      }

      alert('Patient discharged successfully!');

      // Refresh patients list
      const patientsData = await fetchWithAuth('/patients');
      setPatients(patientsData);

      // Refresh stats
      const statsData = await fetchWithAuth('/stats');
      setStats(statsData);
    } catch (error) {
      console.error('Error discharging patient:', error);
      alert('Failed to discharge patient');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.Fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <div style={{ color: '#64748b', fontSize: '16px' }}>Loading HealthHub...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
              🏥 HealthHub Manager
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Enterprise Healthcare Management System
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {user?.role} {user?.specialty ? `• ${user.specialty}` : ''}
              </div>
            </div>
            {(user?.role === 'Doctor' || user?.role === 'Admin') && (
              <button
                onClick={() => window.location.href = '/consultlink'}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                📹 ConsultLink
              </button>
            )}
            <button
              onClick={logout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {['dashboard', 'patients', 'personnel', 'prescriptions', 'tests'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#667eea' : '#64748b',
                border: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}

          {/* Add Patient Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: 'auto'
            }}
          >
            ➕ Add Patient
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard title="Total Patients" value={stats.totalPatients} icon="👥" color="#3b82f6" />
              <StatCard title="Active Patients" value={stats.activePatients} icon="🏥" color="#10b981" />
              <StatCard title="Doctors" value={stats.totalDoctors} icon="👨‍⚕️" color="#8b5cf6" />
              <StatCard title="Nurses" value={stats.totalNurses} icon="👩‍⚕️" color="#ec4899" />
              <StatCard title="Active Prescriptions" value={stats.totalPrescriptions} icon="💊" color="#f59e0b" />
            </div>

            {/* Upcoming Refills */}
            {refillsDue.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>⏰ Upcoming Refills (Next 7 Days)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={thStyle}>Patient</th>
                        <th style={thStyle}>Drug</th>
                        <th style={thStyle}>Refill Date</th>
                        <th style={thStyle}>Days Until</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refillsDue.slice(0, 5).map((refill, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>{refill.PatientFname} {refill.PatientLname}</td>
                          <td style={tdStyle}>{refill.DrugsName}</td>
                          <td style={tdStyle}>{new Date(refill.RefillDate).toLocaleDateString()}</td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: '4px 12px',
                              background: refill.days_until_refill <= 2 ? '#fee2e2' : '#fef3c7',
                              color: refill.days_until_refill <= 2 ? '#dc2626' : '#92400e',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {refill.days_until_refill} days
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Reports */}
            {reports.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>📋 Recent Reports</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={thStyle}>Patient</th>
                        <th style={thStyle}>Doctor</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 5).map((report, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>{report.PatientFname} {report.PatientLname}</td>
                          <td style={tdStyle}>{report.DoctorFname} {report.DoctorLname}</td>
                          <td style={tdStyle}>{report.reportType}</td>
                          <td style={tdStyle}>{new Date(report.Date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="🔍 Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Doctor</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.patientId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={tdStyle}>{patient.patientId}</td>
                      <td
                        style={tdStyle}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        {patient.Fname} {patient.Lname}
                      </td>
                      <td style={tdStyle}>
                        {new Date().getFullYear() - new Date(patient.Birthdate).getFullYear()}
                      </td>
                      <td style={tdStyle}>
                        {patient.DoctorFname ? `Dr. ${patient.DoctorFname} ${patient.DoctorLname}` : 'Unassigned'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px',
                          background: patient.Discharge ? '#fee2e2' : '#dcfce7',
                          color: patient.Discharge ? '#dc2626' : '#16a34a',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {patient.Discharge ? 'Discharged' : 'Active'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {!patient.Discharge && isDoctor() && (
                          <button
                            onClick={() => handleDischargePatient(patient.patientId)}
                            style={{
                              padding: '6px 12px',
                              background: '#f87171',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Discharge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Medical Personnel Tab */}
        {activeTab === 'personnel' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Specialty</th>
                    <th style={thStyle}>License</th>
                    <th style={thStyle}>Patient Count</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalPersonnel.map((person) => (
                    <tr key={person.MedicalPersonnelId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{person.Fname} {person.Lname}</td>
                      <td style={tdStyle}>{person.Specialty || 'Nurse'}</td>
                      <td style={tdStyle}>{person.License}</td>
                      <td style={tdStyle}>{person.patient_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Drug</th>
                    <th style={thStyle}>Dosage</th>
                    <th style={thStyle}>Doctor</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{rx.PatientFname} {rx.PatientLname}</td>
                      <td style={tdStyle}>{rx.DrugsName}</td>
                      <td style={tdStyle}>{rx.Dosage}</td>
                      <td style={tdStyle}>Dr. {rx.DoctorFname} {rx.DoctorLname}</td>
                      <td style={tdStyle}>{new Date(rx.Date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Test Name</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{test.PatientFname} {test.PatientLname}</td>
                      <td style={tdStyle}>{test.TestName}</td>
                      <td style={tdStyle}>{test['Testing Department']}</td>
                      <td style={tdStyle}>{new Date(test.Date).toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {test.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div onClick={() => setSelectedPatient(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>
              Patient Details: {selectedPatient.Fname} {selectedPatient.Lname}
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div><strong>ID:</strong> {selectedPatient.patientId}</div>
              <div><strong>Birthdate:</strong> {new Date(selectedPatient.Birthdate).toLocaleDateString()}</div>
              <div><strong>Phone:</strong> {selectedPatient.Phone}</div>
              <div><strong>Address:</strong> {selectedPatient.Address}</div>
              <div><strong>Emergency Contact:</strong> {selectedPatient.ECname} ({selectedPatient.ECcontact})</div>
              <div><strong>Diet:</strong> {selectedPatient.Diet}</div>
              <div><strong>Doctor:</strong> {selectedPatient.DoctorFname ? `Dr. ${selectedPatient.DoctorFname} ${selectedPatient.DoctorLname}` : 'Unassigned'}</div>
              {selectedPatient.Specialty && <div><strong>Specialty:</strong> {selectedPatient.Specialty}</div>}
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={async () => {
          const patientsData = await fetchWithAuth('/patients');
          setPatients(patientsData);
          const statsData = await fetchWithAuth('/stats');
          setStats(statsData);
          alert('Patient added successfully!');
        }}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
            {value}
          </div>
        </div>
        <div style={{ fontSize: '48px', opacity: 0.2 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Table Styles
const thStyle = {
  textAlign: 'left',
  padding: '12px',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: '12px',
  color: '#1e293b',
  fontSize: '14px'
};