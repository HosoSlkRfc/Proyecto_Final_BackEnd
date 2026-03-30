/**
 * weather.js — Widget de clima y fecha presente en todas las páginas.
 * Actualiza el elemento #weather-widget del DOM.
 */

function updateDate() {
  const now = new Date();
  const opts = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  const dateStr = now.toLocaleDateString('es-MX', opts);
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}

async function loadWeatherWidget() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;

  // Mostrar fecha de inmediato
  const { dateStr, timeStr } = updateDate();
  widget.innerHTML = `
    <div class="weather-icon"><div class="placeholder">⏳</div></div>
    <div class="weather-info">
      <div class="weather-temp">--°C</div>
      <div class="weather-desc">Cargando...</div>
      <div class="weather-city">--</div>
    </div>
    <div class="weather-date">
      <div class="date-day">${dateStr}</div>
      <div>${timeStr}</div>
    </div>
  `;

  try {
    const res = await WeatherAPI.get();

    if (!res.success || !res.data.temp) {
      // Sin key o error → mostrar solo fecha
      widget.innerHTML = `
        <div class="weather-icon"><div class="placeholder">🌡️</div></div>
        <div class="weather-info">
          <div class="weather-temp" style="font-size:1rem;">Sin clima</div>
          <div class="weather-desc">${res.message || 'API no configurada'}</div>
        </div>
        <div class="weather-date">
          <div class="date-day">${dateStr}</div>
          <div>${timeStr}</div>
        </div>
      `;
      return;
    }

    const d = res.data;
    widget.innerHTML = `
      <div class="weather-icon">
        ${d.icon ? `<img src="${d.icon}" alt="${d.description}">` : '<div class="placeholder">🌤️</div>'}
      </div>
      <div class="weather-info">
        <div class="weather-temp">${d.temp}°C</div>
        <div class="weather-desc">${d.description}</div>
        <div class="weather-city">📍 ${d.city}${d.country ? ', ' + d.country : ''}</div>
      </div>
      <div class="weather-date">
        <div class="date-day">${dateStr}</div>
        <div>${timeStr}</div>
      </div>
    `;
  } catch (err) {
    const { dateStr, timeStr } = updateDate();
    widget.innerHTML = `
      <div class="weather-icon"><div class="placeholder">❌</div></div>
      <div class="weather-info">
        <div class="weather-temp" style="font-size:0.85rem;">Error de red</div>
        <div class="weather-desc">Backend no disponible</div>
      </div>
      <div class="weather-date">
        <div class="date-day">${dateStr}</div>
        <div>${timeStr}</div>
      </div>
    `;
  }
}

// ── Toast de notificaciones ───────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; }, 2800);
  setTimeout(() => toast.remove(), 3200);
}

// ── Helpers de UI ─────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function getBadgeClass(estatus) {
  const map = { 'Abierta': 'badge-red', 'En proceso': 'badge-yellow', 'Cerrada': 'badge-green' };
  return map[estatus] || 'badge-gray';
}

function setActiveNav(page) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-page') === page);
  });
}

// Inicializar widget al cargar
document.addEventListener('DOMContentLoaded', loadWeatherWidget);
