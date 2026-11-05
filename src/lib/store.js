import { useSyncExternalStore } from 'react';

/** Store mínima (pub/sub) compatível com useSyncExternalStore. */
export function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? next(state) : next;
      listeners.forEach((l) => l(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Store salva no localStorage e sincronizada entre componentes e abas.
 * `normalize` valida/completa o valor lido (dados antigos ou corrompidos).
 */
export function createPersistentStore(key, initial, normalize = (v) => v) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      return normalize(raw === null ? initial : JSON.parse(raw));
    } catch {
      return normalize(initial);
    }
  };

  const store = createStore(read());
  const set = store.set;
  store.set = (next) => {
    set((prev) => normalize(typeof next === 'function' ? next(prev) : next));
    try { localStorage.setItem(key, JSON.stringify(store.get())); } catch { /* cota/privado */ }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === key) set(read());
  });
  return store;
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get);
}
