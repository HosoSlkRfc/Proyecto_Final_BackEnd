const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'employees',
  port:             parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
});


pool.getConnection()
  .then(conn => {
    console.log('✅  Conexión a MySQL establecida correctamente.');
    conn.release();
  })
  .catch(err => {
    console.error('❌  Error al conectar con MySQL:', err.message);
    console.error('    Verifica las credenciales en el archivo .env');
  });

module.exports = pool;
