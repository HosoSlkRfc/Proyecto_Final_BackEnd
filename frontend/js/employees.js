/**
 * employees.js — Lista y búsqueda de empleados con paginación.
 */

let currentPage = 1;
let currentSearch = '';
const LIMIT = 20;

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav('employees');
  loadEmployees();

  document.getElementById('btn-search').addEventListener('click', doSearch);
  document.getElementById('btn-clear').addEventListener('click', clearSearch);
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
});

function doSearch() {
  currentSearch = document.getElementById('search-input').value.trim();
  currentPage = 1;
  loadEmployees();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  currentSearch = '';
  currentPage = 1;
  loadEmployees();
}

async function loadEmployees() {
  const container = document.getElementById('table-container');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Cargando...</div>';

  try {
    const res = await EmployeesAPI.getAll({ search: currentSearch, page: currentPage, limit: LIMIT });
    renderTable(res.data);
    renderPagination(res.pagination);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderTable(employees) {
  if (!employees || employees.length === 0) {
    document.getElementById('table-container').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🔍</div><p>No se encontraron empleados.</p></div>';
    return;
  }

  const rows = employees.map(e => `
    <tr style="cursor:pointer" onclick="goToDetail(${e.emp_no})">
      <td><strong>#${e.emp_no}</strong></td>
      <td>${e.first_name} ${e.last_name}</td>
      <td>${e.gender === 'M' ? '♂ Hombre' : '♀ Mujer'}</td>
      <td>${e.dept_name || '<span class="text-muted">—</span>'}</td>
      <td>${e.current_title || '<span class="text-muted">—</span>'}</td>
      <td>${formatCurrency(e.current_salary)}</td>
      <td>${formatDate(e.hire_date)}</td>
      <td>
        <a href="employee-detail.html?id=${e.emp_no}" class="btn btn-sm btn-primary" onclick="event.stopPropagation()">
          Ver detalle
        </a>
      </td>
    </tr>
  `).join('');

  document.getElementById('table-container').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Género</th>
            <th>Departamento</th>
            <th>Puesto actual</th>
            <th>Salario actual</th>
            <th>Fecha ingreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderPagination({ total, page, limit, totalPages }) {
  const container = document.getElementById('pagination-container');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  let pages = '';
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages += `<button class="${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  container.innerHTML = `
    <button onclick="goToPage(1)" ${page === 1 ? 'disabled' : ''}>« Inicio</button>
    <button onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Ant.</button>
    ${pages}
    <button onclick="goToPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Sig. ›</button>
    <button onclick="goToPage(${totalPages})" ${page === totalPages ? 'disabled' : ''}>Fin »</button>
    <span class="pag-info">Mostrando ${start}–${end} de ${total.toLocaleString()}</span>
  `;
}

function goToPage(page) {
  currentPage = page;
  loadEmployees();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToDetail(id) {
  window.location.href = `employee-detail.html?id=${id}`;
}
