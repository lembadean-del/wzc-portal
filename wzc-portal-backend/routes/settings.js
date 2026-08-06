const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

// Compute whether registration is actually open right now
function isEffectivelyOpen(row) {
  if (!row.is_open) return false;
  if (row.deadline && new Date() > new Date(row.deadline)) return false;
  return true;
}

// Public — anyone (including the register page, before login) can check status
router.get('/registration', async (req, res) => {
  try {
    const result = await pool.query('SELECT is_open, deadline FROM registration_settings WHERE id = 1');
    const row = result.rows[0] || { is_open: true, deadline: null };
    res.json({ is_open: row.is_open, deadline: row.deadline, effectively_open: isEffectivelyOpen(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin only — open/close and/or set or clear the deadline
// Only fields actually present in the request body are changed:
//   - omit "is_open" to leave the open/closed state untouched
//   - omit "deadline" to leave the deadline untouched
//   - send "deadline": null explicitly to clear the deadline
router.patch('/registration', verifyToken, requireAdmin, async (req, res) => {
  try {
    const current = await pool.query('SELECT is_open, deadline FROM registration_settings WHERE id = 1');
    const row = current.rows[0];

    const nextIsOpen = req.body.hasOwnProperty('is_open') ? req.body.is_open : row.is_open;
    const nextDeadline = req.body.hasOwnProperty('deadline') ? req.body.deadline : row.deadline;

    const result = await pool.query(
      `UPDATE registration_settings SET is_open = $1, deadline = $2 WHERE id = 1 RETURNING is_open, deadline`,
      [nextIsOpen, nextDeadline]
    );
    const updated = result.rows[0];
    res.json({ is_open: updated.is_open, deadline: updated.deadline, effectively_open: isEffectivelyOpen(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;