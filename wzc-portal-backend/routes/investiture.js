const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create a requirement — admin only
router.post('/requirements', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { name, description, course_id, order_index } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await pool.query(
      `INSERT INTO investiture_requirements (name, description, course_id, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || null, course_id || null, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all requirements — any logged-in user
router.get('/requirements', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM investiture_requirements ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Build a student's progress across all requirements
async function getStudentProgress(studentId) {
  const requirements = await pool.query('SELECT * FROM investiture_requirements ORDER BY order_index ASC');

  const result = [];
  for (const r of requirements.rows) {
    let completed = false;
    if (r.course_id) {
      const enrollment = await pool.query(
        'SELECT completed FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, r.course_id]
      );
      completed = enrollment.rows[0]?.completed || false;
    } else {
      const progress = await pool.query(
        'SELECT completed FROM investiture_progress WHERE student_id = $1 AND requirement_id = $2',
        [studentId, r.id]
      );
      completed = progress.rows[0]?.completed || false;
    }
    result.push({ ...r, completed });
  }

  const percent = result.length
    ? Math.round((result.filter((x) => x.completed).length / result.length) * 100)
    : 0;

  return { requirements: result, percent };
}

// Get the logged-in student's own investiture progress
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json(await getStudentProgress(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific student's progress — admin/instructor only
router.get('/student/:studentId', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: "Only admins or instructors can view other students' progress" });
  }
  try {
    res.json(await getStudentProgress(req.params.studentId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manually toggle a requirement for a student — admin/instructor only, only for requirements without a linked course
router.patch('/:requirementId/student/:studentId', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can update progress' });
  }
  const { completed } = req.body;
  if (completed === undefined) return res.status(400).json({ error: 'completed is required' });

  try {
    const reqCheck = await pool.query('SELECT course_id FROM investiture_requirements WHERE id = $1', [req.params.requirementId]);
    if (!reqCheck.rows[0]) return res.status(404).json({ error: 'Requirement not found' });
    if (reqCheck.rows[0].course_id) {
      return res.status(400).json({ error: 'This requirement is tied to a course and completes automatically' });
    }

    const result = await pool.query(
      `INSERT INTO investiture_progress (student_id, requirement_id, completed, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, requirement_id)
       DO UPDATE SET completed = $3, completed_at = $4
       RETURNING *`,
      [req.params.studentId, req.params.requirementId, completed, completed ? new Date() : null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;