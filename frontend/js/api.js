
const API_BASE = '/api';

/**
 * Función genérica de fetch con manejo de errores.
 * @param {string} path  - Ruta relativa, e.g. '/employees'
 * @param {object} opts  - Opciones de fetch (method, body, headers…)
 * @returns {Promise<any>}
 */
async function apiFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    ...opts,
    headers: { ...defaultHeaders, ...(opts.headers || {}) }
  });

  const data = await res.json().catch(() => ({ success: false, message: 'Respuesta no válida del servidor.' }));

  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data;
}


const EmployeesAPI = {
  getAll:      (params = {}) => apiFetch(`/employees?${new URLSearchParams(params)}`),
  getById:     (id)          => apiFetch(`/employees/${id}`),
  getHistorial:(id)          => apiFetch(`/employees/${id}/historial`)
};

const DepartmentsAPI = {
  getAll:        ()          => apiFetch('/departments'),
  getEmployees:  (dept, p)   => apiFetch(`/departments/${dept}/employees?${new URLSearchParams(p || {})}`)
};


const IncidenciasAPI = {
  getAll:    (params = {}) => apiFetch(`/incidencias?${new URLSearchParams(params)}`),
  getById:   (id)          => apiFetch(`/incidencias/${id}`),
  create:    (body)        => apiFetch('/incidencias',      { method: 'POST',   body: JSON.stringify(body) }),
  update:    (id, body)    => apiFetch(`/incidencias/${id}`,{ method: 'PUT',    body: JSON.stringify(body) }),
  remove:    (id)          => apiFetch(`/incidencias/${id}`,{ method: 'DELETE' })
};

const DashboardAPI = {
  getResumen: () => apiFetch('/dashboard/resumen')
};


const WeatherAPI = {
  get: () => apiFetch('/weather')
};
