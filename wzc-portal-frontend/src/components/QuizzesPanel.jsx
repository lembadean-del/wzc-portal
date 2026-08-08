import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function QuizzesPanel() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qForm, setQForm] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCourses(res.data));
  }, [token]);

  const fetchQuizzes = (courseId) => {
    axios.get(`${API_BASE_URL}/api/quizzes/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setQuizzes(res.data));
  };

  const handleCourseSelect = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    setSelectedQuiz(null);
    setQuestions([]);
    setEditingQuizId(null);
    setQuizTitle('');
    if (id) fetchQuizzes(id); else setQuizzes([]);
  };

  const handleCreateOrEditQuiz = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCourse || !quizTitle) { setError('Select a course and enter a title'); return; }
    try {
      if (editingQuizId) {
        await axios.patch(`${API_BASE_URL}/api/quizzes/${editingQuizId}`, { title: quizTitle }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/quizzes`,
          { course_id: selectedCourse, title: quizTitle },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setQuizTitle('');
      setEditingQuizId(null);
      fetchQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEditQuizClick = (q) => {
    setEditingQuizId(q.id);
    setQuizTitle(q.title);
    setError('');
  };

  const handleCancelQuizEdit = () => {
    setEditingQuizId(null);
    setQuizTitle('');
  };

  const handleDeleteQuiz = async (q) => {
    if (!window.confirm(`Delete quiz "${q.title}"? This also removes its questions.`)) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/quizzes/${q.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedQuiz?.id === q.id) { setSelectedQuiz(null); setQuestions([]); }
      fetchQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const fetchQuestions = (quizId) => {
    axios.get(`${API_BASE_URL}/api/quizzes/${quizId}/take`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setQuestions(res.data));
  };

  const handleSelectQuiz = (id) => {
    const quiz = quizzes.find((q) => q.id === Number(id));
    setSelectedQuiz(quiz || null);
    setEditingQuestionId(null);
    setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0 });
    if (quiz) fetchQuestions(quiz.id); else setQuestions([]);
  };

  const handleQChange = (e) => setQForm({ ...qForm, [e.target.name]: e.target.value });

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedQuiz) { setError('Select a quiz first'); return; }
    try {
      if (editingQuestionId) {
        await axios.patch(`${API_BASE_URL}/api/quizzes/questions/${editingQuestionId}`, qForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/quizzes/${selectedQuiz.id}/questions`, qForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0 });
      setEditingQuestionId(null);
      fetchQuestions(selectedQuiz.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEditQuestionClick = async (q) => {
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/quizzes/questions/${q.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const full = res.data;
      setEditingQuestionId(full.id);
      setQForm({
        question_text: full.question_text, option_a: full.option_a, option_b: full.option_b,
        option_c: full.option_c, option_d: full.option_d, correct_option: full.correct_option,
        order_index: full.order_index || 0
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load question');
    }
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', order_index: 0 });
  };

  const handleDeleteQuestion = async (q) => {
    if (!window.confirm('Delete this question?')) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/quizzes/questions/${q.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions(selectedQuiz.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem', marginBottom: '12px'
  };
  const label = { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' };
  const iconBtnStyle = {
    background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px',
    padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Quizzes</h2>

      <label style={label}>Course</label>
      <select value={selectedCourse} onChange={handleCourseSelect} style={{ ...inputStyle, maxWidth: '420px' }}>
        <option value="">-- Choose a course --</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      {selectedCourse && (
        <>
          {/* Create / edit a quiz */}
          <form onSubmit={handleCreateOrEditQuiz} className="form-narrow" style={{ marginTop: '10px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
              {editingQuizId ? 'Edit Quiz Title' : 'Create Quiz'}
            </h3>
            <label style={label}>Quiz Title</label>
            <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} style={inputStyle} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{
                background: 'var(--forest)', color: 'white', padding: '10px 22px',
                border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
              }}>
                {editingQuizId ? 'Save Changes' : 'Create Quiz'}
              </button>
              {editingQuizId && (
                <button type="button" onClick={handleCancelQuizEdit} style={{
                  background: 'transparent', color: 'var(--forest-deep)', padding: '10px 22px',
                  border: '1px solid var(--line)', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Existing quizzes for this course */}
          {quizzes.length > 0 && (
            <div style={{ marginBottom: '30px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>Quizzes in this course</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {quizzes.map((q) => (
                  <div key={q.id} style={{
                    border: '1px solid var(--line)', borderRadius: '3px', padding: '14px',
                    background: selectedQuiz?.id === q.id ? 'rgba(27,67,50,0.05)' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleSelectQuiz(q.id)}>
                      <strong>{q.title}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleEditQuizClick(q)} style={iconBtnStyle}>Edit</button>
                      <button onClick={() => handleDeleteQuiz(q)} style={{ ...iconBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add / edit question form */}
          {selectedQuiz && (
            <form onSubmit={handleSaveQuestion} style={{ maxWidth: '420px', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
                {editingQuestionId ? 'Edit question' : `Add question to "${selectedQuiz.title}"`}
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{
                  background: 'var(--forest)', color: 'white', padding: '10px 22px',
                  border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
                }}>
                  {editingQuestionId ? 'Save Changes' : 'Add Question'}
                </button>
                {editingQuestionId && (
                  <button type="button" onClick={handleCancelQuestionEdit} style={{
                    background: 'transparent', color: 'var(--forest-deep)', padding: '10px 22px',
                    border: '1px solid var(--line)', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Questions in the selected quiz */}
          {selectedQuiz && (
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest-deep)' }}>
                Questions in "{selectedQuiz.title}"
              </h3>
              {questions.length === 0 && (
                <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No questions yet.</p>
              )}
              <div style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
                {questions.map((q) => (
                  <div key={q.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '12px', fontSize: '0.88rem' }}>
                    {q.order_index}. {q.question_text}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleEditQuestionClick(q)} style={iconBtnStyle}>Edit</button>
                      <button onClick={() => handleDeleteQuestion(q)} style={{ ...iconBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}