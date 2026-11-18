/* Écran Infos véhicule — fiche matériel + jauges live (fictives Phase 3). */

import { on } from '../bus.js';

let el;
let offTelemetry;

function html() {
  return `
    <div class="screen-title">Infos · <b>véhicule</b></div>
    <div class="vehicle-grid">
      <div class="vehicle-card">
        <div class="vehicle-name">KROSOVO One<small>vesc 6 mkvi · ble 115200</small></div>
        <div class="spec-list">
          <div class="spec"><span class="k">Contrôleur</span><span class="v">VESC 6 MkVI</span></div>
          <div class="spec"><span class="k">Moteur</span><span class="v">6374 · 190 KV</span></div>
          <div class="spec"><span class="k">Batterie</span><span class="v">12s4p · 48 V · 16 Ah</span></div>
          <div class="spec"><span class="k">Roue</span><span class="v">80 mm · 78 A</span></div>
          <div class="spec"><span class="k">Portée théo.</span><span class="v">≈ 46 km</span></div>
          <div class="spec"><span class="k">Lien capteurs</span><span class="v">BLE ffe0 / NUS</span></div>
        </div>
      </div>
      <div class="gauges">
        <div class="gauge"><span class="label">T. moteur</span><span class="value" id="veh-tmot">—<small>°C</small></span>
          <div class="gauge-bar"><i id="veh-tmot-bar" style="width:0%"></i></div></div>
        <div class="gauge"><span class="label">T. contrôleur</span><span class="value" id="veh-tesc">—<small>°C</small></span>
          <div class="gauge-bar"><i id="veh-tesc-bar" style="width:0%"></i></div></div>
        <div class="gauge span-2"><span class="label">Courant instantané</span><span class="value" id="veh-cur">—<small>A</small></span>
          <div class="gauge-bar"><i id="veh-cur-bar" style="width:0%"></i></div></div>
        <div class="gauge span-2"><span class="label">Tension pack</span><span class="value" id="veh-volt">—<small>V</small></span>
          <div class="gauge-bar"><i id="veh-volt-bar" style="width:0%"></i></div></div>
      </div>
    </div>`;
}

function gauge(sel, selBar, v, unit, max, warn, crit) {
  el.querySelector(sel).innerHTML = `${v}<small>${unit}</small>`;
  const bar = el.querySelector(selBar);
  bar.style.width = `${Math.min(100, (v / max) * 100)}%`;
  const box = bar.closest('.gauge');
  box.classList.toggle('warn', warn && !crit);
  box.classList.toggle('crit', crit);
}

function update(t) {
  if (!el) return;
  gauge('#veh-tmot', '#veh-tmot-bar', t.tempMotor.toFixed(1), '°C', 80, t.tempMotor >= 60, t.tempMotor >= 70);
  gauge('#veh-tesc', '#veh-tesc-bar', t.tempEsc.toFixed(1), '°C', 75, t.tempEsc >= 55, t.tempEsc >= 65);
  gauge('#veh-cur', '#veh-cur-bar', t.current.toFixed(1), 'A', 45, t.current >= 30, t.current >= 40);
  const soc = (t.voltage - 42) / 8.4;
  gauge('#veh-volt', '#veh-volt-bar', t.voltage.toFixed(2), 'V', 50.4, soc < .3, soc < .15);
}

export const vehicleScreen = {
  id: 'vehicle',
  label: 'Véhicule',
  icon: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2.5"/><path d="M8 10.5v3M12 10.5v3M16 10.5v3"/><path d="M7 17l-1.5 3M17 17l1.5 3"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;
    offTelemetry = on('vesc.telemetry', update);
    this._off = () => { offTelemetry(); };
  },
  unmount() { this._off?.(); el = null; },
};
