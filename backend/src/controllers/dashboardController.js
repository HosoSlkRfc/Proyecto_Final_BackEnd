const pool = require('../config/db');


const getResumen = async (req, res, next) => {
  try {
 
    const [[{ totalEmpleados }]] = await pool.query(`
      SELECT COUNT(DISTINCT emp_no) AS totalEmpleados
      FROM dept_emp
      WHERE to_date = '9999-01-01'
    `);


    const [[{ totalDepartamentos }]] = await pool.query(
      `SELECT COUNT(*) AS totalDepartamentos FROM departments`
    );


    const [[{ totalIncidencias }]] = await pool.query(
      `SELECT COUNT(*) AS totalIncidencias FROM incidencias_rrhh`
    );


    const [[{ incidenciasAbiertas }]] = await pool.query(
      `SELECT COUNT(*) AS incidenciasAbiertas FROM incidencias_rrhh WHERE estatus = 'Abierta'`
    );


    const [[{ salarioPromedio }]] = await pool.query(
      `SELECT ROUND(AVG(salary), 2) AS salarioPromedio FROM salaries WHERE to_date = '9999-01-01'`
    );

   
    const [empleadosPorDept] = await pool.query(`
      SELECT
        d.dept_no,
        d.dept_name,
        COUNT(de.emp_no) AS total
      FROM departments d
      LEFT JOIN dept_emp de ON d.dept_no = de.dept_no AND de.to_date = '9999-01-01'
      GROUP BY d.dept_no, d.dept_name
      ORDER BY total DESC
    `);

  
    const [incidenciasRecientes] = await pool.query(`
      SELECT
        i.id_incidencia,
        i.emp_no,
        CONCAT(e.first_name, ' ', e.last_name) AS nombre_empleado,
        i.tipo,
        i.fecha,
        i.estatus
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      ORDER BY i.fecha DESC, i.id_incidencia DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalEmpleados,
        totalDepartamentos,
        totalIncidencias,
        incidenciasAbiertas,
        salarioPromedio,
        empleadosPorDept,
        incidenciasRecientes
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResumen };
