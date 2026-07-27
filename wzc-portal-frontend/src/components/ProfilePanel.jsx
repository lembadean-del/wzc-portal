import { useState } from 'react';
import axios from 'axios';

export default function ProfilePanel({ user }) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  const initials = user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const uploadRes = await axios.post('http://localhost:5000/api/uploads', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.patch('http://localhost:5000/api/auth/me/photo',
        { photo_url: uploadRes.data.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="page-panel form-narrow" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Profile</h2>

      {user.photo_url ? (
        <img src={user.photo_url} alt={user.full_name} style={{
          width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover',
          border: '2px solid var(--gold)', display: 'block', marginBottom: '18px'
        }} />
      ) : (
        <div style={{
          width: '110px', height: '110px', borderRadius: '50%', background: 'var(--forest)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, marginBottom: '18px'
        }}>
          {initials}
        </div>
      )}

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
        Change Photo
      </label>
      <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileSelect} disabled={uploading} />

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>}

      <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--muted)' }}>
        <p><strong style={{ color: 'var(--forest-deep)' }}>{user.full_name}</strong></p>
        <p style={{ marginTop: '4px' }}>{user.email}</p>
      </div>
    </div>
  );
}
