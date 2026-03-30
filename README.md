# SGRH-Employees
### Sistema de Gestión de Recursos Humanos · Backend Intermedio

Aplicación full stack local que reutiliza la base de datos pública **`employees`** de MySQL.
Stack: **Node.js + Express + MySQL2 + HTML/CSS/JS Vanilla + OpenWeatherMap API**.

---

## Estructura del proyecto

```
SGRH-Employees/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  ← Pool de conexión MySQL
│   │   ├── controllers/
│   │   │   ├── employeesController.js
│   │   │   ├── departmentsController.js
│   │   │   ├── incidenciasController.js
│   │   │   ├── dashboardController.js
│   │   │   └── weatherController.js
│   │   ├── routes/
│   │   │   ├── employees.js
│   │   │   ├── departments.js
│   │   │   ├── incidencias.js
│   │   │   ├── dashboard.js
│   │   │   └── weather.js
│   │   └── middlewares/
│   │       └── errorHandler.js
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html              ← Dashboard
│   ├── employees.html          ← Lista de empleados
│   ├── employee-detail.html    ← Detalle + historial
│   ├── departments.html        ← Departamentos
│   ├── incidencias.html        ← CRUD incidencias
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js              ← Módulo centralizado de fetch
│       ├── weather.js          ← Widget de clima + helpers
│       ├── dashboard.js
│       ├── employees.js
│       ├── employee-detail.js
│       ├── departments.js
│       └── incidencias.js
└── sql/
    └── incidencias_rrhh.sql    ← Script de tabla adicional + datos ejemplo
```

---

## Prerrequisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x          |
| npm         | 9.x           |
| MySQL       | 8.x           |

---

## Instalación paso a paso

### 1 · Importar la base de datos `employees`

Si aún no tienes la base instalada, descárgala de:
👉 https://github.com/datacharmer/test_db

```bash
# Importar la base employees
mysql -u root -p < employees.sql
```

### 2 · Crear la tabla `incidencias_rrhh`

```bash
mysql -u root -p employees < sql/incidencias_rrhh.sql
```

Esto crea la tabla con datos de ejemplo.

### 3 · Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=employees
DB_PORT=3306
PORT=3000
NODE_ENV=development

# API gratuita de OpenWeatherMap: https://openweathermap.org/api
WEATHER_API_KEY=tu_api_key_aqui
WEATHER_CITY=Mexico City
```

> **Nota:** La Weather API es opcional. Si no configuras la clave, el widget mostrará "Sin datos" pero el resto del sistema funcionará con normalidad.

### 4 · Instalar dependencias

```bash
cd backend
npm install
```

### 5 · Ejecutar el servidor

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

### 6 · Abrir en el navegador

```
http://localhost:3000
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/employees` | Listar empleados (query: `search`, `page`, `limit`) |
| GET | `/api/employees/:id` | Detalle de un empleado |
| GET | `/api/employees/:id/historial` | Historial de puestos, salarios y depts |
| GET | `/api/departments` | Listar departamentos con totales |
| GET | `/api/departments/:dept_no/employees` | Empleados de un departamento |
| POST | `/api/incidencias` | Registrar incidencia |
| GET | `/api/incidencias` | Listar incidencias (filtros: `emp_no`, `estatus`) |
| GET | `/api/incidencias/:id` | Detalle de incidencia |
| PUT | `/api/incidencias/:id` | Actualizar incidencia |
| DELETE | `/api/incidencias/:id` | Eliminar incidencia |
| GET | `/api/dashboard/resumen` | Métricas del dashboard |
| GET | `/api/weather` | Temperatura actual (via OpenWeatherMap) |

---

## Módulos del sistema

- **Dashboard** — Métricas totales, gráfica de empleados por departamento, incidencias recientes y widget clima/fecha.
- **Empleados** — Tabla paginada con búsqueda por nombre o ID. Navegación al detalle.
- **Detalle de empleado** — Info completa, historial de puestos, salarios, departamentos e incidencias del empleado.
- **Departamentos** — Tarjetas con conteo de empleados y gerente. Click para ver la lista de empleados del dpto.
- **Incidencias RRHH** — CRUD completo: alta, edición, eliminación con confirmación y filtros.

---

## Tabla adicional: `incidencias_rrhh`

```sql
CREATE TABLE incidencias_rrhh (
  id_incidencia INT AUTO_INCREMENT PRIMARY KEY,
  emp_no        INT NOT NULL,
  tipo          VARCHAR(100) NOT NULL,
  fecha         DATE NOT NULL,
  descripcion   TEXT NOT NULL,
  estatus       ENUM('Abierta','En proceso','Cerrada') DEFAULT 'Abierta',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no) ON DELETE CASCADE
);
```

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Base de datos | MySQL 8 + base `employees` |
| Conector | `mysql2` (pool de conexiones) |
| Backend | Node.js + Express |
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| API externa | OpenWeatherMap (clima) |
| Control de versiones | Git + GitHub |
