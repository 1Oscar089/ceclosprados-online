// =========================================================================
// public/js/userbar.js
// Componente de Barra de Usuario - Optimizado en Ancho y Altura
// =========================================================================

import { auth } from './initFirebase.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; 

const sanitizeHTML = (str) => str.replace(/[^a-zA-Z0-9-_.@ ]/g, ""); 

const getInitials = (name) => {
    if (!name) return "USR";
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('').substring(0, 3);
};

const injectStyles = () => {
    if (document.getElementById('userbar-cyber-styles')) return;
    const style = document.createElement('style');
    style.id = 'userbar-cyber-styles';
    style.textContent = `
        .cyber-userbar-wrapper {
            width: 100%;
            /* Margen superior de ~1cm (1rem) y laterales de ~2cm (2rem) */
            padding: 1rem 2rem 0 2rem;
            margin: 0 auto;
            position: relative;
            z-index: 999;
        }
        .cyber-userbar-container {
            width: 100%;
            background: var(--card-bg, rgba(255, 255, 255, 0.65));
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid var(--card-border, rgba(255, 255, 255, 0.6));
            /* Reducción de la altura (largo vertical) */
            padding: 0.5rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 20px;
            box-shadow: var(--shadow-premium, 0 15px 35px -10px rgba(0, 0, 0, 0.08));
            transition: background 0.3s, border-color 0.3s;
        }
        .cyber-user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 0;
        }
        .cyber-avatar {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: var(--primary-gradient, linear-gradient(135deg, #6366F1 0%, #4F46E5 100%));
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1rem;
            letter-spacing: 0.03em;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }
        .cyber-user-details {
            display: flex;
            flex-direction: column;
            min-width: 0;
            line-height: 1.2;
        }
        .cyber-username {
            font-size: 1rem;
            font-weight: 900;
            color: var(--text-main, #0F172A);
            letter-spacing: -0.02em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.3s;
        }
        .cyber-useremail {
            font-size: 0.8rem;
            color: var(--text-muted, #475569);
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.3s;
        }
        .cyber-actions-cluster {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-shrink: 0;
        }
        .cyber-theme-toggle {
            background: var(--input-bg, #F8FAFC);
            border: 1px solid var(--input-border, #CBD5E1);
            color: var(--text-main, #0F172A);
            width: 38px;
            height: 38px;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.15rem;
            transition: all 0.2s;
        }
        .cyber-theme-toggle:hover {
            transform: scale(1.05) rotate(15deg);
            border-color: var(--primary, #4F46E5);
            color: var(--primary, #4F46E5);
        }
        .cyber-logout-btn {
            background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
            color: #FFFFFF;
            border: none;
            padding: 0.55rem 1.2rem;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(244, 63, 94, 0.25);
            transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        }
        .cyber-logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(244, 63, 94, 0.45);
            filter: brightness(1.1);
        }
        .cyber-logout-btn:active { transform: translateY(0); }

        @media (max-width: 600px) {
            .cyber-userbar-wrapper { padding: 1rem 1rem 0 1rem; }
            .cyber-userbar-container { padding: 0.5rem 0.8rem; border-radius: 16px; }
            .cyber-user-info { gap: 0.6rem; }
            .cyber-useremail { display: none; }
            .cyber-avatar { width: 34px; height: 34px; font-size: 0.9rem; border-radius: 10px; }
            .cyber-username { font-size: 0.9rem; max-width: 120px; }
            .cyber-theme-toggle { width: 34px; height: 34px; font-size: 1rem; border-radius: 8px; }
            .cyber-logout-btn { padding: 0.5rem 0.9rem; font-size: 0.8rem; border-radius: 8px; }
        }
    `;
    document.head.appendChild(style);
};

const updateThemeIcon = (iconEl) => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    iconEl.className = currentTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
};

const setupThemeToggle = (btnEl, iconEl) => {
    btnEl.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme') || 'light';
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(iconEl);
    });
};

const handleLogout = () => {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = '/index.html';
    }).catch(() => {
        localStorage.clear();
        window.location.href = '/index.html';
    });
};

const renderHTML = (displayName, email, initials) => {
    return `
        <div class="cyber-userbar-container">
            <div class="cyber-user-info">
                <div class="cyber-avatar" aria-hidden="true">${initials}</div>
                <div class="cyber-user-details">
                    <span class="cyber-username">${displayName}</span>
                    <span class="cyber-useremail">${email}</span>
                </div>
            </div>
            <div class="cyber-actions-cluster">
                <button class="cyber-theme-toggle" id="cyber-theme-btn" aria-label="Cambiar modo de pantalla">
                    <i class='bx bx-moon' id="cyber-theme-icon"></i>
                </button>
                <button id="cyber-logout" class="cyber-logout-btn">Salir</button>
            </div>
        </div>
    `;
};

export const initUserBar = (rootElementId) => {
    const root = document.getElementById(rootElementId);
    if (!root) return;

    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    injectStyles();

    let wrapper = root.querySelector('.cyber-userbar-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'cyber-userbar-wrapper';
        root.appendChild(wrapper);
    }

    const cachedUser = localStorage.getItem('user_meta');
    if (cachedUser) {
        const cache = JSON.parse(cachedUser);
        const name = sanitizeHTML(cache.name || 'Estudiante');
        const email = sanitizeHTML(cache.email || '');
        const initials = getInitials(name);
        
        wrapper.innerHTML = renderHTML(name, email, initials);
        
        const btnTheme = wrapper.querySelector('#cyber-theme-btn');
        const iconTheme = wrapper.querySelector('#cyber-theme-icon');
        updateThemeIcon(iconTheme);
        setupThemeToggle(btnTheme, iconTheme);
        wrapper.querySelector('#cyber-logout').addEventListener('click', handleLogout);
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const name = sanitizeHTML(user.displayName || 'Estudiante');
            const email = sanitizeHTML(user.email || '');
            const initials = getInitials(name);
            
            wrapper.innerHTML = renderHTML(name, email, initials);
            
            const btnTheme = wrapper.querySelector('#cyber-theme-btn');
            const iconTheme = wrapper.querySelector('#cyber-theme-icon');
            updateThemeIcon(iconTheme);
            setupThemeToggle(btnTheme, iconTheme);
            wrapper.querySelector('#cyber-logout').addEventListener('click', handleLogout);
        } else {
            localStorage.clear();
            wrapper.innerHTML = '';
        }
    });
};