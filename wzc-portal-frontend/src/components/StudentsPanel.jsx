import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/users?role=student', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStudents(res.data));
  }, []);

  return (
    <div className="page-panel" style={{flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Students</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {students.length === 0 && (
          <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No students registered yet.</p>
        )}
        {students.map((s) => (
          <div key={s.id} style={{
            border: '1px solid var(--line)', borderRadius: '3px', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <strong>{s.full_name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{s.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
