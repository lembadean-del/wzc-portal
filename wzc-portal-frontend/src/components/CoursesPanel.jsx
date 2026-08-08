import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function CoursesPanel() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchCourses = () => {
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.patch(`${API_BASE_URL}/api/courses/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/courses`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm({ title: '', description: '', category: '' });
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEditClick = (c) => {
    setEditingId(c.id);
    setForm({ title: c.title, description: c.description || '', category: c.category || '' });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', category: '' });
    setError('');
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/courses/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };

  const iconBtnStyle = {
    background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px',
    padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
  };

  return (
    <div className="page-panel" style={{flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Courses</h2>

      <form onSubmit={handleSubmit} className="form-narrow" style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
          {editingId ? 'Edit Course' : 'Create Course'}
        </h3>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={inputStyle} />

        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category</label>
        <input name="category" placeholder="e.g. Core, Field Skill, Heritage" value={form.category} onChange={handleChange} style={inputStyle} />

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{
            background: 'var(--forest)', color: 'white', padding: '10px 22px',
            border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
          }}>
            {editingId ? 'Save Changes' : 'Create Course'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{
              background: 'transparent', color: 'var(--forest-deep)', padding: '10px 22px',
              border: '1px solid var(--line)', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
            }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>All Courses</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {courses.map((c) => (
          <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              {c.category || 'Uncategorized'}
            </div>
            <strong>{c.title}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>{c.description}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => handleEditClick(c)} style={iconBtnStyle}>Edit</button>
              <button onClick={() => handleDelete(c)} style={{ ...iconBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}