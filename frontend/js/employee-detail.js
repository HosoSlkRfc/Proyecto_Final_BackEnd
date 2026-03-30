/**
 * employee-detail.js — Vista de detalle de un empleado.
 * Muestra info básica, historial de puestos/salarios/depts e incidencias.
 */

let empId = null;

document.addEventListener('DOMContentLoaded', async () => {
  setActiveNav('employees');

  const params = new URLSearchParams(window.location.search);
  empId = params.get('id');

  if (!empId) {
    document.getElementById('emp-card').innerHTML =
      '<div class="empty-state"><div class="empty-icon">❌</div><p>ID de empleado no especificado.</p></div>';
    return;
  }

  await Promise.all([loadEmployee(), loadHistorial(), loadEmpIncidencias()]);

  document.getElementById('btn-nueva-incidencia')?.addEventListener('click', () => {
    window.location.href = `incidencias.html?emp_no=${empId}`;
  });
});

async function loadEmployee() {
  try {
    const res = await EmployeesAPI.getById(empId);
    if (!res.success) throw new Error(res.message);
    renderEmployee(res.data);
  } catch (err) {
    document.getElementById('emp-card').innerHTML =
      `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderEmployee(e) {
  document.getElementById('page-title').textContent = `${e.first_name} ${e.last_name}`;
  document.getElementById('bc-name').textContent    = `${e.first_name} ${e.last_name}`;

  const initials = (e.first_name[0] + e.last_name[0]).toUpperCase();
  const genderClass = e.gender === 'M' ? 'male' : 'female';

  document.getElementById('emp-card').innerHTML = `
    <div class="card mb-0">
      <div class="emp-header">
        <div class="emp-avatar ${genderClass}">${initials}</div>
        <div class="emp-info">
          <h2>${e.first_name} ${e.last_name}</h2>
          <p>Empleado #${e.emp_no} · ${e.current_title || 'Sin puesto vigente'}</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>Número de empleado</label>
          <span>#${e.emp_no}</span>
        </div>
        <div class="info-item">
          <label>Género</label>
          <span>${e.gender === 'M' ? '♂ Hombre' : '♀ Mujer'}</span>
        </div>
        <div class="info-item">
          <label>Fecha de nacimiento</label>
          <span>${formatDate(e.birth_date)}</span>
        </div>
        <div class="info-item">
          <label>Fecha de ingreso</label>
          <span>${formatDate(e.hire_date)}</span>
        </div>
        <div class="info-item">
          <label>Departamento actual</label>
          <span>${e.dept_name || '—'}</span>
        </div>
        <div class="info-item">
          <label>Puesto actual</label>
          <span>${e.current_title || '—'}</span>
        </div>
        <div class="info-item">
          <label>Salario actual</label>
          <span>${formatCurrency(e.current_salary)}</span>
        </div>
        <div class="info-item">
          <label>En dpto. desde</label>
          <span>${formatDate(e.dept_since)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('historial-section').style.display = 'block';
}

async function loadHistorial() {
  try {
    const res = await EmployeesAPI.getHistorial(empId);
    if (!res.success) throw new Error(res.message);
    const { titles, salaries, departments } = res.data;
    renderTitles(titles);
    renderSalaries(salaries);
    renderDepts(departments);
  } catch (err) {
    ['titles-table','salaries-table','depts-table'].forEach(id => {
      document.getElementById(id).innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
    });
  }
}

function renderTitles(titles) {
  if (!titles.length) {
    document.getElementById('titles-table').innerHTML = '<div class="empty-state"><p>Sin historial de puestos.</p></div>';
    return;
  }
  const rows = titles.map(t => `
    <tr>
      <td>${t.title}</td>
      <td>${formatDate(t.from_date)}</td>
      <td>${t.to_date === '9999-01-01' ? '<span class="badge badge-green">Vigente</span>' : formatDate(t.to_date)}</td>
    </tr>`).join('');
  document.getElementById('titles-table').innerHTML = `
    <div class="table-wrap">
      <table><thead><tr><th>Puesto</th><th>Desde</th><th>Hasta</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
}

function renderSalaries(salaries) {
  if (!salaries.length) {
    document.getElementById('salaries-table').innerHTML = '<div class="empty-state"><p>Sin historial de salarios.</p></div>';
    return;
  }
  const rows = salaries.map(s => `
    <tr>
      <td>${formatCurrency(s.salary)}</td>
      <td>${formatDate(s.from_date)}</td>
      <td>${s.to_date === '9999-01-01' ? '<span class="badge badge-green">Vigente</span>' : formatDate(s.to_date)}</td>
    </tr>`).join('');
  document.getElementById('salaries-table').innerHTML = `
    <div class="table-wrap">
      <table><thead><tr><th>Salario</th><th>Desde</th><th>Hasta</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
}

function renderDepts(depts) {
  if (!depts.length) {
    document.getElementById('depts-table').innerHTML = '<div class="empty-state"><p>Sin historial de departamentos.</p></div>';
    return;
  }
  const rows = depts.map(d => `
    <tr>
      <td>${d.dept_name}</td>
      <td>${d.dept_no}</td>
      <td>${formatDate(d.from_date)}</td>
      <td>${d.to_date === '9999-01-01' ? '<span class="badge badge-green">Vigente</span>' : formatDate(d.to_date)}</td>
    </tr>`).join('');
  document.getElementById('depts-table').innerHTML = `
    <div class="table-wrap">
      <table><thead><tr><th>Departamento</th><th>Código</th><th>Desde</th><th>Hasta</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>`;
}

async function loadEmpIncidencias() {
  try {
    const res = await IncidenciasAPI.getAll({ emp_no: empId, limit: 50 });
    const container = document.getElementById('emp-incidencias');
    if (!res.data.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>Sin incidencias registradas.</p></div>';
      return;
    }
    const rows = res.data.map(i => `
      <tr>
        <td>${i.id_incidencia}</td>
        <td>${i.tipo}</td>
        <td>${formatDate(i.fecha)}</td>
        <td>${i.descripcion}</td>
        <td><span class="badge ${getBadgeClass(i.estatus)}">${i.estatus}</span></td>
        <td>
          <a href="incidencias.html?edit=${i.id_incidencia}" class="btn btn-sm btn-secondary">Editar</a>
        </td>
      </tr>`).join('');
    container.innerHTML = `
      <div class="table-wrap">
        <table><thead><tr><th>ID</th><th>Tipo</th><th>Fecha</th><th>Descripción</th><th>Estatus</th><th>Acción</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </div>`;
  } catch (err) {
    document.getElementById('emp-incidencias').innerHTML =
      `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}
