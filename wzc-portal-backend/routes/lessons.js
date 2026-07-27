const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create a lesson under a course — admin or instructor only
router.post('/', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can add lessons' });
  }

  const { course_id, title, content, video_url, pdf_url, order_index } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'course_id and title are required' });

  try {
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, content, video_url, pdf_url, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [course_id, title, content || null, video_url || null, pdf_url || null, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all lessons for a specific course — any logged-in user
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;