import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';


export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', nrc_number: '', church: '', district: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', marginBottom: '14px'
  };
  const labelStyle = { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', padding: '0 20px' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: '10px' }}>
        Learn · Lead · Serve
      </div>
      <h1 style={{ color: 'var(--forest-deep)', fontSize: '1.7rem', marginBottom: '24px' }}>Create your account</h1>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} required style={inputStyle} />

        <label style={labelStyle}>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />

        <label style={labelStyle}>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required style={inputStyle} />

        <label style={labelStyle}>NRC Number</label>
        <input name="nrc_number" placeholder="e.g. 123456/78/1" value={form.nrc_number} onChange={handleChange} required style={inputStyle} />

        <label style={labelStyle}>Church</label>
        <input name="church" placeholder="e.g. Lusaka Central SDA" value={form.church} onChange={handleChange} required style={inputStyle} />

        <label style={labelStyle}>District (optional)</label>
        <input name="district" value={form.district} onChange={handleChange} style={inputStyle} />

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '14px' }}>{error}</p>}

        <button type="submit" style={{
          background: 'var(--forest)', color: 'white', padding: '13px 26px',
          border: 'none', borderRadius: '2px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%', marginBottom: '14px'
        }}>
          Create Account
        </button>

        <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer' }}>
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
