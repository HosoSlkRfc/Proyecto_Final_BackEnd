const pool = require('../config/db');


const getDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.dept_no,
        d.dept_name,
        COUNT(de.emp_no) AS total_empleados,
        CONCAT(dm_e.first_name, ' ', dm_e.last_name) AS gerente_actual
      FROM departments d
      LEFT JOIN dept_emp     de  ON d.dept_no = de.dept_no AND de.to_date = '9999-01-01'
      LEFT JOIN dept_manager dm  ON d.dept_no = dm.dept_no AND dm.to_date = '9999-01-01'
      LEFT JOIN employees    dm_e ON dm.emp_no = dm_e.emp_no
      GROUP BY d.dept_no, d.dept_name, dm_e.first_name, dm_e.last_name
      ORDER BY d.dept_name
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/departments/:dept_no/employees ───────────────────
const getDepartmentEmployees = async (req, res, next) => {
  try {
    const { dept_no } = req.params;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // Verificar que el departamento existe
    const [[dept]] = await pool.query(
      `SELECT dept_no, dept_name FROM departments WHERE dept_no = ?`, [dept_no]
    );
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Departamento no encontrado.' });
    }

    const [rows] = await pool.query(`
      SELECT
        e.emp_no,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        t.title  AS current_title,
        s.salary AS current_salary,
        de.from_date
      FROM dept_emp de
      JOIN employees e ON de.emp_no = e.emp_no
      LEFT JOIN titles   t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      WHERE de.dept_no = ? AND de.to_date = '9999-01-01'
      ORDER BY e.last_name, e.first_name
      LIMIT ? OFFSET ?
    `, [dept_no, limit, offset]);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM dept_emp WHERE dept_no = ? AND to_date = '9999-01-01'`,
      [dept_no]
    );

    res.json({
      success: true,
      department: dept,
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDepartments, getDepartmentEmployees };
