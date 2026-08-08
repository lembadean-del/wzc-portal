const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create a quiz — admin/instructor only
router.post('/', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can create quizzes' });
  }
  const { course_id, title } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'course_id and title are required' });

  try {
    const result = await pool.query(
      `INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING *`,
      [course_id, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a question to a quiz — admin/instructor only
router.post('/:quizId/questions', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can add questions' });
  }
  const { question_text, option_a, option_b, option_c, option_d, correct_option, order_index } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'All question fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, question_text, option_a, option_b, option_c, option_d, order_index`,
      [req.params.quizId, question_text, option_a, option_b, option_c, option_d, correct_option.toUpperCase(), order_index || 0]
    );
    res.status(201).json(result.rows[0]); // note: correct_option deliberately excluded from response
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a quiz's questions for a student to take — correct answers hidden
router.get('/:quizId/take', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, order_index
       FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC`,
      [req.params.quizId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit answers — auto-marked
router.post('/:quizId/submit', verifyToken, async (req, res) => {
  const { answers } = req.body; // { questionId: "A", questionId: "B", ... }
  if (!answers) return res.status(400).json({ error: 'answers object is required' });

  try {
    const questions = await pool.query(
      'SELECT id, correct_option FROM quiz_questions WHERE quiz_id = $1',
      [req.params.quizId]
    );

    let score = 0;
    questions.rows.forEach((q) => {
      if (answers[q.id] && answers[q.id].toUpperCase() === q.correct_option) score++;
    });

    const result = await pool.query(
      `INSERT INTO quiz_submissions (quiz_id, student_id, score, total_questions)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.quizId, req.user.id, score, questions.rows.length]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all student results for a quiz — admin/instructor only
router.get('/:quizId/results', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can view results' });
  }
  try {
    const result = await pool.query(
      `SELECT qs.id, qs.score, qs.total_questions, qs.submitted_at, u.full_name
       FROM quiz_submissions qs
       JOIN users u ON qs.student_id = u.id
       WHERE qs.quiz_id = $1
       ORDER BY qs.submitted_at DESC`,
      [req.params.quizId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// List all quizzes for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title FROM quizzes WHERE course_id = $1 ORDER BY created_at ASC',
      [req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a quiz's title — admin or instructor only
router.patch('/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can edit quizzes' });
  }
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const result = await pool.query('UPDATE quizzes SET title = $1 WHERE id = $2 RETURNING *', [title, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Quiz not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a quiz — admin or instructor only
router.delete('/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can delete quizzes' });
  }
  try {
    const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete: this quiz has questions or student submissions.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get one question with its correct answer — for pre-filling the edit form (admin/instructor only)
router.get('/questions/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can view this' });
  }
  try {
    const result = await pool.query('SELECT * FROM quiz_questions WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Question not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a question — admin or instructor only
router.patch('/questions/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can edit questions' });
  }
  const { question_text, option_a, option_b, option_c, option_d, correct_option, order_index } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'All question fields are required' });
  }
  try {
    const result = await pool.query(
      `UPDATE quiz_questions SET question_text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_option=$6, order_index=$7
       WHERE id = $8 RETURNING id, question_text, option_a, option_b, option_c, option_d, order_index`,
      [question_text, option_a, option_b, option_c, option_d, correct_option.toUpperCase(), order_index || 0, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Question not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a question — admin or instructor only
router.delete('/questions/:id', verifyToken, async (req, res) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admins or instructors can delete questions' });
  }
  try {
    const result = await pool.query('DELETE FROM quiz_questions WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;