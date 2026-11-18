/* Écran Diagnostic — outils de mesure exigés par le brief §7 :
 * FPS, latence du pont, infos système, mémoire, journal. */

import { on } from '../bus.js';
import { Bridge } from '../bridge.js';

let el;
let offs = [];
let t0 = Date.now();
let fpsSamples = [];
let msgCount = 0;

function fmtUptime() {
  const s = Math.floor((Date.now() - t0) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h} h ${String(m).padStart(2, '0')} min`;
}

function html() {
  return `
    <div class="screen-title">Diagnostic</div>
    <div class="diag-grid">
      <div class="diag-tile fps">
        <span class="label">FPS</span>
        <span class="value" id="diag-fps">—<small>fps</small></span>
        <span class="sub" id="diag-fps-avg">moyenne —</span>
      </div>
      <div class="diag-tile latency">
        <span class="label">Latence pont JS↔Kotlin</span>
        <span class="value" id="diag-rtt">—<small>ms</small></span>
        <span class="sub" id="diag-rtt-mode">conteneur ${Bridge.native ? 'natif' : 'navigateur (simulé)'}</span>
      </div>
      <div class="diag-tile system">
        <span class="label">Système</span>
        <span class="value" id="diag-sys">—</span>
        <span class="sub" id="diag-sys-sub">via getSystemInfo</span>
      </div>
      <div class="diag-tile screen">
        <span class="label">Affichage</span>
        <span class="value" id="diag-screen">—</span>
        <span class="sub" id="diag-dpr">dpr —</span>
      </div>
      <div class="diag-tile mem">
        <span class="label">Mémoire JS</span>
        <span class="value" id="diag-mem">—<small>Mo</small></span>
        <span class="sub">${performance.memory ? 'performance.memory' : 'API non exposée'}</span>
      </div>
      <div class="diag-tile uptime">
        <span class="label">Uptime interface</span>
        <span class="value" id="diag-uptime">—</span>
        <span class="sub" id="diag-msgs">0 messages télémétrie</span>
      </div>
      <div class="diag-log" id="diag-log">
        <div class="placeholder">— journal du pont —</div>
      </div>
    </div>`;
}

function log(line, cls = '') {
  const box = el?.querySelector('#diag-log');
  if (!box) return;
  if (box.querySelector('.placeholder')) box.innerHTML = '';
  const div = document.createElement('div');
  div.className = `line ${cls}`;
  const time = new Date().toLocaleTimeString('fr-FR');
  div.innerHTML = `<b>${time}</b> ${line}`;
  box.prepend(div);
  while (box.children.length > 50) box.lastChild.remove();
}

async function measureRtt() {
  const res = await Bridge.ping();
  const shown = Number.isFinite(res.rtt) ? res.rtt.toFixed(1) : 'timeout';
  el.querySelector('#diag-rtt').innerHTML = `${shown}<small>ms</small>`;
  el.querySelector('#diag-rtt-mode').textContent = res.simulated
    ? 'conteneur navigateur (simulé)' : 'pont natif réel';
  log(`ping/pong : ${shown} ms ${res.simulated ? '(simulé)' : '(natif)'}`);
}

export const diagnosticScreen = {
  id: 'diagnostic',
  label: 'Diagnostic',
  icon: '<svg viewBox="0 0 24 24"><path d="M3.5 12h4l2.5-6 4 12 2.5-6h4"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;
    t0 = Date.now();
    msgCount = 0;
    fpsSamples = [];

    offs.push(on('fps', (f) => {
      fpsSamples.push(f.fps);
      if (fpsSamples.length > 30) fpsSamples.shift();
      el.querySelector('#diag-fps').innerHTML = `${f.fps}<small>fps</small>`;
      const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
      el.querySelector('#diag-fps-avg').textContent = `moyenne ${avg.toFixed(1)}`;
    }));

    offs.push(on('vesc.telemetry', () => {
      msgCount++;
      const node = el?.querySelector('#diag-msgs');
      if (node) node.textContent = `${msgCount.toLocaleString('fr-FR')} messages télémétrie`;
    }));

    offs.push(on('native:systemInfo', (msg) => {
      const p = msg.payload;
      el.querySelector('#diag-sys').textContent = `${p.manufacturer} ${p.model}`;
      el.querySelector('#diag-sys-sub').textContent = `Android ${p.androidVersion} · API ${p.sdkInt}`;
    }));

    offs.push(on('bridge:mock-send', (m) => log(`mock → ${m.type}`)));
    offs.push(on('native:any', (m) => log(`Kotlin → JS : ${m.type}`)));

    const dpr = window.devicePixelRatio || 1;
    el.querySelector('#diag-screen').textContent = `${window.innerWidth}×${window.innerHeight}`;
    el.querySelector('#diag-dpr').textContent = `dpr ${dpr.toFixed(2)}`;

    if (performance.memory) {
      const mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      el.querySelector('#diag-mem').innerHTML = `${mb}<small>Mo</small>`;
    }

    Bridge.send('getSystemInfo');
    measureRtt();
    this._rttTimer = setInterval(measureRtt, 3000);
    this._uptimeTimer = setInterval(() => {
      const node = el?.querySelector('#diag-uptime');
      if (node) node.textContent = fmtUptime();
    }, 1000);

    this._off = () => { offs.forEach(off => off()); offs = []; };
  },
  unmount() {
    clearInterval(this._rttTimer);
    clearInterval(this._uptimeTimer);
    this._off?.();
    el = null;
  },
};
