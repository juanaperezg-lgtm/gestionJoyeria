const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (auth required)
app.use('/api/inventory', authMiddleware, require('./routes/inventory'));
app.use('/api/sales', authMiddleware, require('./routes/sales'));
app.use('/api/expenses', authMiddleware, require('./routes/expenses'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
