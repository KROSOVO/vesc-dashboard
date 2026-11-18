/* Réglages persistés (localStorage) — un seul endroit qui écrit. */

import { emit } from './bus.js';

const KEY = 'vescdash.settings.v1';
const DEFAULTS = {
  units: 'kmh',     // 'kmh' | 'mph'
  mockHz: 10,       // fréquence des données fictives
  animations: true,
};

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

let current = load();

export const Settings = {
  get all() { return { ...current }; },

  update(patch) {
    current = { ...current, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (_) { /* stockage indisponible */ }
    emit('settings:changed', { ...current });
  },

  reset() {
    current = { ...DEFAULTS };
    try { localStorage.removeItem(KEY); } catch (_) { /* stockage indisponible */ }
    emit('settings:changed', { ...current });
  },
};
