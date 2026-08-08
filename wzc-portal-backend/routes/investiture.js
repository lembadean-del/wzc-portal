// wzc-portal-backend/routes/investiture.js — replace the entire file with this
const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// List the 7 fixed categories — any logged-in user
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM investiture_categories ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Build a student's marks across all categories
async function getStudentScores(studentId) {
  const categories = await pool.query('SELECT * FROM investiture_categories ORDER BY order_index ASC');

  const result = [];
  let totalEarned = 0;
  let totalMax = 0;

  for (const c of categories.rows) {
    const score = await pool.query(
      'SELECT marks_earned FROM investiture_scores WHERE student_id = $1 AND category_id = $2',
      [studentId, c.id]
    );
    const marks_earned = score.rows[0]?.marks_earned || 0;
    result.push({ ...c, marks_earned });
    totalEarned += marks_earned;
    totalMax += c.max_marks;
  }

  const percent = totalMax ? Math.round((totalEarned / totalMax) * 100) : 0;

  return { categories: result, totalEarned, totalMax, percent };
}

// Get the logged-in student's own investiture scores
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json(await getStudentScores(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific student's scores — admin/instructor only
router.get('/student/:studentId', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: "Only admins or instructors can view other students' progress" });
  }
  try {
    res.json(await getStudentScores(req.params.studentId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set marks for a category for a student — admin/instructor only
router.patch('/:categoryId/student/:studentId', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can update scores' });
  }
  const { marks_earned } = req.body;
  if (marks_earned === undefined) return res.status(400).json({ error: 'marks_earned is required' });

  try {
    const catCheck = await pool.query('SELECT max_marks FROM investiture_categories WHERE id = $1', [req.params.categoryId]);
    if (!catCheck.rows[0]) return res.status(404).json({ error: 'Category not found' });

    const maxMarks = catCheck.rows[0].max_marks;
    if (marks_earned < 0 || marks_earned > maxMarks) {
      return res.status(400).json({ error: `marks_earned must be between 0 and ${maxMarks}` });
    }

    const result = await pool.query(
      `INSERT INTO investiture_scores (student_id, category_id, marks_earned, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, category_id)
       DO UPDATE SET marks_earned = $3, updated_at = $4
       RETURNING *`,
      [req.params.studentId, req.params.categoryId, marks_earned, new Date()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit a category's name/max marks — admin only (categories themselves stay fixed at 7, no add/delete)
router.patch('/categories/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can edit categories' });
  }
  const { name, max_marks } = req.body;
  if (!name || max_marks === undefined) return res.status(400).json({ error: 'name and max_marks are required' });
  try {
    const result = await pool.query(
      'UPDATE investiture_categories SET name = $1, max_marks = $2 WHERE id = $3 RETURNING *',
      [name, max_marks, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;