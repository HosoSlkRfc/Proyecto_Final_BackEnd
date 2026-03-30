/**
 * departments.js — Lista de departamentos y empleados por departamento.
 */

const DEPT_COLORS = [
  '#3a7bd5','#e74c3c','#27ae60','#f39c12','#9b59b6',
  '#1abc9c','#e67e22','#2980b9','#8e44ad','#16a085'
];

let selectedDept = null;
let deptPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  setActiveNav('departments');
  await loadDepartments();

  // Abrir dept desde query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('dept')) openDept(params.get('dept'), params.get('name') || '');
});

async function loadDepartments() {
  const grid = document.getElementById('dept-grid');
  try {
    const res = await DepartmentsAPI.getAll();
    if (!res.success) throw new Error(res.message);
    renderDeptGrid(res.data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderDeptGrid(depts) {
  if (!depts.length) {
    document.getElementById('dept-grid').innerHTML = '<div class="empty-state"><p>Sin departamentos.</p></div>';
    return;
  }
  const cards = depts.map((d, i) => `
    <div class="dept-card" style="border-left-color:${DEPT_COLORS[i % DEPT_COLORS.length]}"
         onclick="openDept('${d.dept_no}', '${d.dept_name}')">
      <div class="dept-no">${d.dept_no}</div>
      <div class="dept-name">${d.dept_name}</div>
      <div class="dept-count">${Number(d.total_empleados).toLocaleString()}</div>
      <div class="dept-count-label">empleados activos</div>
      ${d.gerente_actual ? `<div class="dept-manager">👤 ${d.gerente_actual}</div>` : ''}
    </div>
  `).join('');
  document.getElementById('dept-grid').innerHTML = cards;
}

async function openDept(deptNo, deptName) {
  selectedDept = deptNo;
  deptPage = 1;

  const card = document.getElementById('dept-detail-card');
  card.style.display = 'block';
  document.getElementById('dept-detail-title').textContent = `👥 Empleados — ${deptName}`;
  card.scrollIntoView({ behavior: 'smooth' });

  await loadDeptEmployees();
}

function closeDeptDetail() {
  document.getElementById('dept-detail-card').style.display = 'none';
  selectedDept = null;
}

async function loadDeptEmployees() {
  const container = document.getElementById('dept-employees-container');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Cargando empleados...</div>';

  try {
    const res = await DepartmentsAPI.getEmployees(selectedDept, { page: deptPage, limit: 20 });
    renderDeptEmployees(res.data, res.pagination);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderDeptEmployees(employees, pag) {
  if (!employees.length) {
    document.getElementById('dept-employees-container').innerHTML =
      '<div class="empty-state"><div class="empty-icon">👥</div><p>Sin empleados activos.</p></div>';
    return;
  }
  const rows = employees.map(e => `
    <tr>
      <td><strong>#${e.emp_no}</strong></td>
      <td>${e.first_name} ${e.last_name}</td>
      <td>${e.gender === 'M' ? '♂' : '♀'}</td>
      <td>${e.current_title || '—'}</td>
      <td>${formatCurrency(e.current_salary)}</td>
      <td>${formatDate(e.hire_date)}</td>
      <td>
        <a href="employee-detail.html?id=${e.emp_no}" class="btn btn-sm btn-primary">Ver</a>
      </td>
    </tr>`).join('');

  document.getElementById('dept-employees-container').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>ID</th><th>Nombre</th><th>G.</th><th>Puesto</th>
          <th>Salario</th><th>Ingreso</th><th>Acción</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  renderDeptPagination(pag);
}

function renderDeptPagination({ total, page, limit, totalPages }) {
  const container = document.getElementById('dept-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  container.innerHTML = `
    <button onclick="goDeptPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Ant.</button>
    <span class="pag-info">Pág. ${page} / ${totalPages} (${start}–${end} de ${total.toLocaleString()})</span>
    <button onclick="goDeptPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Sig. ›</button>
  `;
}

function goDeptPage(page) {
  deptPage = page;
  loadDeptEmployees();
}
