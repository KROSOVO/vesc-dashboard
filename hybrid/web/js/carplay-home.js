/* ============ CarPlay Home Screen Controller ============
 * Gère : rendu, pagination swipe, raccourcis sidebar, ouverture apps,
 * intégration VESC Dash, responsive scaling.
 */

import { on, emit } from './bus.js';
import { generateWallpaperSVG } from './carplay-wallpaper.js';
import { ICONS, SIDEBAR_SHORTCUTS } from './carplay-icons.js';

/* ---- Configuration apps page 1 (10 apps) ---- */
const PAGE_1_APPS = [
  'Téléphone', 'Musique', 'Plans', 'Messages', 'À l\'écoute',
  'Podcasts', 'Livres audio', 'Météo', 'Calendrier', 'Réglages'
];

/* ---- Apps supplémentaires pour pages 2-4 (vides pour l'instant) ---- */
const PAGE_APPS = [
  PAGE_1_APPS,
  [], // page 2
  [], // page 3
  [], // page 4
];

const NUM_PAGES = 4;

let el;
let currentPage = 0;
let touchStartX = 0;
let isDragging = false;
let scale = 1;

/* ---- Rendu HTML ---- */
function render() {
  if (!el) return;

  // Calcul du scale responsive
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  scale = Math.min(viewportW / 745, viewportH / 420);
  document.documentElement.style.setProperty('--cp-scale', scale.toFixed(4));

  // Structure principale
  el.innerHTML = `
    <div class="cp-home" id="cp-home">
      ${renderSidebar()}
      ${renderMain()}
    </div>
  `;

  // Injecter wallpaper
  const wallpaperContainer = el.querySelector('.cp-wallpaper-container');
  if (wallpaperContainer) {
    wallpaperContainer.innerHTML = generateWallpaperSVG();
  }

  bindEvents();
  updatePagination();
  updateSidebarShortcuts();
}

/* ---- Sidebar ---- */
function renderSidebar() {
  return `
    <aside class="cp-sidebar" role="navigation" aria-label="Raccourcis CarPlay">
      <div class="cp-sidebar-time" id="cp-time">--:--</div>
      <div class="cp-sidebar-indicators">
        <div class="cp-signal-group" aria-label="Signal réseau">
          <div class="cp-signal-bar"></div>
          <div class="cp-signal-bar"></div>
          <div class="cp-signal-bar"></div>
          <div class="cp-signal-bar"></div>
        </div>
        <span class="cp-network-label">4G</span>
      </div>
      <div class="cp-sidebar-shortcuts" id="cp-shortcuts">
        ${SIDEBAR_SHORTCUTS.map((name, i) => `
          <button class="cp-shortcut" data-shortcut="${name}" data-index="${i}" aria-label="${name}">
            ${ICONS[name] ? ICONS[name](28) : ''}
          </button>
        `).join('')}
      </div>
      <button class="cp-home-btn" id="cp-home-btn" aria-label="Accueil">
        <svg viewBox="0 0 24 24"><path d="M10,20V10H6V8h8V6h4v2h8v10h-4v2h-8v-2H6v2h4zM10,4h4v4h-4V4z"/></svg>
      </button>
    </aside>
  `;
}

