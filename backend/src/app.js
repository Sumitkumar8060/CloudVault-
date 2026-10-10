const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const publicShareRoutes = require('./routes/publicShareRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
// Deliberately NOT behind authMiddleware — anonymous access via a valid
// token is the entire point of this route.
app.use('/api/public/share', publicShareRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'CloudVault API is running' });
});

app.use(errorHandler);

module.exports = app;