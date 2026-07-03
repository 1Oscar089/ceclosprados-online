// Public/js/userbar.js
import { initFirebase } from './initFirebase.js';

// Inicializar Firebase y extraer auth/db
const { auth, db } = initFirebase();

import { doc, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const STORAGE_KEY = 'cecp_user_data';

// ===== ICONOS SVG PREMIUM =====
const ICONS = {
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`
};

// ===== CACHE LOCALSTORAGE =====
function saveToCache(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}

function getFromCache() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch(e) { return null; }
}

function updateCache(updates) {
  const current = getFromCache();
  if (current) saveToCache({ ...current, ...updates });
}

// ===== FUNCIÓN GLOBAL PARA LEER GRADO =====
window.getUserGrade = () => {
  const cached = getFromCache();
  return cached?.grado || 7;
};

// ===== TOASTS & CONFIRM =====
window.showToast = (message, type = 'info', duration = 5000) => {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  const timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);

  toast.addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  });
};

window.showConfirm = (message) => new Promise(resolve => {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <p class="confirm-msg">${message}</p>
      <div class="confirm-actions">
        <button id="btn-cancel" class="btn btn-outline btn-sm">Cancelar</button>
        <button id="btn-ok" class="btn btn-primary btn-sm">Aceptar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const cleanup = (val) => { overlay.remove(); resolve(val); };
  document.getElementById('btn-ok').onclick = () => cleanup(true);
  document.getElementById('btn-cancel').onclick = () => cleanup(false);
  overlay.addEventListener('click', e => { if(e.target === overlay) cleanup(false); });
});

// ===== CERRAR SESIÓN CON LIMPIEZA DE CACHE =====
async function handleLogout(isDemo) {
  try {
    // 1. Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // 2. Cerrar sesión
    if (!isDemo) {
      await signOut(auth);
    } else {
      sessionStorage.removeItem('demoUser');
    }
    
    // 3. Feedback y redirección
    window.showToast('Sesión cerrada', 'success');
    setTimeout(() => window.location.href = '/index.html', 800);
  } catch (e) { 
    window.showToast('Error al cerrar', 'error');
  }
}

// ===== LISTENER GLOBAL PARA CERRAR STATS EN MOVIL =====
document.addEventListener('click', (e) => {
  const expandedStats = document.querySelector('.ub-stats.expanded');
  if (expandedStats) {
    const bar = expandedStats.closest('.userbar');
    if (bar && !bar.contains(e.target)) {
      expandedStats.classList.remove('expanded');
    }
  }
});

// ===== INICIALIZACIÓN =====
export function initUserBar(selector = '#userbar') {
  if (!auth || !db) {
    console.error('UserBar: Firebase no inicializado');
    return;
  }

  const container = document.querySelector(selector);
  if (!container) return console.warn('UserBar: contenedor no encontrado');

  // Carga inicial instantánea desde caché para que el usuario no vea "saltos"
  const cached = getFromCache();
  const demoData = sessionStorage.getItem('demoUser');

  if (demoData) {
    renderBar(container, JSON.parse(demoData), true);
  } else if (cached) {
    renderBar(container, cached, false);
  } else {
    container.innerHTML = `<div class="userbar-wrapper"><div class="userbar skeleton" style="height:64px"></div></div>`;
  }

  applySavedTheme();

  // Sincronización en Tiempo Real con Firebase
  auth.onAuthStateChanged((user) => {
    if (demoData) return;

    if (user) {
      const initials = (user.displayName || 'USR').split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
      const local = user.email?.split('@')[0] || '';
      const docId = `est_${local}_${initials}`;
      const userRef = doc(db, 'users', docId);

      // Usamos onSnapshot para mantener la caché sincronizada en vivo con Firebase
      onSnapshot(userRef, async (snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          
          // Obtener la fecha estricta en El Salvador
          const todayStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/El_Salvador',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(new Date());

          // Si es un nuevo día, restablecemos las vidas en Firebase.
          // Esto disparará el onSnapshot nuevamente de forma automática.
          if (!userData.lastLogin || userData.lastLogin < todayStr) {
            console.log('🔄 Nuevo día detectado. Restableciendo vidas a 5...');
            await updateDoc(userRef, {
              energia: 5,
              lastLogin: todayStr,
              updatedAt: serverTimestamp()
            });
            window.showToast('¡Buen día! Tus vidas se han restablecido a 5 ❤️', 'success', 6000);
            return; // Esperamos al siguiente disparo del snapshot
          }

          // Guardamos en caché siempre que hay un cambio en Firebase
          saveToCache(userData);
          
          // Renderizamos la barra con los datos actualizados
          renderBar(container, userData, false);
        } else {
          // Si es usuario nuevo, creamos datos por defecto
          const defaultData = { nombre: user.displayName, puntos: 0, energia: 5, nivel: 1, grado: 7, rol: 'estudiante' };
          saveToCache(defaultData);
          renderBar(container, defaultData, false);
        }
      }, (error) => {
        console.error('Error en UserBar Sync:', error);
      });

    } else {
      // Logout
      localStorage.removeItem(STORAGE_KEY);
      container.innerHTML = '';
    }
  });
}

// ===== RENDERIZADO =====
function renderBar(c, data, isDemo) {
  const fullName = data.nombre || data.name || 'Usuario';
  const firstName = fullName.split(' ')[0];
  const grado = data.grado || 7;
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  c.innerHTML = `
    <div class="userbar-wrapper">
      <div class="userbar">
        <div class="ub-left">
          <span class="ub-name-desktop" title="${fullName}">${fullName}</span>
          <span class="ub-name-mobile" title="${fullName}">${firstName}</span>
          <span class="ub-grade-badge">${grado}°</span>
          <div class="ub-stats">
            <span class="ub-stat" title="Puntos">${ICONS.star} <span class="stat-pts">${data.puntos ?? 0}</span></span>
            <span class="ub-stat ub-danger" title="Vidas">${ICONS.heart} <span class="stat-eng">${data.energia ?? 5}</span></span>
            <span class="ub-stat ub-secondary" title="Nivel">${ICONS.trophy} <span class="stat-lvl">Nv.${data.nivel ?? 1}</span></span>
          </div>
        </div>
        
        <div class="ub-right">
          <button id="theme-toggle" class="btn-icon" aria-label="Cambiar tema">
            ${currentTheme === 'dark' ? ICONS.sun : ICONS.moon}
          </button>
          <button class="btn-icon ub-logout" aria-label="Cerrar sesión">
            ${ICONS.logout}
          </button>
        </div>
      </div>
    </div>
  `;

  // Stats Toggle (Móvil)
  const nameEl = c.querySelector('.ub-name-mobile');
  const statsEl = c.querySelector('.ub-stats');
  
  if (nameEl && statsEl) {
    nameEl.addEventListener('click', (e) => {
      e.stopPropagation();
      statsEl.classList.toggle('expanded');
    });
  }

  // Tema
  c.querySelector('#theme-toggle')?.addEventListener('click', toggleTheme);
  
  // Logout
  c.querySelector('.ub-logout')?.addEventListener('click', async () => {
    const confirmed = await window.showConfirm('¿Cerrar sesión?');
    if (confirmed) {
      handleLogout(isDemo);
    }
  });
}

// ===== ACTUALIZACIÓN GLOBAL RÁPIDA (Opcional, ya que onSnapshot hace el trabajo pesado) =====
export function updateUserBarStats(points, energy, level) {
  // Ahora Firebase es la fuente de la verdad, pero podemos actualizar visualmente al instante
  const pts = document.querySelector('.stat-pts');
  const eng = document.querySelector('.stat-eng');
  const lvl = document.querySelector('.stat-lvl');
  if (pts) pts.textContent = points;
  if (eng) eng.textContent = energy;
  if (lvl) lvl.textContent = `Nv.${level}`;
  updateCache({ puntos: points, energia: energy, nivel: level });
}

// ===== TEMA =====
function applySavedTheme() {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.querySelector('#theme-toggle');
  if (btn) btn.innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: next } }));
}

export { toggleTheme, applySavedTheme };