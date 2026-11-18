/* Bus d'événements interne — séparation stricte : les modules ne se connaissent
 * pas entre eux, ils échangent uniquement des messages typés {type, timestamp, payload}. */

const Bus = new EventTarget();

export function emit(type, detail = {}) {
  Bus.dispatchEvent(new CustomEvent(type, { detail }));
}

export function on(type, fn) {
  const handler = (e) => fn(e.detail);
  Bus.addEventListener(type, handler);
  return () => Bus.removeEventListener(type, handler);
}
