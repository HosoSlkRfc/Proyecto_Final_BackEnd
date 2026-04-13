const express = require('express');
const router  = express.Router();
const {
  getEmployees,
  getEmployeeById,
  getEmployeeHistorial
} = require('../controllers/employeesController');


router.get('/', getEmployees);


router.get('/:id', getEmployeeById);


router.get('/:id/historial', getEmployeeHistorial);

module.exports = router;
