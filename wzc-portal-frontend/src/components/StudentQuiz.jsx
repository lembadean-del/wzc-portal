import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentQuiz({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quizzes/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setQuizzes(res.data));
  }, [courseId]);

  const openQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setResult(null);
    setAnswers({});
    axios.get(`http://localhost:5000/api/quizzes/${quiz.id}/take`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setQuestions(res.data));
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    const res = await axios.post(`http://localhost:5000/api/quizzes/${activeQuiz.id}/submit`,
      { answers },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setResult(res.data);
  };

  const optionStyle = (questionId, opt) => ({
    display: 'block', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '2px',
    marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem',
    background: answers[questionId] === opt ? 'rgba(27,67,50,0.08)' : 'transparent',
    borderColor: answers[questionId] === opt ? 'var(--forest)' : 'var(--line)'
  });

  if (!activeQuiz) {
    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--forest-deep)', marginBottom: '14px' }}>Quizzes</h3>
        {quizzes.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--muted-light)' }}>No quizzes yet for this course.</p>}
        <div style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          {quizzes.map((q) => (
            <div key={q.id} onClick={() => openQuiz(q)} style={{
              border: '1px solid var(--line)', borderRadius: '3px', padding: '14px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
            }}>
              {q.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ marginTop: '30px', maxWidth: '400px' }}>
        <h3 style={{ color: 'var(--forest-deep)', marginBottom: '10px' }}>Quiz Complete</h3>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
          Score: {result.score} / {result.total_questions}
        </p>
        <span onClick={() => setActiveQuiz(null)} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'block', marginTop: '14px' }}>
          ← Back to quizzes
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px', maxWidth: '500px' }}>
      <span onClick={() => setActiveQuiz(null)} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
        ← Back to quizzes
      </span>
      <h3 style={{ color: 'var(--forest-deep)', margin: '14px 0' }}>{activeQuiz.title}</h3>
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.92rem' }}>{q.question_text}</p>
          {['A', 'B', 'C', 'D'].map((opt) => (
            <div key={opt} onClick={() => handleAnswer(q.id, opt)} style={optionStyle(q.id, opt)}>
              {opt}. {q[`option_${opt.toLowerCase()}`]}
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} style={{
        background: 'var(--forest)', color: 'white', padding: '10px 24px',
        border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer'
      }}>
        Submit Quiz
      </button>
    </div>
  );
}
