import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssignmentsPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm] = useState({});
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };
  const label = { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' };

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, [token]);

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setSelectedAssignment(null);
    setSubmissions([]);
    if (!id) { setAssignments([]); return; }
    axios.get(`http://localhost:5000/api/assignments/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setAssignments(res.data));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourse || !form.title) { setError('Select a course and enter a title'); return; }
    try {
      const res = await axios.post('http://localhost:5000/api/assignments',
        { course_id: selectedCourse, ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments([res.data, ...assignments]);
      setForm({ title: '', description: '', due_date: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const openAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    axios.get(`http://localhost:5000/api/assignments/${assignment.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setSubmissions(res.data));
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGradeForm({ ...gradeForm, [submissionId]: { ...gradeForm[submissionId], [field]: value } });
  };

  const handleGrade = async (submissionId) => {
    const { grade, feedback } = gradeForm[submissionId] || {};
    if (grade === undefined || grade === '') return;
    try {
      await axios.patch(`http://localhost:5000/api/assignments/submissions/${submissionId}/grade`,
        { grade, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      openAssignment(selectedAssignment);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Assignments</h2>

      <label style={label}>Course</label>
      <select value={selectedCourse} onChange={handleCourseSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
        <option value="">-- Choose a course --</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      {selectedCourse && (
        <form onSubmit={handleCreate}className="form-narrow" style={{ marginBottom: '30px' }}>
          <label style={label}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />

          <label style={label}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={inputStyle} />

          <label style={label}>Due Date</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} style={inputStyle} />

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" style={{
            background: 'var(--forest)', color: 'white', padding: '10px 22px',
            border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
          }}>
            Create Assignment
          </button>
        </form>
      )}

      {assignments.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Assignments</h3>
          <div style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
            {assignments.map((a) => (
              <div key={a.id} onClick={() => openAssignment(a)} style={{
                border: '1px solid var(--line)', borderRadius: '3px', padding: '14px',
                cursor: 'pointer', background: selectedAssignment?.id === a.id ? 'rgba(27,67,50,0.05)' : 'transparent'
              }}>
                <strong>{a.title}</strong>
                {a.due_date && <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--sage)' }}>Due {new Date(a.due_date).toDateString()}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAssignment && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
            Submissions for "{selectedAssignment.title}"
          </h3>
          {submissions.length === 0 && (
            <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No submissions yet.</p>
          )}
          <div className="form-wide" style={{ display: 'grid', gap: '12px' }}>
            {submissions.map((s) => (
              <div key={s.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px' }}>
                <strong>{s.full_name}</strong>
                {s.submission_text && <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '6px' }}>{s.submission_text}</p>}
                {s.file_url && (
                  <a href={s.file_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '6px', color: 'var(--forest)', fontWeight: 600, fontSize: '0.85rem' }}>
                    View submitted file
                  </a>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
                  <input type="number" placeholder="Grade" defaultValue={s.grade ?? ''}
                    onChange={(e) => handleGradeChange(s.id, 'grade', e.target.value)}
                    style={{ ...inputStyle, width: '90px', marginBottom: 0 }} />
                  <input placeholder="Feedback" defaultValue={s.feedback ?? ''}
                    onChange={(e) => handleGradeChange(s.id, 'feedback', e.target.value)}
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                  <button onClick={() => handleGrade(s.id)} style={{
                    background: 'var(--forest)', color: 'white', padding: '10px 18px',
                    border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                  }}>
                    Save
                  </button>
                </div>
                {s.grade !== null && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700 }}>
                    Graded: {s.grade}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
