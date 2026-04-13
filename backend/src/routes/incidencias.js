const express = require('express');
const router  = express.Router();
const {
  getIncidencias,
  getIncidenciaById,
  createIncidencia,
  updateIncidencia,
  deleteIncidencia
} = require('../controllers/incidenciasController');


router.get('/', getIncidencias);


router.get('/:id', getIncidenciaById);


router.post('/', createIncidencia);


router.put('/:id', updateIncidencia);


router.delete('/:id', deleteIncidencia);

module.exports = router;
