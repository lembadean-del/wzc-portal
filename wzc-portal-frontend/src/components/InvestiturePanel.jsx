// wzc-portal-frontend/src/components/InvestiturePanel.jsx — replace the entire file with this
import { useState, useEffect } from 'react';
import axios from 'axios';
import InvestitureProgressRing from './InvestitureProgressRing';
import { API_BASE_URL } from '../config';

export default function InvestiturePanel() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [marksDraft, setMarksDraft] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(null);
  const token = localStorage.getItem('token');

  const inputStyle = {
    width: '90px', padding: '8px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem'
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/users?role=student`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStudents(res.data));
  }, []);

  const loadStudent = async (id) => {
    const res = await axios.get(`${API_BASE_URL}/api/investiture/student/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStudentData(res.data);
    const draft = {};
    res.data.categories.forEach((c) => { draft[c.id] = c.marks_earned; });
    setMarksDraft(draft);
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudent(id);
    setStudentData(null);
    setError('');
    if (id) loadStudent(id);
  };

  const handleMarksChange = (categoryId, value) => {
    setMarksDraft({ ...marksDraft, [categoryId]: value });
  };

  const handleSave = async (category) => {
    setError('');
    const value = Number(marksDraft[category.id]);
    if (Number.isNaN(value) || value < 0 || value > category.max_marks) {
      setError(`${category.name}: marks must be between 0 and ${category.max_marks}`);
      return;
    }
    setSaving(category.id);
    try {
      await axios.patch(`${API_BASE_URL}/api/investiture/${category.id}/student/${selectedStudent}`,
        { marks_earned: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadStudent(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Investiture Requirements</h2>

      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Enter Student Marks</h3>
      <select value={selectedStudent} onChange={handleStudentSelect} style={{ ...inputStyle, width: '100%', maxWidth: '420px', marginBottom: '20px' }}>
        <option value="">-- Choose a student --</option>
        {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
      </select>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

      {studentData && (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <InvestitureProgressRing percent={studentData.percent} />
          <div style={{ display: 'grid', gap: '10px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '4px' }}>
              Total: {studentData.totalEarned} / {studentData.totalMax} marks
            </p>
            {studentData.categories.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--forest-deep)', minWidth: '190px' }}>
                  {c.name} <span style={{ color: 'var(--muted-light)' }}>(/{c.max_marks})</span>
                </span>
                <input
                  type="number" min={0} max={c.max_marks}
                  value={marksDraft[c.id] ?? 0}
                  onChange={(e) => handleMarksChange(c.id, e.target.value)}
                  style={inputStyle}
                />
                <button onClick={() => handleSave(c)} disabled={saving === c.id} style={{
                  background: 'var(--forest)', color: 'white', padding: '6px 14px',
                  border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem'
                }}>
                  {saving === c.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}