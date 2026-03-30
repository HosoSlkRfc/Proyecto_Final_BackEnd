const express = require('express');
const router  = express.Router();
const { getResumen } = require('../controllers/dashboardController');

// GET /api/dashboard/resumen → métricas generales del sistema
router.get('/resumen', getResumen);

module.exports = router;
