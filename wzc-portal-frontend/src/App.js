// deploy test v2S
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AdminDashboard from './components/AdminDashboard';
import RegisterForm from './components/RegisterForm';
import Homepage from './components/Homepage';
import { API_BASE_URL } from './config';


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister,] = useState(false);
  const [showHome, setShowHome] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    window.location.href = '/'; // force a fresh reload to the correct dashboard
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong');
  }
};

  const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/'; // force a fresh reload back to login
};
  const inputStyle = {
    width: '100%', padding: '11px', border: '1px solid var(--line)',
    borderRadius: '2px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif'
  };

  if (loading) return null;

  if (!user) {
    if (showHome) {
      return (
        <div>
          <Navbar />
          <Homepage
            onLoginClick={() => setShowHome(false)}
            onRegisterClick={() => { setShowHome(false); setShowRegister(true); }}
          />
        </div>
      );
    }
    if (showRegister) {
      return (
        <div>
          <Navbar />
          <RegisterForm onSuccess={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />
        </div>
      );
    }
    return (

      <div>
        <Navbar />
       

        <div style={{ maxWidth: '380px', margin: '80px auto', padding: '0 20px' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: '10px' }}>
            Learn · Lead · Serve
          </div>
  

          <h1 style={{ color: 'var(--forest-deep)', fontSize: '1.7rem', marginBottom: '28px' }}>Log in to your account</h1>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            {error && <p style={{ color: '#B3261E', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>}
            <button type="submit" style={{
              background: 'var(--forest)', color: 'white', padding: '13px 26px',
              border: 'none', borderRadius: '2px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%'
            }}>
              Log In
            </button>
          </form>
          <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '14px' }}>
            Don't have an account?{' '}
            <span onClick={() => setShowRegister(true)} style={{ color: 'var(--forest)', fontWeight: 600, cursor: 'pointer' }}>
              Register
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Logged in — route by role
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={
          user.role === 'admin' ? <Navigate to="/admin" /> :
          user.role === 'instructor' ? <Navigate to="/instructor" /> :
          <Navigate to="/student" />
        } />
        <Route path="/student" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
        <Route path="/instructor" element={<InstructorDashboard user={user} onLogout={handleLogout} />} />
        <Route path="/admin" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;