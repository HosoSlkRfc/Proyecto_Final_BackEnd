const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const employeesRoutes   = require('./src/routes/employees');
const departmentsRoutes = require('./src/routes/departments');
const incidenciasRoutes = require('./src/routes/incidencias');
const dashboardRoutes   = require('./src/routes/dashboard');
const weatherRoutes     = require('./src/routes/weather');
const errorHandler      = require('./src/middlewares/errorHandler');

const app = express();

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos del frontend ──────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Rutas de la API ───────────────────────────────────────────
app.use('/api/employees',   employeesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/weather',     weatherRoutes);

// ── Ruta fallback: sirve el frontend para cualquier otra URL ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Manejador de errores ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
