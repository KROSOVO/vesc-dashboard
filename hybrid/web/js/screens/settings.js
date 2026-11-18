/* Écran Paramètres — réglages persistés, appliqués immédiatement. */

import { Settings } from '../settings-store.js';
import { Bridge } from '../bridge.js';

let el;

function html() {
  const s = Settings.all;
  return `
    <div class="screen-title">Paramètres</div>
    <div class="settings-grid">
      <div class="setting-row">
        <div class="info"><div class="name">Unités</div><div class="desc">vitesse et distance</div></div>
        <div class="seg" id="seg-units">
          <button data-v="kmh" class="${s.units === 'kmh' ? 'on' : ''}">km/h</button>
          <button data-v="mph" class="${s.units === 'mph' ? 'on' : ''}">mph</button>
        </div>
      </div>
      <div class="setting-row">
        <div class="info"><div class="name">Fréquence données fictives</div><div class="desc">télémétrie simulée</div></div>
        <div class="seg" id="seg-hz">
          ${[5, 10, 20].map(h => `<button data-v="${h}" class="${Number(s.mockHz) === h ? 'on' : ''}">${h} Hz</button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div class="info"><div class="name">Animations</div><div class="desc">transitions d'écran</div></div>
        <div class="toggle ${s.animations ? 'on' : ''}" id="tgl-anim" role="switch" aria-checked="${s.animations}"></div>
      </div>
      <div class="setting-row">
        <div class="info"><div class="name">Retour haptique</div><div class="desc">vibration à la navigation (natif)</div></div>
        <div class="toggle on" id="tgl-haptic" role="switch" aria-checked="true"></div>
      </div>
      <div class="settings-footer">
        <button class="btn" id="btn-reset">Réinitialiser</button>
      </div>
    </div>`;
}

function bindSeg(sel, key, transform) {
  el.querySelector(sel).addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    el.querySelectorAll(`${sel} button`).forEach(b => b.classList.toggle('on', b === btn));
    Settings.update({ [key]: transform ? transform(btn.dataset.v) : btn.dataset.v });
  });
}

export const settingsScreen = {
  id: 'settings',
  label: 'Paramètres',
  icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>',
  mount(root) {
    root.innerHTML = html();
    el = root;

    bindSeg('#seg-units', 'units');
    bindSeg('#seg-hz', 'mockHz', v => Number(v));

    el.querySelector('#tgl-anim').addEventListener('click', (e) => {
      const on = !e.currentTarget.classList.contains('on');
      e.currentTarget.classList.toggle('on', on);
      e.currentTarget.setAttribute('aria-checked', String(on));
      Settings.update({ animations: on });
    });

    el.querySelector('#tgl-haptic').addEventListener('click', (e) => {
      const on = !e.currentTarget.classList.contains('on');
      e.currentTarget.classList.toggle('on', on);
      e.currentTarget.setAttribute('aria-checked', String(on));
      Bridge.send('haptic', { ms: 20 });
    });

    el.querySelector('#btn-reset').addEventListener('click', () => {
      Settings.reset();
      this.unmount();
      this.mount(root);
    });
  },
  unmount() { el = null; },
};
