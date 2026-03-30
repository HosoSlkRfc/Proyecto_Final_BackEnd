-- ============================================================
-- SGRH-Employees | Script de tabla adicional: incidencias_rrhh
-- Ejecutar sobre la base de datos employees ya importada
-- ============================================================

USE employees;

CREATE TABLE IF NOT EXISTS incidencias_rrhh (
  id_incidencia INT AUTO_INCREMENT PRIMARY KEY,
  emp_no        INT NOT NULL,
  tipo          VARCHAR(100) NOT NULL,
  fecha         DATE NOT NULL,
  descripcion   TEXT NOT NULL,
  estatus       ENUM('Abierta','En proceso','Cerrada') NOT NULL DEFAULT 'Abierta',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_incidencia_emp FOREIGN KEY (emp_no)
    REFERENCES employees(emp_no) ON DELETE CASCADE
);

-- Datos de ejemplo (empleados reales de la base employees)
INSERT INTO incidencias_rrhh (emp_no, tipo, fecha, descripcion, estatus) VALUES
(10001, 'Ausencia',          '2024-03-01', 'Falta injustificada sin aviso previo.',           'Cerrada'),
(10002, 'Retardo',           '2024-03-05', 'Llegó 45 minutos tarde sin justificación.',       'Cerrada'),
(10003, 'Reconocimiento',    '2024-03-10', 'Excelente desempeño en proyecto Q1.',             'Cerrada'),
(10004, 'Conducta',          '2024-03-15', 'Conflicto verbal con compañero de área.',         'En proceso'),
(10005, 'Permiso',           '2024-03-20', 'Solicitud de permiso por asunto médico familiar.','Abierta'),
(10006, 'Ausencia',          '2024-04-01', 'Segunda falta del mes sin justificante.',         'Abierta'),
(10007, 'Reconocimiento',    '2024-04-05', 'Propuesta de mejora aceptada por dirección.',     'Cerrada'),
(10008, 'Retardo',           '2024-04-10', 'Retraso recurrente en horario de entrada.',       'En proceso');
