/* Données fictives (Phases 2-3) : télémétrie VESC + GPS simulés.
 * Remplacées en Phase 4 par les vraies sources (VESC BLE / lien iPhone)
 * sans toucher aux écrans : mêmes types de messages, même bus. */

import { emit } from './bus.js';

/* --- état télémétrie --- */
const state = {
  speed: 0,          // km/h
  battery: 87.4,     // %
  voltage: 49.2,     // V
  current: 0,        // A
  tempMotor: 24.5,   // °C
  tempEsc: 26.1,     // °C
  distance: 12.4,    // km
  erpm: 0,
};

/* --- état GPS : trajectoire circulaire cohérente avec la carte SVG --- */
const GPS_CENTER = { lat: 48.8566, lon: 2.3522 };
const GPS_RADIUS_KM = 0.133;
const KM_PER_DEG_LAT = 111.0;
const KM_PER_DEG_LON = 111.0 * Math.cos(GPS_CENTER.lat * Math.PI / 180);
let gpsAngle = 0; // radians, 0 = nord

let timer = null;
let hz = 10;
let tick = 0;
let targetSpeed = 0;
let nextTargetAt = 0;

const TARGETS = [0, 0, 14, 22, 30, 34, 26, 0, 18];

function pickTarget() {
  targetSpeed = TARGETS[Math.floor(Math.random() * TARGETS.length)];
  nextTargetAt = tick + Math.floor(hz * (4 + Math.random() * 5));
}

function stepVesc(dt) {
  if (tick >= nextTargetAt) pickTarget();

  const err = targetSpeed - state.speed;
  state.speed = clamp(state.speed + err * 0.06 + (Math.random() - 0.5) * 0.4, 0, 45);
  state.speed = round1(state.speed);

  const accel = err > 0 ? err * 0.9 : 0;
  state.current = round1(clamp(accel * 2.2 + (Math.random() - 0.5) * 1.5, 0, 42));
  state.erpm = Math.round(state.speed * 190);
  state.voltage = round1(42 + (state.battery / 100) * 8.4 - state.current * 0.02);

  if (state.speed > 0.2) {
    state.distance = round2(state.distance + state.speed * dt / 3600);
    state.battery = Math.max(4, round2(state.battery - 0.0012 * state.current - 0.0004));
  }

  state.tempMotor = round1(clamp(state.tempMotor + state.current * 0.006 - 0.012, 20, 72));
  state.tempEsc = round1(clamp(state.tempEsc + state.current * 0.0035 - 0.01, 20, 65));
}

function stepGps(dt) {
  const vKmS = state.speed / 3600;
  const omega = vKmS / GPS_RADIUS_KM; // rad/s
  gpsAngle = (gpsAngle + omega * dt) % (Math.PI * 2);
  const lat = GPS_CENTER.lat + (GPS_RADIUS_KM * Math.cos(gpsAngle)) / KM_PER_DEG_LAT;
  const lon = GPS_CENTER.lon + (GPS_RADIUS_KM * Math.sin(gpsAngle)) / KM_PER_DEG_LON;
  emit('gps.position', {
    lat: round6(lat),
    lon: round6(lon),
    speed: state.speed,
    heading: Math.round(((gpsAngle * 180) / Math.PI + 360) % 360),
    accuracy: round1(2.5 + Math.random() * 2),
    at: Date.now(),
  });
}

function tickOnce() {
  tick++;
  const dt = 1 / hz;
  stepVesc(dt);
  stepGps(dt);
  emit('vesc.telemetry', { ...state, at: Date.now() });
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function round1(v) { return Math.round(v * 10) / 10; }
function round2(v) { return Math.round(v * 100) / 100; }
function round6(v) { return Math.round(v * 1e6) / 1e6; }

export const Mock = {
  start(opts = {}) {
    this.stop();
    hz = opts.hz ?? 10;
    tick = 0;
    pickTarget();
    timer = setInterval(tickOnce, 1000 / hz);
    emit('mock:state', { running: true, hz });
  },
  stop() {
    if (timer) { clearInterval(timer); timer = null; }
    emit('mock:state', { running: false, hz });
  },
  get running() { return timer !== null; },
};
