import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function RegistrationSettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [deadlineDraft, setDeadlineDraft] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('token');

  const inputStyle = {
    padding: '10px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.9rem'
  };

  const load = () => {
    axios.get(`${API_BASE_URL}/api/settings/registration`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setSettings(res.data);
      setDeadlineDraft(res.data.deadline ? res.data.deadline.slice(0, 16) : '');
    });
  };

  useEffect(load, []);

  const handleToggle = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/settings/registration`,
        { is_open: !settings.is_open },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeadline = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/settings/registration`,
        { deadline: deadlineDraft ? new Date(deadlineDraft).toISOString() : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="page-panel form-narrow" style={{ flex: 1 }}>
      <h2 style={{ color: 'var(--forest-deep)', marginBottom: '24px' }}>Registration Settings</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          Status: <span style={{ color: settings.effectively_open ? 'var(--forest)' : 'var(--danger)' }}>
            {settings.effectively_open ? 'Open' : 'Closed'}
          </span>
        </span>
        <button onClick={handleToggle} disabled={saving} style={{
          background: settings.is_open ? 'var(--danger)' : 'var(--forest)', color: 'white', padding: '8px 18px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
        }}>
          {settings.is_open ? 'Close Registration' : 'Reopen Registration'}
        </button>
      </div>

      {!settings.is_open ? null : settings.deadline && !settings.effectively_open && (
        <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '14px' }}>
          Marked open, but the deadline has passed — registration is closed to students until you extend it below.
        </p>
      )}

      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
        Registration Deadline (optional)
      </label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="datetime-local"
          value={deadlineDraft}
          onChange={(e) => setDeadlineDraft(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleSaveDeadline} disabled={saving} style={{
          background: 'var(--forest)', color: 'white', padding: '10px 18px',
          border: 'none', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
        }}>
          Save Deadline
        </button>
        {deadlineDraft && (
          <button onClick={() => { setDeadlineDraft(''); }} style={{
            background: 'transparent', color: 'var(--muted)', padding: '10px 12px',
            border: '1px solid var(--line)', borderRadius: '2px', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            Clear
          </button>
        )}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '10px' }}>
        Leave blank for no deadline. If set, registration automatically closes after this date/time — you can edit or clear it anytime.
      </p>

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '14px' }}>{error}</p>}
    </div>
  );
}