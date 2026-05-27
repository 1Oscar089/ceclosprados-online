// Public/js/userbar.js
import { initFirebase, getAuthInstance, getDbInstance } from './initFirebase.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

export function initUserBar(containerSelector = '#userbar') {
  const { auth, db } = initFirebase();
  const container = document.querySelector(containerSelector);
  if (!container) return console.warn('UserBar: contenedor #userbar no encontrado');

  // Skeleton inicial
  container.innerHTML = `<div class="userbar-wrapper"><div class="userbar card skeleton" style="height:68px"></div></div>`;

  auth.onAuthStateChanged(async (user) => {
    let userData = null;
    let isDemo = false;

    // 1. Modo demo
    const demoData = sessionStorage.getItem('demoUser');
    if (demoData) {
      userData = JSON.parse(demoData);
      isDemo = true;
      renderBar(container, userData, isDemo, auth, db);
      return;
    }

    // 2. Usuario real
    if (user) {
      try {
        const initials = (user.displayName || 'USR').split(' ').map(n=>n[0]).join('').slice(0,3).toUpperCase();
        const local = user.email?.split('@')[0] || '';
        const isStudent = /^\d+$/.test(local);
        const docId = isStudent ? `est_${local}_${initials}` : `doc_${initials}_0`;
        
        const snap = await getDoc(doc(db, 'users', docId));
        userData = snap.exists() ? snap.data() : { name: user.displayName, puntos: 0, energia: 5, nivel: 1, rol: 'estudiante' };
        renderBar(container, userData, isDemo, auth, db);
      } catch (err) {
        console.error('UserBar:', err);
        renderFallback(container, user.displayName || 'Usuario');
      }
    } else {
      container.innerHTML = '';
    }
  });
}

function renderBar(container, data, isDemo, auth, db) {
  const name = data.name || 'Usuario';
  const rol = data.rol || 'estudiante';
  const initial = name.charAt(0).toUpperCase();

  container.innerHTML = `
    <div class="userbar-wrapper">
      <div class="userbar card flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="avatar-ring" style="width:42px;height:42px;border-radius:50%;background:var(--primary);padding:2px">
            <div class="avatar" style="width:100%;height:100%;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary);font-size:1.1rem">
              ${initial}
            </div>
          </div>
          <div>
            <span class="user-name font-bold text-sm">${name}</span>
            ${rol === 'estudiante' ? `
            <div class="user-stats flex items-center gap-2 mt-1">
              <span class="badge primary text-xs">⭐ ${data.puntos ?? 0}</span>
              <span class="badge danger text-xs">❤️ ${data.energia ?? 5}</span>
              <span class="badge secondary text-xs">🔷 Nv.${data.nivel ?? 1}</span>
            </div>` : `<span class="text-muted text-sm">Docente</span>`}
          </div>
        </div>
        <button class="btn btn-outline btn-sm btn-logout" aria-label="Cerrar sesión">🚪 Salir</button>
      </div>
    </div>
  `;

  container.querySelector('.btn-logout')?.addEventListener('click', async () => {
    if (confirm('¿Cerrar sesión?')) {
      try {
        isDemo ? sessionStorage.removeItem('demoUser') : await signOut(auth);
        window.location.href = '/';
      } catch (e) { console.error('Logout:', e); }
    }
  });
}

function renderFallback(container, name) {
  container.innerHTML = `
    <div class="userbar-wrapper">
      <div class="userbar card flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--surface-hover);display:flex;align-items:center;justify-content:center">👤</div>
          <span class="font-medium">${name}</span>
        </div>
        <button class="btn btn-outline btn-sm btn-logout">🚪 Salir</button>
      </div>
    </div>
  `;
}

// Helper para actualizar stats sin recargar (útil para juegos/tareas)
export function updateUserBarStats(points, energy, level) {
  const pts = document.querySelector('.badge.primary');
  const eng = document.querySelector('.badge.danger');
  const lvl = document.querySelector('.badge.secondary');
  if (pts) pts.textContent = `⭐ ${points}`;
  if (eng) eng.textContent = `❤️ ${energy}`;
  if (lvl) lvl.textContent = `🔷 Nv.${level}`;
}