/* Couche communication Android (Phase 2).
 *
 * JS → Kotlin : AndroidBridge.send(JSON.stringify(msg))
 * Kotlin → JS : window.__nativeEvent(msgObject)
 *
 * Sans conteneur natif (test navigateur), les envois sont journalisés en
 * événement 'bridge:mock-send' et le ping est simulé — aucun crash. */

import { emit, on } from './bus.js';

const native = typeof window !== 'undefined' && typeof window.AndroidBridge !== 'undefined';

let pendingPing = null;

function dispatchNative(msg) {
  emit('native:' + msg.type, msg);
  emit('native:any', msg);
}

if (native) {
  window.__nativeEvent = (raw) => {
    try {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      dispatchNative(msg);
    } catch (err) {
      console.error('[bridge] __nativeEvent: payload invalide', err);
    }
  };
  on('native:pong', (msg) => {
    if (pendingPing) {
      pendingPing({ rtt: performance.now() - msg.payload.t0, simulated: false });
      pendingPing = null;
    }
  });
}

function pack(type, payload) {
  return JSON.stringify({ type, timestamp: Date.now(), payload });
}

export const Bridge = {
  native,

  send(type, payload = {}) {
    if (native) {
      window.AndroidBridge.send(pack(type, payload));
    } else {
      emit('bridge:mock-send', { type, timestamp: Date.now(), payload });
    }
  },

  /** Mesure la latence du pont (RTT). Résout {rtt, simulated}. */
  ping() {
    return new Promise((resolve) => {
      if (native) {
        const t0 = performance.now();
        pendingPing = resolve;
        window.AndroidBridge.send(pack('ping', { t0 }));
        setTimeout(() => {
          if (pendingPing) { pendingPing({ rtt: NaN, simulated: false, timeout: true }); pendingPing = null; }
        }, 2000);
      } else {
        setTimeout(() => resolve({ rtt: 0.2 + Math.random() * 0.5, simulated: true }), 15);
      }
    });
  },
};
