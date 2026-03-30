const express = require('express');
const router  = express.Router();
const {
  getDepartments,
  getDepartmentEmployees
} = require('../controllers/departmentsController');

// GET /api/departments                         → listar departamentos
router.get('/', getDepartments);

// GET /api/departments/:dept_no/employees      → empleados de un departamento
router.get('/:dept_no/employees', getDepartmentEmployees);

module.exports = router;
