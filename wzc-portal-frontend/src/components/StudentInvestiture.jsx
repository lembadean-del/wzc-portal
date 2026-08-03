import { useState, useEffect } from 'react';
import axios from 'axios';
import InvestitureProgressRing from './InvestitureProgressRing';
import { API_BASE_URL } from '../config';

export default function StudentInvestiture() {
  const [data, setData] = useState({ requirements: [], percent: 0 });
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
        <h3 style={{ color: 'var(--forest-deep)', marginBottom: '10px' }}>Investiture Progress</h3>
        <div style={{ display: 'grid', gap: '6px' }}>
          {data.requirements.map((r) => (
            <div key={r.id} style={{ fontSize: '0.88rem', color: r.completed ? 'var(--forest)' : 'var(--muted-light)' }}>
              {r.completed ? '✓' : '○'} {r.name}
            </div>
          ))}
          {data.requirements.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-light)' }}>No requirements set up yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
