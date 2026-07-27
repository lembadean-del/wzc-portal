import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuizzesPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, [token]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourse || !quizTitle) { setError('Select a course and enter a title'); return; }
    try {
      const res = await axios.post('http://localhost:5000/api/quizzes',
        { course_id: selectedCourse, title: quizTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizzes([...quizzes, res.data]);
      setQuizTitle('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleQChange = (e) => setQForm({ ...qForm, [e.target.name]: e.target.value });

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedQuiz) { setError('Select a quiz first'); return; }
    try {
      const res = await axios.post(`http://localhost:5000/api/quizzes/${selectedQuiz.id}/questions`, qForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions([...questions, res.data]);
      setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0 });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };
  const label = { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Quizzes</h2>

      {/* Create a new quiz */}
      <form onSubmit={handleCreateQuiz} className="form-narrow" style={{ marginBottom: '30px' }}>
        <label style={label}>Course</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} style={inputStyle}>
          <option value="">-- Choose a course --</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>

        <label style={label}>Quiz Title</label>
        <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} style={inputStyle} />

        <button type="submit" style={{
          background: 'var(--forest)', color: 'white', padding: '10px 22px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
        }}>
          Create Quiz
        </button>
      </form>

      {/* Pick a quiz to add questions to */}
      {quizzes.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <label style={label}>Select quiz to add questions</label>
          <select
            value={selectedQuiz?.id || ''}
            onChange={(e) => setSelectedQuiz(quizzes.find((q) => q.id === Number(e.target.value)))}
            style={{ ...inputStyle, maxWidth: '420px' }}
          >
            <option value="">-- Choose a quiz --</option>
            {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>
      )}

      {/* Add question form */}
      {selectedQuiz && (
        <form onSubmit={handleAddQuestion} style={{ maxWidth: '420px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
            Add question to "{selectedQuiz.title}"
          </h3>

          <label style={label}>Question</label>
          <textarea name="question_text" value={qForm.question_text} onChange={handleQChange} rows={2} required style={inputStyle} />

          <label style={label}>Option A</label>
          <input name="option_a" value={qForm.option_a} onChange={handleQChange} required style={inputStyle} />
          <label style={label}>Option B</label>
          <input name="option_b" value={qForm.option_b} onChange={handleQChange} required style={inputStyle} />
          <label style={label}>Option C</label>
          <input name="option_c" value={qForm.option_c} onChange={handleQChange} required style={inputStyle} />
          <label style={label}>Option D</label>
          <input name="option_d" value={qForm.option_d} onChange={handleQChange} required style={inputStyle} />

          <label style={label}>Correct Option</label>
          <select name="correct_option" value={qForm.correct_option} onChange={handleQChange} style={inputStyle}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <label style={label}>Order</label>
          <input type="number" name="order_index" value={qForm.order_index} onChange={handleQChange} style={inputStyle} />

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" style={{
            background: 'var(--forest)', color: 'white', padding: '10px 22px',
            border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
          }}>
            Add Question
          </button>
        </form>
      )}

      {/* Questions added so far (this session) */}
      {questions.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Questions added</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {questions.map((q) => (
              <div key={q.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '12px', fontSize: '0.88rem' }}>
                {q.order_index}. {q.question_text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
