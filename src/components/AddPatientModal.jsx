import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AddPatientModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [formData, setFormData] = useState({
    patientId: '',
    Fname: '',
    Lname: '',
    Birthdate: '',
    Phone: '',
    Address: '',
    ECname: '',
    ECcontact: '',
    Diet: '',
    MedicalHistory: '',
    Diagnosis: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add patient');
      }

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        Fname: '',
        Lname: '',
        Birthdate: '',
        Phone: '',
        Address: '',
        ECname: '',
        ECcontact: '',
        Diet: '',
        MedicalHistory: '',
        Diagnosis: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>
            ➕ Add New Patient
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0',
              width: '32px',
              height: '32px',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Patient ID */}
            <div>
              <label style={labelStyle}>Patient ID *</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="P011"
                required
                style={inputStyle}
              />
            </div>

            {/* Birthdate */}
            <div>
              <label style={labelStyle}>Birthdate *</label>
              <input
                type="date"
                name="Birthdate"
                value={formData.Birthdate}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* First Name */}
            <div>
              <label style={labelStyle}>First Name *</label>
              <input
                type="text"
                name="Fname"
                value={formData.Fname}
                onChange={handleChange}
                placeholder="John"
                required
                style={inputStyle}
              />
            </div>

            {/* Last Name */}
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input
                type="text"
                name="Lname"
                value={formData.Lname}
                onChange={handleChange}
                placeholder="Doe"
                required
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                placeholder="555-1234"
                style={inputStyle}
              />
            </div>

            {/* Address */}
            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                placeholder="123 Main St"
                style={inputStyle}
              />
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label style={labelStyle}>Emergency Contact Name</label>
              <input
                type="text"
                name="ECname"
                value={formData.ECname}
                onChange={handleChange}
                placeholder="Jane Doe"
                style={inputStyle}
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label style={labelStyle}>Emergency Contact Phone</label>
              <input
                type="tel"
                name="ECcontact"
                value={formData.ECcontact}
                onChange={handleChange}
                placeholder="555-5678"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Diet */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Diet</label>
            <input
              type="text"
              name="Diet"
              value={formData.Diet}
              onChange={handleChange}
              placeholder="Vegetarian, Gluten-Free"
              style={inputStyle}
            />
          </div>

          {/* Medical History */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Medical History</label>
            <textarea
              name="MedicalHistory"
              value={formData.MedicalHistory}
              onChange={handleChange}
              placeholder="Enter medical history..."
              rows="3"
              style={{...inputStyle, resize: 'vertical'}}
            />
          </div>

          {/* Diagnosis */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Diagnosis</label>
            <textarea
              name="Diagnosis"
              value={formData.Diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis..."
              rows="3"
              style={{...inputStyle, resize: 'vertical'}}
            />
          </div>

          {/* Buttons */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#475569'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                background: loading ? '#94a3b8' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  color: '#475569',
  fontSize: '13px',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};
