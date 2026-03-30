/**
 * dashboard.js — Lógica del dashboard principal.
 */

document.addEventListener('DOMContentLoaded', async () => {
  setActiveNav('dashboard');
  await loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await DashboardAPI.getResumen();
    if (!res.success) throw new Error(res.message);

    const d = res.data;
    renderMetrics(d);
    renderDeptBars(d.empleadosPorDept);
    renderRecentIncidencias(d.incidenciasRecientes);
  } catch (err) {
    document.getElementById('metrics-grid').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>Error al cargar: ${err.message}</p></div>`;
  }
}

function renderMetrics(d) {
  const grid = document.getElementById('metrics-grid');
  grid.innerHTML = `
    <div class="metric-card green">
      <div class="metric-icon">👥</div>
      <div class="metric-info">
        <div class="metric-value">${d.totalEmpleados.toLocaleString()}</div>
        <div class="metric-label">Empleados activos</div>
      </div>
    </div>
    <div class="metric-card blue">
      <div class="metric-icon">🏢</div>
      <div class="metric-info">
        <div class="metric-value">${d.totalDepartamentos}</div>
        <div class="metric-label">Departamentos</div>
      </div>
    </div>
    <div class="metric-card yellow">
      <div class="metric-icon">📋</div>
      <div class="metric-info">
        <div class="metric-value">${d.totalIncidencias}</div>
        <div class="metric-label">Total incidencias</div>
      </div>
    </div>
    <div class="metric-card red">
      <div class="metric-icon">⚠️</div>
      <div class="metric-info">
        <div class="metric-value">${d.incidenciasAbiertas}</div>
        <div class="metric-label">Incidencias abiertas</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon">💰</div>
      <div class="metric-info">
        <div class="metric-value" style="font-size:1.3rem">${formatCurrency(d.salarioPromedio)}</div>
        <div class="metric-label">Salario promedio</div>
      </div>
    </div>
  `;
}

function renderDeptBars(depts) {
  if (!depts || depts.length === 0) {
    document.getElementById('dept-bars').innerHTML = '<div class="empty-state"><p>Sin datos</p></div>';
    return;
  }
  const max = Math.max(...depts.map(d => d.total));
  const html = depts.map(d => `
    <div class="bar-item">
      <div class="bar-label">
        <span>${d.dept_name}</span>
        <span>${d.total.toLocaleString()}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${Math.round((d.total / max) * 100)}%"></div>
      </div>
    </div>
  `).join('');
  document.getElementById('dept-bars').innerHTML = `<div class="bar-list">${html}</div>`;
}

function renderRecentIncidencias(incidencias) {
  if (!incidencias || incidencias.length === 0) {
    document.getElementById('recent-incidencias').innerHTML =
      '<div class="empty-state"><div class="empty-icon">✅</div><p>Sin incidencias registradas.</p></div>';
    return;
  }
  const rows = incidencias.map(i => `
    <tr>
      <td>${i.emp_no}</td>
      <td>${i.nombre_empleado}</td>
      <td>${i.tipo}</td>
      <td>${formatDate(i.fecha)}</td>
      <td><span class="badge ${getBadgeClass(i.estatus)}">${i.estatus}</span></td>
    </tr>
  `).join('');
  document.getElementById('recent-incidencias').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID Emp.</th><th>Empleado</th><th>Tipo</th><th>Fecha</th><th>Estatus</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
