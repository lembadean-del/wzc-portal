import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function StudentAssignments({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/assignments/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setAssignments(res.data));
  }, [courseId]);

  const openAssignment = (assignment) => {
    setActiveAssignment(assignment);
    setMessage('');
    setSubmissionText('');
    setFileUrl('');
    axios.get(`${API_BASE_URL}/api/assignments/${assignment.id}/my-submission`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setMySubmission(res.data);
      setSubmissionText(res.data.submission_text || '');
      setFileUrl(res.data.file_url || '');
    }).catch(() => setMySubmission(null));
  };

  const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setMessage('');
  const data = new FormData();
  data.append('file', file);
  try {
    const res = await axios.post(`${API_BASE_URL}/api/uploads`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFileUrl(res.data.url);
  } catch (err) {
    setMessage(err.response?.data?.error || 'Upload failed');
  }
};
  const handleSubmit = async () => {
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/assignments/${activeAssignment.id}/submit`,
        { submission_text: submissionText, file_url: fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMySubmission(res.data);
      setMessage('Submitted!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };

  if (!activeAssignment) {
    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--forest-deep)', marginBottom: '14px' }}>Assignments</h3>
        {assignments.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--muted-light)' }}>No assignments yet for this course.</p>}
        <div style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          {assignments.map((a) => (
            <div key={a.id} onClick={() => openAssignment(a)} style={{
              border: '1px solid var(--line)', borderRadius: '3px', padding: '14px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
            }}>
              {a.title}
              {a.due_date && <span style={{ float: 'right', fontSize: '0.78rem', color: 'var(--sage)', fontWeight: 600 }}>Due {new Date(a.due_date).toDateString()}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-wide" style={{ marginTop: '30px' }}>
      <span onClick={() => setActiveAssignment(null)} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
        ← Back to assignments
      </span>
      <h3 style={{ color: 'var(--forest-deep)', margin: '14px 0' }}>{activeAssignment.title}</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '16px' }}>{activeAssignment.description}</p>

      {mySubmission?.grade != null && (
        <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--line)', borderRadius: '3px' }}>
          <strong style={{ color: 'var(--gold)' }}>Graded: {mySubmission.grade}</strong>
          {mySubmission.feedback && <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>{mySubmission.feedback}</p>}
        </div>
      )}

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Answer</label>
      <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} rows={5} style={inputStyle} />

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Attach File (optional)</label>
      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileSelect} style={inputStyle} />
       {fileUrl && <p style={{ fontSize: '0.8rem', color: 'var(--sage)', marginTop: '-6px', marginBottom: '12px' }}>File attached ✓</p>}

      {message && <p style={{ color: message === 'Submitted!' ? 'var(--sage)' : 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{message}</p>}

      <button onClick={handleSubmit} style={{
        background: 'var(--forest)', color: 'white', padding: '10px 24px',
        border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
      }}>
        {mySubmission ? 'Resubmit' : 'Submit Assignment'}
      </button>
    </div>
  );
}
