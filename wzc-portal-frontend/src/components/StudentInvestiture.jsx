// wzc-portal-frontend/src/components/StudentInvestiture.jsx — replace the entire file with this
import { useState, useEffect } from 'react';
import axios from 'axios';
import InvestitureProgressRing from './InvestitureProgressRing';
import { API_BASE_URL } from '../config';

export default function StudentInvestiture() {
  const [data, setData] = useState({ categories: [], totalEarned: 0, totalMax: 100, percent: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/investiture/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setData(res.data));
  }, []);

  return (
    <div style={{ padding: '40px 40px 10px', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
      <InvestitureProgressRing percent={data.percent} />
      <div>
        <h3 style={{ color: 'var(--forest-deep)', marginBottom: '4px' }}>Investiture Progress</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '10px' }}>
          {data.totalEarned} / {data.totalMax} marks
        </p>
        <div style={{ display: 'grid', gap: '6px' }}>
          {data.categories.map((c) => (
            <div key={c.id} style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>
              {c.name}: {c.marks_earned} / {c.max_marks}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}