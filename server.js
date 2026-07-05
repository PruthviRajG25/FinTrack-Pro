const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'views')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinTrack Pro' });
});

// Database connection check middleware for API routes
app.use('/api', (req, res, next) => {
  const mongoose = require('mongoose');
  const state = mongoose.connection.readyState;
  if (state === 0 || state === 3) {
    return res.status(503).json({
      error: 'Database connection is not established. If you are running on Vercel, please ensure MONGODB_URI is correctly configured in your Project Settings (Environment Variables).'
    });
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

// Ensure API callers always get JSON (prevents "Unexpected token '<'" from HTML error pages)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize DB without blocking the function startup
connectDB().catch(err => {
  console.error('Critical Failure:', err);
});

// Start Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const startServer = (port) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 FinTrack Pro running on http://localhost:${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is busy. Trying ${port + 1}...`);
        server.close(() => startServer(port + 1));
      } else {
        console.error('Server failed to start:', error);
        process.exit(1);
      }
    });
  };

  startServer(PORT);
}

module.exports = app;

