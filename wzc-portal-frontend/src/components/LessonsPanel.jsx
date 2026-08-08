import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function LessonsPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, []);

  const fetchLessons = (courseId) => {
    axios.get(`${API_BASE_URL}/api/lessons/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setLessons(res.data));
  };

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setEditingId(null);
    setForm({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 });
    if (id) fetchLessons(id);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/uploads`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ ...form, pdf_url: res.data.url });
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourse) { setError('Select a course first'); return; }
    try {
      if (editingId) {
        await axios.patch(`${API_BASE_URL}/api/lessons/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/lessons`, { ...form, course_id: selectedCourse }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 });
      setEditingId(null);
      fetchLessons(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEditClick = (l) => {
    setEditingId(l.id);
    setForm({
      title: l.title, content: l.content || '', video_url: l.video_url || '',
      pdf_url: l.pdf_url || '', order_index: l.order_index || 0
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', content: '', video_url: '', pdf_url: '', order_index: 0 });
    setError('');
  };

  const handleDelete = async (l) => {
    if (!window.confirm(`Delete lesson "${l.title}"?`)) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/lessons/${l.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLessons(selectedCourse);
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
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Lessons</h2>

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Course</label>
      <select value={selectedCourse} onChange={handleCourseSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
        <option value="">-- Choose a course --</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      {selectedCourse && (
        <>
          <form onSubmit={handleSubmit} className="form-narrow" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
              {editingId ? 'Edit Lesson' : 'Add Lesson'}
            </h3>

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Lesson Title</label>
            <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={3} style={inputStyle} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Video URL (optional)</label>
            <input name="video_url" value={form.video_url} onChange={handleChange} style={inputStyle} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Notes / PDF (optional)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} style={inputStyle} />
            {form.pdf_url && <p style={{ fontSize: '0.8rem', color: 'var(--sage)', marginTop: '-6px', marginBottom: '12px' }}>File attached ✓</p>}

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Order</label>
            <input type="number" name="order_index" value={form.order_index} onChange={handleChange} style={inputStyle} />

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{
                background: 'var(--forest)', color: 'white', padding: '10px 22px',
                border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
              }}>
                {editingId ? 'Save Changes' : 'Add Lesson'}
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

          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Lessons in this course</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {lessons.map((l) => (
              <div key={l.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px' }}>
                <strong>{l.order_index}. {l.title}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>{l.content}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleEditClick(l)} style={iconBtnStyle}>Edit</button>
                  <button onClick={() => handleDelete(l)} style={{ ...iconBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}