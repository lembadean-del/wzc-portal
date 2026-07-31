const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
  
const certificateRoutes = require('./routes/certificates');
const quizRoutes = require('./routes/quizzes');
const enrollmentRoutes = require('./routes/enrollments');
const lessonRoutes = require('./routes/lessons');
const courseRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');
const investitureRoutes = require('./routes/investiture');
const uploadRoutes = require('./routes/uploads');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json({ limit: '1mb' }));


app.use('/api/certificates', certificateRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/investiture', investitureRoutes);
app.use('/api/uploads', uploadRoutes);

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', loginLimiter);

app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});