import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InstructorsPanel() {
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'instructor' });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchInstructors = () => {
    axios.get('http://localhost:5000/api/auth/users?role=instructor', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setInstructors(res.data));
  };

  useEffect(() => { fetchInstructors(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/create-staff', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ full_name: '', email: '', password: '', role: 'instructor' });
      fetchInstructors();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Instructors</h2>

      <form onSubmit={handleSubmit} className="form-narrow" style={{ marginBottom: '40px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} required style={inputStyle} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required style={inputStyle} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Role</label>
        <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

        <button type="submit" style={{
          background: 'var(--forest)', color: 'white', padding: '10px 22px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
        }}>
          Create Account
        </button>
      </form>

      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Current Instructors</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {instructors.length === 0 && (
          <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No instructors added yet.</p>
        )}
        {instructors.map((i) => (
          <div key={i.id} style={{
            border: '1px solid var(--line)', borderRadius: '3px', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <strong>{i.full_name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{i.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
