// Cricket Quiz Arena - backend server
// Run from the backend folder:  npm run dev   then open http://localhost:3000
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const sampleQuestions = require('./data/sampleQuestions');

const questionRoutes = require('./routes/questionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// ---------- Middleware ----------
app.use(cors()); // lets the frontend also work from VS Code Live Server (another port)
app.use(express.json({ limit: '50kb' })); // reads JSON sent by the frontend

// ---------- API routes ----------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name,
  });
});
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api', resultRoutes);

// Unknown API address -> JSON error
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

// ---------- Frontend ----------
// The backend also serves the frontend folder, so one command runs the whole app.
app.use(express.static(FRONTEND_DIR));
app.use((req, res) => res.status(404).sendFile(path.join(FRONTEND_DIR, 'index.html')));

// ---------- Error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON data.' });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  }
  console.error('[Server error]', err);
  res.status(500).json({ message: 'Something went wrong on the server. Check the backend terminal.' });
});

// ---------- Start ----------
async function start() {
  try {
    await connectDB();

    // First run: fill the questions collection so the quiz works immediately.
    if ((await Question.countDocuments()) === 0) {
      await Question.insertMany(sampleQuestions);
      console.log(`[DB] Questions collection was empty - inserted ${sampleQuestions.length} sample questions.`);
    }

    app.listen(PORT, () => {
      console.log(`[Server] Cricket Quiz Arena is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('\n[DB] Could not connect to MongoDB:', err.message);
    console.error('[DB] Local MongoDB: make sure the MongoDB Server service is running (port 27017).');
    console.error('[DB] MongoDB Atlas: check the connection string, password and Network Access IP list.\n');
    process.exit(1);
  }
}

start();
