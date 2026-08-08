const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create a course — admin or instructor only
router.post('/', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can create courses' });
  }

  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, category, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description || null, category || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Public — no auth — for the homepage "Featured Courses" section
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category FROM courses ORDER BY created_at DESC LIMIT 4'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all courses — any logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a course — admin or instructor only
router.patch('/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can edit courses' });
  }
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const result = await pool.query(
      `UPDATE courses SET title = $1, description = $2, category = $3 WHERE id = $4 RETURNING *`,
      [title, description || null, category || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a course — admin only
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete courses' });
  }
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete: this course still has lessons, quizzes, or assignments. Remove those first.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;