/* Écran Accueil — CarPlay Standard : vitesse, batterie, média, nav. */

import { on } from '../bus.js';
import { Settings } from '../settings-store.js';

let el;
let offTelemetry;
let offSettings;
let units = 'kmh';

function html() {
  return `
    <div class="cp-main-grid">
      <section class="cp-card zone-speed speed-card">
        <div class="cp-card-inner">
          <div class="cp-section-title">Vitesse <span>·</span> VESC</div>
          <div class="cp-ring-wrap">
            <div class="cp-ring speed-ring">
              <svg viewBox="0 0 200 200">
                <circle class="cp-ring-track" cx="100" cy="100" r="90" />
                <circle class="cp-ring-progress" id="dash-ring" cx="100" cy="100" r="90"
                        stroke-dasharray="${(2 * Math.PI * 90).toFixed(1)}" stroke-dashoffset="0" />
              </svg>
              <text class="cp-ring-value" x="100" y="100" id="dash-speed">0</text>
              <text class="cp-ring-sub" x="100" y="128" id="dash-unit">km/h</text>
            </div>
          </div>
          <div class="speed-details">
            <div class="speed-detail">
              <div class="val" id="dash-power">0</div>
              <div class="lbl">W</div>
            </div>
            <div class="speed-detail">
              <div class="val" id="dash-current">0</div>
              <div class="lbl">A</div>
            </div>
            <div class="speed-detail">
              <div class="val" id="dash-voltage">0</div>
              <div class="lbl">V</div>
            </div>
          </div>
        </div>
      </section>

      <section class="cp-card zone-media media-card">
        <div class="cp-card-inner">
          <div class="cp-section-title">Média <span>·</span> iPhone</div>
          <div class="media-artwork" id="media-art">
            <svg class="placeholder" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="media-info">
            <div class="media-title" id="media-title">—</div>
            <div class="media-artist" id="media-artist">Connectez l'iPhone</div>
          </div>
          <div class="media-controls">
            <button class="media-btn" id="media-prev"><svg viewBox="0 0 24 24"><path d="M19 5v14H17V5h2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V5h4v6z"/></svg></button>
            <button class="media-btn play" id="media-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
            <button class="media-btn" id="media-next"><svg viewBox="0 0 24 24"><path d="M5 5v14h2V5H5zm14 14H13v-2h6v2zm0-4H13v-2h6v2zm0-4H13V5h6v6z"/></svg></button>
          </div>
        </div>
      </section>

      <section class="cp-card zone-battery battery-card">
        <div class="cp-card-inner">
          <div class="cp-section-title">Batterie <span>·</span> Pack</div>
          <div class="cp-ring-wrap battery-ring">
            <div class="cp-ring">
              <svg viewBox="0 0 160 160">
                <circle class="cp-ring-track" cx="80" cy="80" r="70" />
                <circle class="cp-ring-progress" id="batt-ring" cx="80" cy="80" r="70"
                        stroke-dasharray="${(2 * Math.PI * 70).toFixed(1)}" stroke-dashoffset="0" />
              </svg>
              <text class="cp-ring-value" x="80" y="78" id="batt-pct">—</text>
              <text class="cp-ring-sub" x="80" y="106">%</text>
            </div>
          </div>
          <div class="battery-stats">
            <div class="battery-stat"><div class="val" id="batt-volt">—</div><div class="lbl">Volts</div></div>
            <div class="battery-stat"><div class="val" id="batt-range">—</div><div class="lbl">km</div></div>
            <div class="battery-stat"><div class="val" id="batt-temp">—</div><div class="lbl">°C</div></div>
          </div>
        </div>
      </section>

      <section class="cp-card zone-nav nav-card">
        <div class="cp-card-inner" style="height:100%;padding:0;">
          <div class="nav-map" id="nav-map">
            <svg viewBox="0 0 360 360" preserveAspectRatio="none">
              <g class="nav-grid">
                ${gridLines(360, 40)}
              </g>
              <circle class="nav-route" cx="180" cy="180" r="110" />
              <circle class="nav-pos" id="nav-pos" cx="180" cy="70" r="9" />
              <polyline class="nav-trail" id="nav-trail" points="" />
            </svg>
            <div class="nav-next">
              <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
              <div class="nav-next-info">
                <div class="nav-next-type" id="nav-next-type">—</div>
                <div class="nav-next-dist" id="nav-next-dist">—</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>`;
}

function gridLines(size, step) {
  let out = '';
  for (let x = 0; x <= size; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${size}"/>`;
  for (let y = 0; y <= size; y += step) out += `<line x1="0" y1="${y}" x2="${size}" y2="${y}"/>`;
  return out;
}

function setRing(ringId, pct, colorClass) {
  const ring = el.querySelector(`#${ringId}`);
  if (!ring) return;
  const circumference = parseFloat(ring.getAttribute('stroke-dasharray'));
  ring.style.strokeDashoffset = String(circumference * (1 - pct / 100));
  ring.classList.toggle('warn', colorClass === 'warn');
  ring.classList.toggle('crit', colorClass === 'crit');
}

function update(t) {
  if (!el) return;

  const kmh = t.speed;
  const disp = units === 'mph' ? kmh / 1.609 : kmh;
  const speedPct = Math.min(100, (disp / 120) * 100); // max 120 km/h pour l'anneau

  el.querySelector('#dash-speed').textContent = Math.round(disp);
  el.querySelector('#dash-unit').textContent = units === 'mph' ? 'mph' : 'km/h';
  el.querySelector('#dash-power').textContent = Math.round(kmh * t.current * 2.2).toLocaleString('fr-FR');
  el.querySelector('#dash-current').textContent = t.current.toFixed(1);
  el.querySelector('#dash-voltage').textContent = t.voltage.toFixed(1);

  setRing('dash-ring', speedPct, speedPct > 85 ? 'warn' : '');

  const battPct = t.battery;
  setRing('batt-ring', battPct, battPct <= 15 ? 'crit' : battPct <= 30 ? 'warn' : '');
  el.querySelector('#batt-pct').textContent = Math.round(battPct);
  el.querySelector('#batt-volt').textContent = t.voltage.toFixed(1);
  el.querySelector('#batt-range').textContent = Math.round(battPct / 100 * 46);
  el.querySelector('#batt-temp').textContent = Math.round(t.tempEsc);
}

export const dashScreen = {
  id: 'dash',
  label: 'Accueil',
  icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;
    units = Settings.all.units;
    offSettings = on('settings:changed', (s) => { units = s.units; });
    offTelemetry = on('vesc.telemetry', update);
    this._off = () => { offTelemetry(); offSettings(); };
  },
  unmount() { this._off?.(); },
};