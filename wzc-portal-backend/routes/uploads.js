const express = require('express');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) return cb(new Error('File type not allowed'));
    cb(null, true);
  }
});

router.post('/', verifyToken, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;

    try {
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw error;

      const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(filename);

      res.status(201).json({ url: data.publicUrl });
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

module.exports = router;