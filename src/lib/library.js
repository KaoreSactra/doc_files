import { docsBySlug } from './docs';
import { sfx } from './sfx';
import { createPersistentStore, createStore } from './store';

const asArray = (v) => (Array.isArray(v) ? v : []);

/* ---------- Histórico de leitura: [{ slug, at, progress }] ---------- */

export const historyStore = createPersistentStore('docfiles:history', [], asArray);

export function recordVisit(slug) {
  historyStore.set((h) => {
    const prev = h.find((x) => x.slug === slug);
    return [{ slug, at: Date.now(), progress: prev?.progress ?? 0 }, ...h.filter((x) => x.slug !== slug)].slice(0, 10);
  });
}

export function saveProgress(slug, progress) {
  historyStore.set((h) => h.map((x) => (x.slug === slug ? { ...x, progress } : x)));
}

export const savedProgress = (slug) => historyStore.get().find((x) => x.slug === slug)?.progress ?? 0;

/** Docs vistos recentemente que ainda existem. */
export const recentDocs = (history) =>
  history.filter((h) => docsBySlug.has(h.slug)).map((h) => ({ ...h, doc: docsBySlug.get(h.slug) }));

/* ---------- Favoritos: [slug] ---------- */

export const favoritesStore = createPersistentStore('docfiles:favorites', [], asArray);

export function toggleFavorite(slug) {
  const on = !favoritesStore.get().includes(slug);
  favoritesStore.set((f) => (on ? [...f, slug] : f.filter((x) => x !== slug)));
  return on;
}

export function favoriteWithToast(slug) {
  toast(toggleFavorite(slug) ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
}

export const favoriteDocs = (slugs) => slugs.map((s) => docsBySlug.get(s)).filter(Boolean);

/* ---------- Avisos rápidos ---------- */

export const toastStore = createStore(null);
let toastTimer;

export function toast(message) {
  clearTimeout(toastTimer);
  toastStore.set({ message, id: Date.now() });
  sfx.notify();
  toastTimer = setTimeout(() => toastStore.set(null), 2200);
}

export async function copyText(text, message = 'Copiado') {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast('Não foi possível copiar');
  }
}

export const MOD_KEY = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
