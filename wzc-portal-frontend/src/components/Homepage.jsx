// wzc-portal-frontend/src/components/Homepage.jsx — new file
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Homepage({ onLoginClick, onRegisterClick }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/courses/public`)
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div>
    
      <div style={{
        background: `url(${process.env.PUBLIC_URL}/hero-bg.jpg) center/cover no-repeat`,
        color: 'white', padding: '90px 24px 100px', textAlign: 'center'
      }}>
        <div style={{
          width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.5)', margin: '0 auto 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.05em'
        }}>
          WZC
        </div>

        <div style={{ fontSize: '0.78rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold-light, #f0d98c)', fontWeight: 600, marginBottom: '14px' }}>
          Learn · Lead · Serve
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', maxWidth: '760px', margin: '0 auto 18px', lineHeight: 1.25 }}>
          Welcome to the West Zambia Conference MasterGuide Learning Portal
        </h1>

        <p style={{ maxWidth: '620px', margin: '0 auto 34px', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          A dedicated online platform for Master Guide leadership training, spiritual growth, and ministry
          development. Learn anytime, anywhere, and track your progress as you prepare for effective service
          in God's work.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onLoginClick} style={{
            background: 'white', color: 'var(--forest-deep)', padding: '13px 32px',
            border: 'none', borderRadius: '2px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Log In
          </button>
          <button onClick={onRegisterClick} style={{
            background: 'transparent', color: 'white', padding: '13px 32px',
            border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: '2px',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Register
          </button>
        </div>
      </div>

      {/* Featured courses */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ color: 'var(--forest-deep)', fontSize: '1.4rem', marginBottom: '28px', textAlign: 'center' }}>
          Featured Courses
        </h2>

        {courses.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--muted-light)', fontSize: '0.9rem' }}>
            Courses will appear here once they're published.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            {courses.map((c) => (
              <div key={c.id} style={{
                border: '1px solid var(--line)', borderRadius: '4px', padding: '22px',
                background: 'white'
              }}>
                {c.category && (
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '8px' }}>
                    {c.category}
                  </div>
                )}
                <h3 style={{ color: 'var(--forest-deep)', fontSize: '1.05rem', marginBottom: '8px' }}>{c.title}</h3>
                {c.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    {c.description.length > 100 ? c.description.slice(0, 100) + '…' : c.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}