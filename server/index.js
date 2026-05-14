const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = require('./middleware/auth');


const app = express();

app.use(cors());
app.use(express.json());

const https = require('https');

// Public routes (no auth required)
app.use('/api/auth', require('./routes/auth'));

// Health check route para el auto-ping de Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (auth required)
app.use('/api/inventory', authMiddleware, require('./routes/inventory'));
app.use('/api/sales', authMiddleware, require('./routes/sales'));
app.use('/api/expenses', authMiddleware, require('./routes/expenses'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));

const path = require('path');
// Sirve los archivos estáticos del frontend en producción
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier ruta que no sea de la API (/api/*), sirve el index.html de React
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Mecanismo para evitar que Render suspenda el servidor (Sleep)
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_EXTERNAL_URL) {
    // 14 minutos en milisegundos (Render duerme la app a los 15 minutos de inactividad)
    const pingInterval = 14 * 60 * 1000; 
    setInterval(() => {
      https.get(`${RENDER_EXTERNAL_URL}/api/health`, (resp) => {
        if (resp.statusCode === 200) {
          console.log(`Auto-ping exitoso: la aplicación se mantiene activa - ${new Date().toISOString()}`);
        } else {
          console.error(`Auto-ping falló con estado: ${resp.statusCode}`);
        }
      }).on("error", (err) => {
        console.error("Error en auto-ping:", err.message);
      });
    }, pingInterval);
  }
});
