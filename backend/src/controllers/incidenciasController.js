const pool = require('../config/db');


const getIncidencias = async (req, res, next) => {
  try {
    const { emp_no, estatus, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const params = [];

    if (emp_no) {
      where += ' AND i.emp_no = ?';
      params.push(emp_no);
    }
    if (estatus) {
      where += ' AND i.estatus = ?';
      params.push(estatus);
    }

    const [rows] = await pool.query(`
      SELECT
        i.id_incidencia,
        i.emp_no,
        CONCAT(e.first_name, ' ', e.last_name) AS nombre_empleado,
        i.tipo,
        i.fecha,
        i.descripcion,
        i.estatus,
        i.created_at,
        i.updated_at
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      ${where}
      ORDER BY i.fecha DESC, i.id_incidencia DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM incidencias_rrhh i ${where}`, params
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    next(err);
  }
};


const getIncidenciaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT i.*, CONCAT(e.first_name, ' ', e.last_name) AS nombre_empleado
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      WHERE i.id_incidencia = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incidencia no encontrada.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};


const createIncidencia = async (req, res, next) => {
  try {
    const { emp_no, tipo, fecha, descripcion, estatus } = req.body;

  
    if (!emp_no || !tipo || !fecha || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Los campos emp_no, tipo, fecha y descripcion son requeridos.'
      });
    }
    if (tipo.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'El tipo debe tener al menos 3 caracteres.' });
    }
    if (descripcion.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'La descripción debe tener al menos 5 caracteres.' });
    }

    const [[emp]] = await pool.query('SELECT emp_no FROM employees WHERE emp_no = ?', [emp_no]);
    if (!emp) {
      return res.status(404).json({ success: false, message: `El empleado con ID ${emp_no} no existe.` });
    }

    const estatusVal = ['Abierta', 'En proceso', 'Cerrada'].includes(estatus) ? estatus : 'Abierta';

    const [result] = await pool.query(
      `INSERT INTO incidencias_rrhh (emp_no, tipo, fecha, descripcion, estatus) VALUES (?, ?, ?, ?, ?)`,
      [emp_no, tipo.trim(), fecha, descripcion.trim(), estatusVal]
    );

    res.status(201).json({
      success: true,
      message: 'Incidencia registrada exitosamente.',
      data: { id_incidencia: result.insertId }
    });
  } catch (err) {
    next(err);
  }
};


const updateIncidencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[existing]] = await pool.query(
      'SELECT * FROM incidencias_rrhh WHERE id_incidencia = ?', [id]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incidencia no encontrada.' });
    }

    const tipo        = req.body.tipo        || existing.tipo;
    const fecha       = req.body.fecha       || existing.fecha;
    const descripcion = req.body.descripcion || existing.descripcion;
    const estatus     = ['Abierta', 'En proceso', 'Cerrada'].includes(req.body.estatus)
      ? req.body.estatus
      : existing.estatus;

    await pool.query(
      `UPDATE incidencias_rrhh SET tipo = ?, fecha = ?, descripcion = ?, estatus = ? WHERE id_incidencia = ?`,
      [tipo, fecha, descripcion, estatus, id]
    );

    res.json({ success: true, message: 'Incidencia actualizada exitosamente.' });
  } catch (err) {
    next(err);
  }
};


const deleteIncidencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query(
      'SELECT id_incidencia FROM incidencias_rrhh WHERE id_incidencia = ?', [id]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incidencia no encontrada.' });
    }

    await pool.query('DELETE FROM incidencias_rrhh WHERE id_incidencia = ?', [id]);
    res.json({ success: true, message: 'Incidencia eliminada exitosamente.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getIncidencias, getIncidenciaById, createIncidencia, updateIncidencia, deleteIncidencia };