/* ---- Zone principale ---- */
function renderMain() {
  const pagesHtml = PAGE_APPS.map((apps, pageIndex) => `
    <div class="cp-page" data-page="${pageIndex}" style="transform: translateX(${pageIndex * 100}%);">
      <div class="cp-wallpaper-container"></div>
      <div class="cp-app-grid" role="list" aria-label="Applications page ${pageIndex + 1}">
        ${apps.map(name => `
          <button class="cp-app" data-app="${name}" role="listitem" aria-label="${name}">
            ${ICONS[name] ? ICONS[name]() : '<div class="cp-app-icon" style="background:#333;"></div>'}
            <span class="cp-app-label">${name}</span>
          </button>
        `).join('')}
      </div>
      <div class="cp-pagination" id="cp-pagination">
        ${Array.from({ length: NUM_PAGES }, (_, i) => `
          <button class="cp-pagination-dot ${i === 0 ? 'active' : ''}" data-page="${i}" aria-label="Page ${i + 1}"></button>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <main class="cp-main">
      <div class="cp-pages-container" id="cp-pages">${pagesHtml}</div>
    </main>
  `;
}

/* ---- Événements ---- */
function bindEvents() {
  const homeEl = el.querySelector('#cp-home');
  const pagesContainer = el.querySelector('#cp-pages');
  const paginationDots = el.querySelectorAll('.cp-pagination-dot');
  const shortcuts = el.querySelectorAll('.cp-shortcut');
  const appButtons = el.querySelectorAll('.cp-app');
  const homeBtn = el.querySelector('#cp-home-btn');

  // Heure dynamique
  updateTime();
  setInterval(updateTime, 1000);

  // Swipe horizontal (touch + mouse)
  let startX = 0;
  let currentTranslate = 0;

  const onStart = (e) => {
    const touch = e.touches?.[0] || e;
    startX = touch.clientX;
    isDragging = true;
    pagesContainer.style.transition = 'none';
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches?.[0] || e;
    const deltaX = touch.clientX - startX;
    const maxDrag = pagesContainer.clientWidth * 0.3;
    const constrainedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaX));
    currentTranslate = -currentPage * 100 + (constrainedDelta / pagesContainer.clientWidth) * 100;
    pagesContainer.style.transform = `translateX(${currentTranslate}%)`;
    e.preventDefault();
  };

  const onEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    pagesContainer.style.transition = `transform var(--cp-swipe-duration) cubic-bezier(.25, .46, .45, .94)`;

    const touch = e.changedTouches?.[0] || e;
    const deltaX = touch.clientX - startX;
    const threshold = pagesContainer.clientWidth * 0.15;

    if (deltaX < -threshold && currentPage < NUM_PAGES - 1) {
      goToPage(currentPage + 1);
    } else if (deltaX > threshold && currentPage > 0) {
      goToPage(currentPage - 1);
    } else {
      goToPage(currentPage); // snap back
    }
  };

  pagesContainer.addEventListener('touchstart', onStart, { passive: false });
  pagesContainer.addEventListener('touchmove', onMove, { passive: false });
  pagesContainer.addEventListener('touchend', onEnd);
  pagesContainer.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  // Pagination dots
  paginationDots.forEach(dot => {
    dot.addEventListener('click', () => goToPage(parseInt(dot.dataset.page, 10)));
  });

  // Raccourcis sidebar
  shortcuts.forEach(btn => {
    btn.addEventListener('click', () => openApp(btn.dataset.shortcut));
  });

  // Apps grille
  appButtons.forEach(btn => {
    btn.addEventListener('click', () => openApp(btn.dataset.app));
  });

  // Home button
  homeBtn?.addEventListener('click', () => goToPage(0));

  // Resize
  window.addEventListener('resize', debounce(render, 100));
}

/* ---- Navigation pages ---- */
function goToPage(page) {
  currentPage = Math.max(0, Math.min(NUM_PAGES - 1, page));
  const pagesContainer = el.querySelector('#cp-pages');
  if (pagesContainer) {
    pagesContainer.style.transform = `translateX(-${currentPage * 100}%)`;
  }
  updatePagination();
}

function updatePagination() {
  el.querySelectorAll('.cp-pagination-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentPage);
  });
}

/* ---- Sidebar shortcuts état actif ---- */
function updateSidebarShortcuts() {
  // Pour l'instant, aucun raccourci n'est "actif" en permanence
  // On pourrait marquer celui de la page actuelle si pertinent
}

/* ---- Ouverture application ---- */
function openApp(appName) {
  const appEl = el.querySelector(`.cp-app[data-app="${appName}"]`);
  if (appEl) {
    appEl.classList.add('cp-app-opening');
    appEl.classList.remove('cp-app-closing');
    setTimeout(() => {
      appEl.classList.remove('cp-app-opening');
      emit('carplay:openApp', { app: appName });
    }, 350);
  } else {
    // App non sur la page actuelle -> naviguer vers la page 1 (accueil)
    goToPage(0);
    setTimeout(() => openApp(appName), 300);
  }
}

/* ---- Heure ---- */
function updateTime() {
  const timeEl = el.querySelector('#cp-time');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}

/* ---- Debounce ---- */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ---- API publique ---- */
export const CarPlayHome = {
  mount(root) {
    el = root;
    render();
  },
  unmount() {
    el = null;
  },
  goToPage,
  openApp,
  get currentPage() { return currentPage; },
};