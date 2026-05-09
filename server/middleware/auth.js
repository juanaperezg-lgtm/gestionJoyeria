const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aura-joyeros-secret-key-2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Inicia sesión.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesión expirada. Inicia sesión nuevamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
