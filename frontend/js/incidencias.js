

let incPage = 1;
let filterEmp    = '';
let filterEstatus = '';
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav('incidencias');

  const params = new URLSearchParams(window.location.search);
  if (params.get('emp_no')) {
    document.getElementById('field-emp_no').value = params.get('emp_no');
  }
  if (params.get('edit')) {
    loadForEdit(params.get('edit'));
  }


  document.getElementById('field-fecha').value = new Date().toISOString().split('T')[0];

  loadIncidencias();

  document.getElementById('incidencia-form').addEventListener('submit', handleSubmit);
  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);
  document.getElementById('btn-filter').addEventListener('click', applyFilter);
  document.getElementById('btn-reset-filter').addEventListener('click', resetFilter);
  document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
});



async function loadIncidencias() {
  const container = document.getElementById('incidencias-table');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Cargando...</div>';

  const queryParams = { page: incPage, limit: 15 };
  if (filterEmp)    queryParams.emp_no  = filterEmp;
  if (filterEstatus) queryParams.estatus = filterEstatus;

  try {
    const res = await IncidenciasAPI.getAll(queryParams);
    renderTable(res.data);
    renderPagination(res.pagination);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
  }
}

function renderTable(incidencias) {
  if (!incidencias.length) {
    document.getElementById('incidencias-table').innerHTML =
      '<div class="empty-state"><div class="empty-icon">📭</div><p>No se encontraron incidencias.</p></div>';
    return;
  }
  const rows = incidencias.map(i => `
    <tr>
      <td><strong>#${i.id_incidencia}</strong></td>
      <td>
        <a href="employee-detail.html?id=${i.emp_no}" class="btn-link">${i.emp_no}</a><br>
        <small class="text-muted">${i.nombre_empleado}</small>
      </td>
      <td>${i.tipo}</td>
      <td>${formatDate(i.fecha)}</td>
      <td style="max-width:160px; font-size:0.8rem">${i.descripcion}</td>
      <td><span class="badge ${getBadgeClass(i.estatus)}">${i.estatus}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm btn-secondary" onclick="loadForEdit(${i.id_incidencia})">✏️</button>
        <button class="btn btn-sm btn-danger"    onclick="askDelete(${i.id_incidencia})">🗑️</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('incidencias-table').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Empleado</th><th>Tipo</th><th>Fecha</th>
            <th>Descripción</th><th>Estatus</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderPagination({ total, page, limit, totalPages }) {
  const container = document.getElementById('inc-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  container.innerHTML = `
    <button onclick="goIncPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Ant.</button>
    <span class="pag-info">Pág. ${page} / ${totalPages} (${start}–${end} de ${total})</span>
    <button onclick="goIncPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Sig. ›</button>
  `;
}

function goIncPage(page) { incPage = page; loadIncidencias(); }



function applyFilter() {
  filterEmp     = document.getElementById('filter-emp').value.trim();
  filterEstatus = document.getElementById('filter-estatus').value;
  incPage = 1;
  loadIncidencias();
}

function resetFilter() {
  document.getElementById('filter-emp').value     = '';
  document.getElementById('filter-estatus').value = '';
  filterEmp = ''; filterEstatus = '';
  incPage = 1;
  loadIncidencias();
}



async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;

  const body = {
    emp_no:      document.getElementById('field-emp_no').value,
    tipo:        document.getElementById('field-tipo').value,
    fecha:       document.getElementById('field-fecha').value,
    descripcion: document.getElementById('field-descripcion').value,
    estatus:     document.getElementById('field-estatus').value
  };

  
  if (!body.emp_no || !body.tipo || !body.fecha || !body.descripcion.trim()) {
    showToast('Completa todos los campos requeridos.', 'error');
    return;
  }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    let res;
    if (id) {
      res = await IncidenciasAPI.update(id, body);
      showToast('Incidencia actualizada correctamente.', 'success');
    } else {
      res = await IncidenciasAPI.create(body);
      showToast('Incidencia registrada correctamente.', 'success');
    }
    if (!res.success) throw new Error(res.message);
    resetForm();
    incPage = 1;
    loadIncidencias();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar';
  }
}

async function loadForEdit(id) {
  try {
    const res = await IncidenciasAPI.getById(id);
    if (!res.success) throw new Error(res.message);
    const i = res.data;

    document.getElementById('edit-id').value         = i.id_incidencia;
    document.getElementById('field-emp_no').value    = i.emp_no;
    document.getElementById('field-tipo').value      = i.tipo;
    document.getElementById('field-fecha').value     = i.fecha?.split('T')[0] || i.fecha;
    document.getElementById('field-descripcion').value = i.descripcion;
    document.getElementById('field-estatus').value   = i.estatus;

    document.getElementById('form-title').textContent = `✏️ Editar incidencia #${id}`;
    document.getElementById('btn-submit').textContent = '💾 Actualizar';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    document.getElementById('incidencia-form').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetForm() {
  document.getElementById('edit-id').value = '';
  document.getElementById('incidencia-form').reset();
  document.getElementById('field-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('form-title').textContent = '➕ Nueva incidencia';
  document.getElementById('btn-submit').textContent = '💾 Guardar';
  document.getElementById('btn-cancel-edit').style.display = 'none';
}



function askDelete(id) {
  pendingDeleteId = id;
  document.getElementById('confirm-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('confirm-modal').classList.remove('open');
  pendingDeleteId = null;
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  try {
    const res = await IncidenciasAPI.remove(pendingDeleteId);
    if (!res.success) throw new Error(res.message);
    showToast('Incidencia eliminada.', 'success');
    loadIncidencias();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    closeModal();
  }
}
