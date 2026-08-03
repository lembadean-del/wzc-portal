import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';


export default function ResultsPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('token');

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, []);

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setSelectedQuiz('');
    setResults([]);
    if (!id) { setQuizzes([]); return; }
    axios.get(`${API_BASE_URL}/api/quizzes/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setQuizzes(res.data));
  };

  const handleQuizSelect = (e) => {
    const id = e.target.value;
    setSelectedQuiz(id);
    if (!id) { setResults([]); return; }
    axios.get(`${API_BASE_URL}/api/quizzes/${id}/results`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setResults(res.data));
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Results</h2>

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Course</label>
      <select value={selectedCourse} onChange={handleCourseSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
        <option value="">-- Choose a course --</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      {selectedCourse && (
        <>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Quiz</label>
          <select value={selectedQuiz} onChange={handleQuizSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
            <option value="">-- Choose a quiz --</option>
            {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </>
      )}

      {selectedQuiz && (
        <>
          <h3 style={{ fontSize: '1rem', margin: '30px 0 14px', color: 'var(--forest-deep)' }}>Student Results</h3>
          {results.length === 0 && (
            <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No submissions yet for this quiz.</p>
          )}
          <div style={{ display: 'grid', gap: '12px' }}>
            {results.map((r) => (
              <div key={r.id} style={{
                border: '1px solid var(--line)', borderRadius: '3px', padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <strong>{r.full_name}</strong>
                <span style={{ color: 'var(--forest)', fontWeight: 700 }}>
                  {r.score} / {r.total_questions}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
