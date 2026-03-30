const express = require('express');
const router  = express.Router();
const {
  getEmployees,
  getEmployeeById,
  getEmployeeHistorial
} = require('../controllers/employeesController');

// GET /api/employees          → listar y buscar empleados
router.get('/', getEmployees);

// GET /api/employees/:id      → detalle de un empleado
router.get('/:id', getEmployeeById);

// GET /api/employees/:id/historial → historial de títulos, salarios y departamentos
router.get('/:id/historial', getEmployeeHistorial);

module.exports = router;
