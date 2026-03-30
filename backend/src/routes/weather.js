const express = require('express');
const router  = express.Router();
const { getWeather } = require('../controllers/weatherController');

// GET /api/weather → temperatura y condición climática actual
router.get('/', getWeather);

module.exports = router;
