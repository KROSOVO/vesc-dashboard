/* ============ Orchestrateur principal — CarPlay Home + écrans VESC ============
 * Point d'entrée unique : monte l'écran d'accueil CarPlay (sidebar + grille + pagination)
 * Les apps VESC (Dashboard, GPS, Véhicule, iPhone, Paramètres, Diagnostic) sont
 * accessibles depuis la grille CarPlay et remplacent l'écran d'accueil quand ouvertes.
 */

import { on, emit } from './bus.js';
import { Bridge } from './bridge.js';
import { Mock } from './mock-data.js';
import { Settings } from './settings-store.js';
import { CarPlayHome } from './carplay-home.js';
import { dashScreen } from './screens/dash.js';
import { gpsScreen } from './screens/gps.js';
import { vehicleScreen } from './screens/vehicle.js';
import { iphoneScreen } from './screens/iphone.js';
import { settingsScreen } from './screens/settings.js';
import { diagnosticScreen } from './screens/diagnostic.js';

/* ---- Mapping apps CarPlay → écrans VESC ---- */
const VESC_APPS = {
  'VESC Dash': { screen: dashScreen, icon: 'Téléphone' },        // sur l'icône Téléphone
  'Navigation': { screen: gpsScreen, icon: 'Plans' },              // sur l'icône Plans
  'Véhicule': { screen: vehicleScreen, icon: 'Réglages' },         // sur l'icône Réglages
  'iPhone': { screen: iphoneScreen, icon: 'Musique' },             // sur l'icône Musique
  'Paramètres': { screen: settingsScreen, icon: 'Calendrier' },    // sur l'icône Calendrier
  'Diagnostic': { screen: diagnosticScreen, icon: 'Podcasts' },    // sur l'icône Podcasts
};

/* ---- Apps CarPlay natives (non-VESC) - placeholders ---- */
const NATIVE_APPS = ['Messages', 'À l\'écoute', 'Livres audio', 'Météo'];

const stage = document.getElementById('stage');
const dock = document.getElementById('dock');

let carplayMounted = false;
let currentVescScreen = null;

/* ---- Initialisation CarPlay Home ---- */
function initCarPlayHome() {
  // Nettoyer le stage
  stage.innerHTML = '';
  dock.innerHTML = '';

  // Monter CarPlay Home
  CarPlayHome.mount(stage);
  carplayMounted = true;

  // Écouter les ouvertures d'apps depuis CarPlay
  on('carplay:openApp', handleCarPlayOpenApp);

  // Démarrer le mock télémétrie
  applySettings(Settings.all);
  on('settings:changed', applySettings);

  Bridge.send('log', 'CarPlay Home + VESC apps démarré');
  console.info('[vescdash] CarPlay Home monté, bridge:', Bridge.native ? 'natif' : 'navigateur');
}

/* ---- Gestion ouverture app depuis CarPlay ---- */
function handleCarPlayOpenApp({ app }) {
  // Apps VESC natives
  if (VESC_APPS[app]) {
    openVescScreen(app);
    return;
  }

  // Apps CarPlay natives (placeholder pour l'instant)
  if (NATIVE_APPS.includes(app)) {
    Bridge.send('log', `App CarPlay native: ${app} (placeholder)`);
    // TODO: implémenter plus tard
    return;
  }

  Bridge.send('log', `App inconnue: ${app}`);
}

/* ---- Ouvre un écran VESC en plein écran (remplace CarPlay Home) ---- */
function openVescScreen(appName) {
  const { screen } = VESC_APPS[appName];
  if (!screen) return;

  // Démontage CarPlay Home
  CarPlayHome.unmount();
  carplayMounted = false;

  // Créer section pour l'écran VESC
  const section = document.createElement('section');
  section.className = 'screen vesc-screen active';
  section.id = `screen-${appName.toLowerCase().replace(/\s+/g, '-')}`;
  stage.appendChild(section);
  screen.mount(section);
  currentVescScreen = { name: appName, screen, section };

  // Bouton retour dans le dock (temporaire) ou gesture
  showBackButton(appName);

  emit('screen:shown', { id: appName, type: 'vesc' });
}

/* ---- Retour à CarPlay Home ---- */
function backToCarPlayHome() {
  if (currentVescScreen) {
    currentVescScreen.screen.unmount();
    currentVescScreen.section.remove();
    currentVescScreen = null;
  }

  // Remonter CarPlay Home
  initCarPlayHome();

  // Restaurer dock CarPlay (pas de dock pour les écrans VESC)
  dock.innerHTML = '';
}

/* ---- Bouton retour (overlay ou dock temporaire) ---- */
function showBackButton(appName) {
  dock.innerHTML = `
    <button class="dock-item cp-back-btn" aria-label="Retour CarPlay">
      <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Retour</span>
    </button>
    <span class="dock-title">${appName}</span>
  `;

  const backBtn = dock.querySelector('.cp-back-btn');
  backBtn?.addEventListener('click', backToCarPlayHome);

  // Style pour le bouton retour
  if (!document.getElementById('cp-back-style')) {
    const style = document.createElement('style');
    style.id = 'cp-back-style';
    style.textContent = `
      .cp-back-btn { color: var(--cp-blue); background: rgba(0,122,255,0.12); }
      .cp-back-btn:active { transform: scale(0.92); }
      .dock-title { flex: 1; text-align: center; font: 600 14px/1 var(--cp-font); color: var(--cp-white); }
    `;
    document.head.appendChild(style);
  }
}

/* ---- Settings globales ---- */
function applySettings(s) {
  document.body.classList.toggle('no-anim', !s.animations);
  Mock.start({ hz: s.mockHz });
}

/* ---- FPS (inchangé) ---- */
const fpsNode = document.getElementById('sb-fps');
let frames = 0, fpsLast = Date.now();
function rafLoop(now) {
  frames++;
  const nowMs = performance.now();
  if (nowMs - fpsLast >= 1000) {
    const fps = Math.round(frames * 1000 / (nowMs - fpsLast));
    frames = 0; fpsLast = nowMs;
    if (fpsNode) fpsNode.textContent = `${fps} fps`;
    emit('fps', { fps });
  }
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

/* ---- Horloge statusbar (inchangée) ---- */
const clock = document.getElementById('sb-clock');
function tickClock() {
  if (clock) clock.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
tickClock(); setInterval(tickClock, 1000);

/* ---- Capteurs statusbar (inchangés) ---- */
const chipVesc = document.getElementById('chip-vesc');
let lastTelemetryAt = 0;
on('vesc.telemetry', (t) => { lastTelemetryAt = t.at; });
setInterval(() => {
  const fresh = Date.now() - lastTelemetryAt < 1200;
  if (chipVesc) {
    chipVesc.classList.toggle('chip-live', fresh);
    chipVesc.classList.toggle('chip-idle', !fresh);
    chipVesc.textContent = fresh ? 'VESC · flux fictif' : 'VESC · —';
  }
}, 500);

const chipLink = document.getElementById('chip-link');
on('link:state', (st) => {
  if (chipLink) {
    chipLink.classList.toggle('chip-ok', st.connected);
    chipLink.classList.toggle('chip-off', !st.connected);
    chipLink.textContent = st.connected ? 'iPhone · simulé' : 'iPhone · déconnecté';
  }
});

/* ---- Démarrage ---- */
initCarPlayHome();