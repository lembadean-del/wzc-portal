import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AssignmentsPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
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
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, [token]);

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setSelectedAssignment(null);
    setSubmissions([]);
    if (!id) { setAssignments([]); return; }
    axios.get(`${API_BASE_URL}/api/assignments/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setAssignments(res.data));
  };


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleCreate = async (e) => {
  e.preventDefault();
  setError('');
  if (!selectedCourse || !form.title) { setError('Select a course and enter a title'); return; }
  try {
    if (editingAssignmentId) {
      await axios.patch(`${API_BASE_URL}/api/assignments/${editingAssignmentId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingAssignmentId(null);
    } else {
      await axios.post(`${API_BASE_URL}/api/assignments`,
        { course_id: selectedCourse, ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    setForm({ title: '', description: '', due_date: '' });
    handleCourseSelect({ target: { value: selectedCourse } });
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong');
  }
};

  const openAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    axios.get(`${API_BASE_URL}/api/assignments/${assignment.id}/submissions`, {
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
      await axios.patch(`${API_BASE_URL}/api/assignments/submissions/${submissionId}/grade`,
        { grade, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      openAssignment(selectedAssignment);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };
  
const handleEditAssignmentClick = (a) => {
  setEditingAssignmentId(a.id);
  setForm({ title: a.title, description: a.description || '', due_date: a.due_date ? a.due_date.slice(0,10) : '' });
  setError('');
};

const handleCancelAssignmentEdit = () => {
  setEditingAssignmentId(null);
  setForm({ title: '', description: '', due_date: '' });
};

const handleDeleteAssignment = async (a) => {
  if (!window.confirm(`Delete assignment "${a.title}"?`)) return;
  setError('');
  try {
    await axios.delete(`${API_BASE_URL}/api/assignments/${a.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (selectedAssignment?.id === a.id) { setSelectedAssignment(null); setSubmissions([]); }
    handleCourseSelect({ target: { value: selectedCourse } });
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
          <div style={{ display: 'flex', gap: '10px' }}>
  <button type="submit" style={{
    background: 'var(--forest)', color: 'white', padding: '10px 22px',
    border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
  }}>
    {editingAssignmentId ? 'Save Changes' : 'Create Assignment'}
  </button>
  {editingAssignmentId && (
    <button type="button" onClick={handleCancelAssignmentEdit} style={{
      background: 'transparent', color: 'var(--forest-deep)', padding: '10px 22px',
      border: '1px solid var(--line)', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
    }}>
      Cancel
    </button>
  )}
</div>
        </form>
      )}

      {assignments.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Assignments</h3>
          <div style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
           {assignments.map((a) => (
  <div key={a.id} style={{
    border: '1px solid var(--line)', borderRadius: '3px', padding: '14px',
    background: selectedAssignment?.id === a.id ? 'rgba(27,67,50,0.05)' : 'transparent'
  }}>
    <div onClick={() => openAssignment(a)} style={{ cursor: 'pointer' }}>
      <strong>{a.title}</strong>
      {a.due_date && <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--sage)' }}>Due {new Date(a.due_date).toDateString()}</span>}
    </div>
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      <button onClick={() => handleEditAssignmentClick(a)} style={{
        background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px',
        padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
      }}>Edit</button>
      <button onClick={() => handleDeleteAssignment(a)} style={{
        background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '2px',
        padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
      }}>Delete</button>
    </div>
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
