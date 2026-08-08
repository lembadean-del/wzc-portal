const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create an assignment — admin or instructor only
router.post('/', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can create assignments' });
  }

  const { course_id, title, description, due_date } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'course_id and title are required' });

  try {
    const result = await pool.query(
      `INSERT INTO assignments (course_id, title, description, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course_id, title, description || null, due_date || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all assignments for a course — any logged-in user
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at DESC',
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Student submits (or resubmits) their work for an assignment
router.post('/:assignmentId/submit', verifyToken, async (req, res) => {
  const { submission_text, file_url } = req.body;
  if (!submission_text && !file_url) {
    return res.status(400).json({ error: 'submission_text or file_url is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET submission_text = $3, file_url = $4, submitted_at = NOW(), grade = NULL, feedback = NULL, graded_at = NULL
       RETURNING *`,
      [req.params.assignmentId, req.user.id, submission_text || null, file_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get the logged-in student's own submission for an assignment, if any
router.get('/:assignmentId/my-submission', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
      [req.params.assignmentId, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No submission yet' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all submissions for an assignment, with student names — admin/instructor only
router.get('/:assignmentId/submissions', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can view submissions' });
  }
  try {
    const result = await pool.query(
      `SELECT s.*, u.full_name
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.params.assignmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Grade a submission — admin/instructor only
router.patch('/submissions/:id/grade', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can grade submissions' });
  }
  const { grade, feedback } = req.body;
  if (grade === undefined) return res.status(400).json({ error: 'grade is required' });

  try {
    const result = await pool.query(
      `UPDATE assignment_submissions SET grade = $1, feedback = $2, graded_at = NOW() WHERE id = $3 RETURNING *`,
      [grade, feedback || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Submission not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an assignment — admin or instructor only
router.patch('/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can edit assignments' });
  }
  const { title, description, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const result = await pool.query(
      `UPDATE assignments SET title = $1, description = $2, due_date = $3 WHERE id = $4 RETURNING *`,
      [title, description || null, due_date || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Assignment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an assignment — admin or instructor only
router.delete('/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can delete assignments' });
  }
  try {
    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete: this assignment has student submissions.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;