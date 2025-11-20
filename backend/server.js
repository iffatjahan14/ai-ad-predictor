const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ad');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ad', adRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Ad Performance Predictor API is running',
    version: '1.0.0',
    ai: process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Mock AI'
  });
});

// Error handling middleware
app.use(errorHandler);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   🤖 AI Ad Performance Predictor Running         ║
  ║                                                   ║
  ║   📍 URL: http://localhost:${PORT}                ║
  ║   🔧 Environment: ${process.env.NODE_ENV || 'development'}                    ║
  ║   ✅ Status: Ready                                ║
  ║   🤖 AI: ${process.env.GEMINI_API_KEY ? 'Google Gemini ✨' : 'Mock Mode'}                            ║
  ╚═══════════════════════════════════════════════════╝
  
  👉 Open your browser to http://localhost:${PORT}
  🎯 Predict ad performance with real AI!
  `);
});