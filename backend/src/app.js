const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());          // Allow cross-origin requests (from React frontend later)
app.use(express.json());  // Parse incoming JSON request bodies into req.body

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'CloudVault API is running' });
});

module.exports = app;