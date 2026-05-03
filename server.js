const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'views')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

// Ensure API callers always get JSON (prevents "Unexpected token '<'" from HTML error pages)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize DB and Start Server
(async () => {
  try {
    await pool.initSchema();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FinTrack Pro running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Critical Failure:", err);
  }
})();
