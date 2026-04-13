const express = require('express');
const router  = express.Router();
const {
  getDepartments,
  getDepartmentEmployees
} = require('../controllers/departmentsController');


router.get('/', getDepartments);


router.get('/:dept_no/employees', getDepartmentEmployees);

module.exports = router;
