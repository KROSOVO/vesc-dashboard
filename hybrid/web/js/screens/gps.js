/* Écran Navigation — carte SVG simulée + trajectoire fictive cohérente avec le mock.
 * Une vraie carte (Leaflet, comme la PWA) arrive en Phase 6. */

import { on } from '../bus.js';

let el;
let offGps;
let trail = [];

const VIEW = { w: 1000, h: 600 };
const CENTER = { x: VIEW.w / 2, y: VIEW.h / 2 };
const PX_PER_DEG_LAT = 90000;   // échelle locale suffisante pour la démo
const PX_PER_DEG_LON = 90000;

function project(lat, lon) {
  return {
    x: CENTER.x + (lon - 2.3522) * PX_PER_DEG_LON,
    y: CENTER.y - (lat - 48.8566) * PX_PER_DEG_LAT,
  };
}

function html() {
  const R = (0.133 * PX_PER_DEG_LAT).toFixed(0); // rayon du cercle de démo en px
  return `
    <div class="screen-title">Navigation · <b>GPS</b></div>
    <div class="gps-grid">
      <div class="map-wrap">
        <svg viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid slice">
          <g class="map-grid">
            ${gridLines()}
          </g>
          <circle class="map-route" cx="${CENTER.x}" cy="${CENTER.y}" r="${R}"/>
          <circle class="map-route-dash" cx="${CENTER.x}" cy="${CENTER.y}" r="${R}"/>
          <polyline class="map-trail" id="gps-trail" points=""/>
          <circle class="map-pos" cx="${CENTER.x}" cy="${CENTER.y}" r="26" opacity="0"/>
          <g id="gps-marker" class="map-marker">
            <path d="M0,-11 L8,9 L0,4 L-8,9 Z"/>
          </g>
        </svg>
        <span class="map-badge">carte simulée · phase 3</span>
      </div>
      <aside class="gps-aside">
        <div class="gps-row"><span class="label">Latitude</span><span class="value" id="gps-lat">—</span></div>
        <div class="gps-row"><span class="label">Longitude</span><span class="value" id="gps-lon">—</span></div>
        <div class="gps-row"><span class="label">Vitesse / cap</span><span class="value" id="gps-speed">—</span></div>
        <div class="gps-row"><span class="label">Précision</span><span class="value" id="gps-acc">—</span></div>
        <p class="gps-note">Phase 4 : position réelle via l'écran (Geolocation) puis relais iPhone.
        La carte Leaflet de la PWA sera réutilisée en Phase 6.</p>
      </aside>
    </div>`;
}

function gridLines() {
  let out = '';
  for (let x = 0; x <= VIEW.w; x += 80) out += `<line x1="${x}" y1="0" x2="${x}" y2="${VIEW.h}"/>`;
  for (let y = 0; y <= VIEW.h; y += 80) out += `<line x1="0" y1="${y}" x2="${VIEW.w}" y2="${y}"/>`;
  return out;
}

function update(p) {
  if (!el) return;
  const { x, y } = project(p.lat, p.lon);
  const marker = el.querySelector('#gps-marker');
  if (marker) marker.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${p.heading})`);

  trail.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  if (trail.length > 400) trail.shift();
  const pl = el.querySelector('#gps-trail');
  if (pl) pl.setAttribute('points', trail.join(' '));

  el.querySelector('#gps-lat').textContent = p.lat.toFixed(5);
  el.querySelector('#gps-lon').textContent = p.lon.toFixed(5);
  el.querySelector('#gps-speed').innerHTML = `${Math.round(p.speed)}<small>km/h</small> · ${p.heading}°`;
  el.querySelector('#gps-acc').innerHTML = `${p.accuracy}<small> m</small>`;
}

export const gpsScreen = {
  id: 'gps',
  label: 'Navigation',
  icon: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;
    trail = [];
    offGps = on('gps.position', update);
    this._off = () => { offGps(); };
  },
  unmount() { this._off?.(); el = null; },
};
