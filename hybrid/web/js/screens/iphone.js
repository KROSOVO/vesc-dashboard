/* Écran Connexion iPhone — état du lien écran ↔ iPhone.
 * Phase 3 : simulation locale. Phase 4 : protocole JSON réel (Wi-Fi/TCP).
 * Phase 5 : app iOS compagnon (CoreBluetooth/CoreLocation). */

import { emit, on } from '../bus.js';

let el;
let connected = false;
let offMockLog;

const EXPECTED = [
  { t: 'gps.position', d: 'position iPhone (CoreLocation)' },
  { t: 'vesc.telemetry', d: 'télémétrie VESC relayée (CoreBluetooth)' },
  { t: 'link.state', d: 'état du lien / reconnexion' },
  { t: 'media.info', d: 'infos média autorisées (MPNowPlayingInfoCenter)' },
];

function html() {
  return `
    <div class="screen-title">Connexion · <b>iPhone</b></div>
    <div class="iphone-grid">
      <div class="link-card" id="link-card">
        <div class="link-state">
          <div class="link-orb">
            <svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.5 19h3"/></svg>
          </div>
          <div class="link-text">
            <div class="state" id="link-state">Déconnecté</div>
            <div class="detail" id="link-detail">Aucun iPhone appairé sur ce réseau. Les données affichées ailleurs sont fictives.</div>
          </div>
        </div>
        <div class="link-actions">
          <button class="btn primary" id="btn-simulate">Simuler une connexion</button>
        </div>
        <p class="phase-note">Démo Phase 3 : ce bouton ne fait que changer l'état local. Le vrai
        protocole JSON (Wi-Fi/TCP, reconnexion auto, authentification) est la Phase 4 ; l'app iOS
        compagnon est la Phase 5. Rien n'est simulé côté réseau réel.</p>
      </div>
      <div class="protocol-card">
        <h3>Messages attendus de l'iPhone</h3>
        <div class="msg-list">
          ${EXPECTED.map(m => `<div class="msg-item"><span class="t">${m.t}</span><span class="d">${m.d}</span></div>`).join('')}
        </div>
        <h3 style="margin-top:10px">Journal du lien (démo)</h3>
        <div class="diag-log" id="link-log"><div class="placeholder">— aucun événement —</div></div>
      </div>
    </div>`;
}

function setConnected(v) {
  connected = v;
  el.querySelector('#link-card').classList.toggle('connected', v);
  el.querySelector('#link-state').textContent = v ? 'Connecté (simulation)' : 'Déconnecté';
  el.querySelector('#link-detail').textContent = v
    ? 'Flux simulé : gps.position · vesc.telemetry relayés. Latence et perte non modélisées.'
    : 'Aucun iPhone appairé sur ce réseau. Les données affichées ailleurs sont fictives.';
  el.querySelector('#btn-simulate').textContent = v ? 'Simuler une déconnexion' : 'Simuler une connexion';
  emit('link:state', { connected: v, simulated: true });
}

function log(line, cls = '') {
  const box = el.querySelector('#link-log');
  if (box.querySelector('.placeholder')) box.innerHTML = '';
  const div = document.createElement('div');
  div.className = `line ${cls}`;
  const time = new Date().toLocaleTimeString('fr-FR');
  div.innerHTML = `<b>${time}</b> ${line}`;
  box.prepend(div);
  while (box.children.length > 40) box.lastChild.remove();
}

export const iphoneScreen = {
  id: 'iphone',
  label: 'iPhone',
  icon: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.5 19h3"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;
    setConnected(false);
    el.querySelector('#btn-simulate').addEventListener('click', () => {
      setConnected(!connected);
      log(connected ? 'lien simulé établi (démo)' : 'lien simulé coupé (démo)', connected ? '' : 'err');
    });
    offMockLog = on('bridge:mock-send', (m) => log(`envoi JS→Kotlin : ${m.type} (hors conteneur natif)`));
    this._off = () => { offMockLog?.(); };
  },
  unmount() { this._off?.(); el = null; },
};
