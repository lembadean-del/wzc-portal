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

module.exports = router;