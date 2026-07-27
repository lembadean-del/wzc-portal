const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Student enrolls themselves in a course
router.post('/', verifyToken, async (req, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id is required' });

  try {
    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2) RETURNING *`,
      [req.user.id, course_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already enrolled in this course' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get the logged-in student's own enrollments + progress
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.progress, e.completed, c.id AS course_id, c.title, c.category
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all students enrolled in a course, with progress — admin/instructor only
router.get('/course/:courseId', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can view enrollments' });
  }
  try {
    const result = await pool.query(
      `SELECT e.id, e.progress, e.completed, u.id AS student_id, u.full_name, u.email
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       WHERE e.course_id = $1
       ORDER BY u.full_name ASC`,
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Update progress — instructor/admin only
router.patch('/:id/progress', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can update progress' });
  }
  const { progress } = req.body;
  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'progress must be a number between 0 and 100' });
  }

  try {
    const completed = progress >= 100;
    const result = await pool.query(
      `UPDATE enrollments SET progress = $1, completed = $2 WHERE id = $3 RETURNING *`,
      [progress, completed, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;