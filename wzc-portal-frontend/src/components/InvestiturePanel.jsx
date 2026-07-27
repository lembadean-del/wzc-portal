import { useState, useEffect } from 'react';
import axios from 'axios';
import InvestitureProgressRing from './InvestitureProgressRing';

export default function InvestiturePanel() {
  const [courses, setCourses] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', course_id: '', order_index: 0 });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };
  const label = { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' };

  const fetchRequirements = () => {
    axios.get('http://localhost:5000/api/investiture/requirements', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setRequirements(res.data));
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));

    axios.get('http://localhost:5000/api/auth/users?role=student', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStudents(res.data));

    fetchRequirements();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name) { setError('Name is required'); return; }
    try {
      await axios.post('http://localhost:5000/api/investiture/requirements',
        { ...form, course_id: form.course_id || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ name: '', description: '', course_id: '', order_index: 0 });
      fetchRequirements();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudent(id);
    if (!id) { setStudentData(null); return; }
    axios.get(`http://localhost:5000/api/investiture/student/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStudentData(res.data));
  };

  const handleToggle = async (requirementId, completed) => {
    try {
      await axios.patch(`http://localhost:5000/api/investiture/${requirementId}/student/${selectedStudent}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:5000/api/investiture/student/${selectedStudent}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Investiture Requirements</h2>

      <form onSubmit={handleCreate} className="form-narrow" style={{ marginBottom: '30px' }}>
        <label style={label}>Requirement Name</label>
        <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />

        <label style={label}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} style={inputStyle} />

        <label style={label}>Linked Course (optional — auto-completes when finished)</label>
        <select name="course_id" value={form.course_id} onChange={handleChange} style={inputStyle}>
          <option value="">-- None (manual checkoff) --</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>

        <label style={label}>Order</label>
        <input type="number" name="order_index" value={form.order_index} onChange={handleChange} style={inputStyle} />

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

        <button type="submit" style={{
          background: 'var(--forest)', color: 'white', padding: '10px 22px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
        }}>
          Add Requirement
        </button>
      </form>

      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>All Requirements</h3>
      <div className="form-wide" style={{ display: 'grid', gap: '12px' }}
>
        {requirements.length === 0 && (
          <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No requirements created yet.</p>
        )}
        {requirements.map((r) => (
          <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '14px' }}>
            <strong>{r.name}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 600, marginLeft: '10px', textTransform: 'uppercase' }}>
              {r.course_id ? 'Auto (course)' : 'Manual'}
            </span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Check Student Progress</h3>
      <select value={selectedStudent} onChange={handleStudentSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
        <option value="">-- Choose a student --</option>
        {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
      </select>

      {studentData && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <InvestitureProgressRing percent={studentData.percent} />
          <div style={{ display: 'grid', gap: '8px' }}>
            {studentData.requirements.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: r.completed ? 'var(--forest)' : 'var(--muted-light)', minWidth: '200px' }}>
                  {r.completed ? '✓' : '○'} {r.name}
                </span>
                {!r.course_id && (
                  <button onClick={() => handleToggle(r.id, r.completed)} style={{
                    background: 'transparent', border: '1.5px solid var(--forest)', color: 'var(--forest-deep)',
                    padding: '4px 12px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem'
                  }}>
                    {r.completed ? 'Unmark' : 'Mark Complete'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
