const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public API routes
app.get('/api/ping', (req, res) => res.send('pong'));
app.use('/api/auth', require('./routes/auth'));

// Protected API routes
app.use('/api/inventory', authMiddleware, require('./routes/inventory'));
app.use('/api/sales', authMiddleware, require('./routes/sales'));
app.use('/api/expenses', authMiddleware, require('./routes/expenses'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));
app.use('/api/clients', authMiddleware, require('./routes/clients'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Keep-alive mechanism for Render free tier
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    console.log(`Keep-alive initialized for: ${RENDER_URL}`);
    setInterval(() => {
      const https = require('https');
      https.get(`${RENDER_URL}/api/ping`, (res) => {
        console.log(`Keep-alive ping status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('Keep-alive ping error:', err.message);
      });
    }, 10 * 60 * 1000); // Ping every 10 minutes (Render sleeps after 15)
  }
});
