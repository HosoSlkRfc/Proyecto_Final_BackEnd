const pool = require('../config/db');

// ── GET /api/employees?search=&page=&limit= ──────────────────
const getEmployees = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    let where  = '';
    const params = [];

    if (search) {
      where = `WHERE e.first_name LIKE ? OR e.last_name LIKE ? OR CAST(e.emp_no AS CHAR) LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const dataQuery = `
      SELECT
        e.emp_no,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        e.birth_date,
        d.dept_name,
        de.dept_no,
        t.title   AS current_title,
        s.salary  AS current_salary
      FROM employees e
      LEFT JOIN dept_emp    de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d  ON de.dept_no = d.dept_no
      LEFT JOIN titles      t  ON e.emp_no = t.emp_no  AND t.to_date  = '9999-01-01'
      LEFT JOIN salaries    s  ON e.emp_no = s.emp_no  AND s.to_date  = '9999-01-01'
      ${where}
      ORDER BY e.emp_no
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    const [rows] = await pool.query(dataQuery, params);

    // Total para paginación
    const countParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];
    const countWhere = search
      ? `WHERE first_name LIKE ? OR last_name LIKE ? OR CAST(emp_no AS CHAR) LIKE ?`
      : '';
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM employees ${countWhere}`,
      countParams
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/employees/:id ────────────────────────────────────
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT
        e.emp_no,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        e.birth_date,
        d.dept_name,
        de.dept_no,
        de.from_date  AS dept_since,
        t.title       AS current_title,
        s.salary      AS current_salary
      FROM employees e
      LEFT JOIN dept_emp    de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d  ON de.dept_no = d.dept_no
      LEFT JOIN titles      t  ON e.emp_no = t.emp_no  AND t.to_date  = '9999-01-01'
      LEFT JOIN salaries    s  ON e.emp_no = s.emp_no  AND s.to_date  = '9999-01-01'
      WHERE e.emp_no = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/employees/:id/historial ─────────────────────────
const getEmployeeHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el empleado existe
    const [[emp]] = await pool.query(
      `SELECT emp_no, first_name, last_name FROM employees WHERE emp_no = ?`, [id]
    );
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
    }

    const [titles] = await pool.query(
      `SELECT title, from_date, to_date FROM titles WHERE emp_no = ? ORDER BY from_date DESC`,
      [id]
    );

    const [salaries] = await pool.query(
      `SELECT salary, from_date, to_date FROM salaries WHERE emp_no = ? ORDER BY from_date DESC`,
      [id]
    );

    const [departments] = await pool.query(`
      SELECT d.dept_name, d.dept_no, de.from_date, de.to_date
      FROM dept_emp de
      JOIN departments d ON de.dept_no = d.dept_no
      WHERE de.emp_no = ?
      ORDER BY de.from_date DESC
    `, [id]);

    res.json({
      success: true,
      data: { empleado: emp, titles, salaries, departments }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmployees, getEmployeeById, getEmployeeHistorial };
