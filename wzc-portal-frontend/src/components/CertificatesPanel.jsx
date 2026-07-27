import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CertificatesPanel() {
  const [certificates, setCertificates] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setCertificates(res.data));
  }, []);

  const handleDownload = async (certId) => {
    const res = await axios.get(`http://localhost:5000/api/certificates/${certId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${certId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-panel" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Certificates</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {certificates.length === 0 && (
          <p style={{ color: 'var(--muted-light)', fontSize: '0.9rem' }}>No certificates issued yet.</p>
        )}
        {certificates.map((c) => (
          <div key={c.id} style={{
            border: '1px solid var(--line)', borderRadius: '3px', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <strong>{c.full_name}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>{c.course_title}</p>
            </div>
            <button onClick={() => handleDownload(c.id)} style={{
              background: 'transparent', border: '1.5px solid var(--gold)', color: 'var(--gold)',
              padding: '8px 18px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
            }}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
