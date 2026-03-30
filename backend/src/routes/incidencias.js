const express = require('express');
const router  = express.Router();
const {
  getIncidencias,
  getIncidenciaById,
  createIncidencia,
  updateIncidencia,
  deleteIncidencia
} = require('../controllers/incidenciasController');

// GET    /api/incidencias      → listar incidencias (filtros: emp_no, estatus)
router.get('/', getIncidencias);

// GET    /api/incidencias/:id  → detalle de incidencia
router.get('/:id', getIncidenciaById);

// POST   /api/incidencias      → registrar nueva incidencia
router.post('/', createIncidencia);

// PUT    /api/incidencias/:id  → actualizar incidencia
router.put('/:id', updateIncidencia);

// DELETE /api/incidencias/:id  → eliminar incidencia
router.delete('/:id', deleteIncidencia);

module.exports = router;
