import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function StudentCourses({ onOpenCourse }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = () => {
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));

    axios.get(`${API_BASE_URL}/api/enrollments/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setEnrollments(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const isEnrolled = (courseId) => enrollments.some((e) => e.course_id === courseId);
const handleDownloadCertificate = async (courseId) => {
  setMessage('');
  try {
    let certId;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/certificates`, { course_id: courseId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      certId = res.data.id;
    } catch (err) {
      if (err.response?.status === 409) {
        const existing = await axios.get(`${API_BASE_URL}/api/certificates/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        certId = existing.data.id;
      } else {
        throw err;
      }
    }

    const pdfRes = await axios.get(`${API_BASE_URL}/api/certificates/${certId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${certId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    setMessage(err.response?.data?.error || 'Something went wrong');
  }
};

  const handleEnroll = async (courseId) => {
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/enrollments`, { course_id: courseId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '20px' }}>Courses</h2>
      {message && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px' }}>{message}</p>}
      <div className="form-wide" style={{ display: 'grid', gap: '14px'}}>
        {courses.map((c) => {
          const enrolled = isEnrolled(c.id);
          const enrollment = enrollments.find((e) => e.course_id === c.id);
          return (
            <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '18px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                {c.category || 'Uncategorized'}
              </div>
              <strong style={{ color: 'var(--forest-deep)' }}>{c.title}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px', marginBottom: '12px' }}>{c.description}</p>

              {enrolled ? (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sage)', fontWeight: 600, marginBottom: '8px' }}>
                    Progress: {enrollment.progress}% {enrollment.completed && '· Completed'}
                  </div>
                  <button onClick={() => onOpenCourse(c.id)} style={{
                    background: 'var(--forest)', color: 'white', padding: '8px 18px',
                    border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                  }}>
                    View Lessons
                  </button>
                  {enrollment.completed && (
  <button onClick={() => handleDownloadCertificate(c.id)} style={{
    background: 'transparent', border: '1.5px solid var(--gold)', color: 'var(--gold)',
    padding: '8px 18px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer',
    fontSize: '0.85rem', marginLeft: '10px'
  }}>
    Download Certificate
  </button>
)}
                </>
              ) : (
                <button onClick={() => handleEnroll(c.id)} style={{
                  background: 'transparent', border: '1.5px solid var(--forest)', color: 'var(--forest-deep)',
                  padding: '8px 18px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                }}>
                  Enroll
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
