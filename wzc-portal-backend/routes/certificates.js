const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Issue a certificate — only if the student's enrollment shows completed = true
router.post('/', verifyToken, async (req, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id is required' });

  try {
    const enrollment = await pool.query(
      `SELECT completed FROM enrollments WHERE student_id = $1 AND course_id = $2`,
      [req.user.id, course_id]
    );
    if (!enrollment.rows[0] || !enrollment.rows[0].completed) {
      return res.status(403).json({ error: 'Course not yet completed' });
    }

    const result = await pool.query(
      `INSERT INTO certificates (student_id, course_id) VALUES ($1, $2) RETURNING *`,
      [req.user.id, course_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Certificate already issued' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get the logged-in student's certificate for a specific course, if issued
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM certificates WHERE student_id = $1 AND course_id = $2`,
      [req.user.id, req.params.courseId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Certificate not yet issued' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Download a certificate as a generated PDF
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const certResult = await pool.query(
      `SELECT cert.*, u.full_name, c.title AS course_title
       FROM certificates cert
       JOIN users u ON cert.student_id = u.id
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.id = $1`,
      [req.params.id]
    );
    const cert = certResult.rows[0];
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    if (cert.student_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this certificate' });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // landscape A4
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Certificate of Completion', {
      x: 200, y: 480, size: 28, font, color: rgb(0.11, 0.28, 0.2),
    });
    page.drawText('West Zambia Conference — MasterGuide Learning Portal', {
      x: 220, y: 440, size: 12, font: bodyFont, color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText('This certifies that', {
      x: 350, y: 380, size: 12, font: bodyFont,
    });
    page.drawText(cert.full_name, {
      x: 300, y: 340, size: 22, font, color: rgb(0.78, 0.61, 0.24),
    });
    page.drawText('has successfully completed', {
      x: 320, y: 300, size: 12, font: bodyFont,
    });
    page.drawText(cert.course_title, {
      x: 300, y: 260, size: 18, font,
    });
    page.drawText(`Issued: ${new Date(cert.issued_at).toDateString()}`, {
      x: 340, y: 100, size: 10, font: bodyFont, color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all issued certificates — admin only
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const result = await pool.query(
      `SELECT cert.id, cert.issued_at, u.full_name, c.title AS course_title
       FROM certificates cert
       JOIN users u ON cert.student_id = u.id
       JOIN courses c ON cert.course_id = c.id
       ORDER BY cert.issued_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Revoke/delete a certificate — admin only
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can revoke certificates' });
  }
  try {
    const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;