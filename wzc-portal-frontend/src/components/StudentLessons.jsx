import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentQuiz from './StudentQuiz';
import StudentAssignments from './StudentAssignments';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
export default function StudentLessons({ courseId, onBack }) {
  const [lessons, setLessons] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/lessons/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setLessons(res.data));
  }, [courseId]);

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <span onClick={onBack} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
        ← Back to Courses
      </span>
      <h2 style={{ color: 'var(--forest-deep)', margin: '16px 0 24px' }}>Lessons</h2>
      <div className="form-wide" style={{ display: 'grid', gap: '14px' }}>
        {lessons.map((l) => (
          <div key={l.id} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '18px' }}>
            <strong style={{ color: 'var(--forest-deep)' }}>{l.order_index}. {l.title}</strong>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '8px' }}>{l.content}</p>
           {l.video_url && (
  getYouTubeEmbedUrl(l.video_url) ? (
    <iframe
      src={getYouTubeEmbedUrl(l.video_url)}
      title={l.title}
      style={{ width: '100%', maxWidth: '480px', aspectRatio: '16/9', border: 'none', borderRadius: '3px', marginTop: '10px', display: 'block' }}
      allowFullScreen
    />
  ) : (
    <a href={l.video_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '8px', color: 'var(--forest)', fontWeight: 600, fontSize: '0.85rem' }}>
      ▶ Watch Video
    </a>
  )
)}
            {l.pdf_url && (
              <a href={l.pdf_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '6px', color: 'var(--forest)', fontWeight: 600, fontSize: '0.85rem' }}>
                ⬇ Download Notes
              </a>
            )}
          </div>
        ))}
      </div>
      <StudentQuiz courseId={courseId} />
      <StudentAssignments courseId={courseId} />
    </div>
  );
}
