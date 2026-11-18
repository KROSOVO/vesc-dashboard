/* Orchestrateur — dock, routage, horloge, FPS, capteur de lien, lancement du mock.
 * Un module par écran (js/screens/*), aucune référence croisée entre écrans. */

import { on, emit } from './bus.js';
import { Bridge } from './bridge.js';
import { Mock } from './mock-data.js';
import { Settings } from './settings-store.js';
import { dashScreen } from './screens/dash.js';
import { gpsScreen } from './screens/gps.js';
import { vehicleScreen } from './screens/vehicle.js';
import { iphoneScreen } from './screens/iphone.js';
import { settingsScreen } from './screens/settings.js';
import { diagnosticScreen } from './screens/diagnostic.js';

const SCREENS = [dashScreen, gpsScreen, vehicleScreen, iphoneScreen, settingsScreen, diagnosticScreen];

const stage = document.getElementById('stage');
const dock = document.getElementById('dock');
let activeId = null;
let haptic = true;

/* --- construction des écrans --- */
for (const s of SCREENS) {
  const section = document.createElement('section');
  section.className = 'screen';
  section.id = `screen-${s.id}`;
  stage.appendChild(section);
  s.mount(section);

  const btn = document.createElement('button');
  btn.className = 'dock-item';
  btn.dataset.screen = s.id;
  btn.innerHTML = `${s.icon}<span>${s.label}</span>`;
  btn.addEventListener('click', () => {
    show(s.id);
    if (haptic) Bridge.send('haptic', { ms: 15 });
  });
  dock.appendChild(btn);
}

function show(id) {
  if (id === activeId) return;
  activeId = id;
  for (const s of SCREENS) {
    const section = document.getElementById(`screen-${s.id}`);
    const isActive = s.id === id;
    section.classList.toggle('active', isActive);
  }
  dock.querySelectorAll('.dock-item').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  emit('screen:shown', { id });
}

/* --- horloge --- */
const clock = document.getElementById('sb-clock');
function tickClock() {
  clock.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
tickClock();
setInterval(tickClock, 1000);

/* --- FPS (rAF, moyenne par seconde) --- */
const fpsNode = document.getElementById('sb-fps');
let frames = 0;
let fpsLast = Date.now();
function rafLoop(now) {
  frames++;
  const nowMs = performance.now();
  if (nowMs - fpsLast >= 1000) {
    const fps = Math.round(frames * 1000 / (nowMs - fpsLast));
    frames = 0;
    fpsLast = nowMs;
    fpsNode.textContent = `${fps} fps`;
    emit('fps', { fps });
  }
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

/* --- capteur fraîcheur VESC (statusbar) --- */
const chipVesc = document.getElementById('chip-vesc');
let lastTelemetryAt = 0;
on('vesc.telemetry', (t) => { lastTelemetryAt = t.at; });
setInterval(() => {
  const fresh = Date.now() - lastTelemetryAt < 1200;
  chipVesc.classList.toggle('chip-live', fresh);
  chipVesc.classList.toggle('chip-idle', !fresh);
  chipVesc.textContent = fresh ? 'VESC · flux fictif' : 'VESC · —';
}, 500);

/* --- capteur lien iPhone (statusbar) --- */
const chipLink = document.getElementById('chip-link');
on('link:state', (st) => {
  chipLink.classList.toggle('chip-ok', st.connected);
  chipLink.classList.toggle('chip-off', !st.connected);
  chipLink.textContent = st.connected ? 'iPhone · simulé' : 'iPhone · déconnecté';
});

/* --- settings → comportement global --- */
function applySettings(s) {
  document.body.classList.toggle('no-anim', !s.animations);
  haptic = s.animations; // simplification Phase 3 : lié aux animations
  Mock.start({ hz: s.mockHz });
}
on('settings:changed', applySettings);
applySettings(Settings.all);

/* --- démarrage --- */
show('dash');
Bridge.send('log', 'interface hybride démarrée (Phase 2-3)');
console.info('[vescdash] bridge natif :', Bridge.native ? 'actif' : 'absent → mode navigateur');
