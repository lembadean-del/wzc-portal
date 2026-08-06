// wzc-portal-frontend/src/components/StudentsPanel.jsx — replace the entire file with this
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/users?role=student`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setStudents(res.data));
  }, []);

  const cellStyle = { padding: '10px 12px', borderBottom: '1px solid var(--line)', fontSize: '0.88rem', textAlign: 'left' };
  const headStyle = { ...cellStyle, fontWeight: 700, color: 'var(--forest-deep)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--forest-deep)', margin: 0 }}>Students</h2>
        <button onClick={() => window.print()} style={{
          background: 'var(--forest)', color: 'white', padding: '9px 18px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
        }}>
          Print List
        </button>
      </div>

      <div className="print-area">
        <h2 style={{ color: 'var(--forest-deep)', marginBottom: '4px' }}>WZC MasterGuide Learning Portal — Registered Students</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Total registered: {students.length}
        </p>

        {students.length === 0 ? (
          <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No students registered yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={headStyle}>#</th>
                <th style={headStyle}>Full Name</th>
                <th style={headStyle}>Email</th>
                <th style={headStyle}>NRC Number</th>
                <th style={headStyle}>Church</th>
                <th style={headStyle}>District</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td style={cellStyle}>{i + 1}</td>
                  <td style={cellStyle}>{s.full_name}</td>
                  <td style={cellStyle}>{s.email}</td>
                  <td style={cellStyle}>{s.nrc_number || '—'}</td>
                  <td style={cellStyle}>{s.church || '—'}</td>
                  <td style={cellStyle}>{s.district || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}