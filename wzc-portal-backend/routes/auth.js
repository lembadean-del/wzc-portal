const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');

router.post('/register', async (req, res) => {
  const { full_name, email, password, nrc_number, church, district } = req.body;

  if (!full_name || !email || !password || !nrc_number || !church) {
    return res.status(400).json({ error: 'Full name, email, password, NRC number, and church are required' });
  }

  try {
    const settingsCheck = await pool.query('SELECT is_open, deadline FROM registration_settings WHERE id = 1');
    const settings = settingsCheck.rows[0];
    const registrationOpen = settings
      ? settings.is_open && (!settings.deadline || new Date() <= new Date(settings.deadline))
      : true;
    if (!registrationOpen) {
      return res.status(403).json({ error: 'Registration is currently closed' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, nrc_number, church, district)
       VALUES ($1, $2, $3, 'student', $4, $5, $6)
       RETURNING id, full_name, email, role, nrc_number, church, district`,
      [full_name, email, hash, nrc_number, church, district || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint.includes('nrc') ? 'NRC number' : 'Email';
      return res.status(409).json({ error: `${field} already registered` });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const verifyToken = require('../middleware/verifyToken');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, photo_url FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/create-staff', verifyToken, requireAdmin, async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'Full name, email, password, and role are required' });
  }
  if (!['instructor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be instructor or admin' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [full_name, email, hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  const { role } = req.query;
  try {
    const result = role
      ? await pool.query('SELECT id, full_name, email, role, nrc_number, church, district, created_at FROM users WHERE role = $1 ORDER BY full_name ASC', [role])
      : await pool.query('SELECT id, full_name, email, role, nrc_number, church, district, created_at FROM users ORDER BY full_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.patch('/me/photo', verifyToken, async (req, res) => {
  const { photo_url } = req.body;
  if (!photo_url) return res.status(400).json({ error: 'photo_url is required' });
  try {
    const result = await pool.query(
      'UPDATE users SET photo_url = $1 WHERE id = $2 RETURNING id, full_name, email, role, photo_url',
      [photo_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;