// Exporta/importa tudo o que o leitor guarda no navegador (configurações, favoritos, histórico).
import { favoritesStore, historyStore } from './library';
import { DEFAULTS, settingsStore } from './settings';

const RECENT_KEY = 'docfiles:recent-searches';
const FORMAT = 'docfiles-backup';

const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) ?? []; } catch { return []; }
};

export function exportData() {
  const data = {
    format: FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settingsStore.get(),
    favorites: favoritesStore.get(),
    history: historyStore.get(),
    recentSearches: readRecent(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `docfiles-backup-${new Date().toISOString().slice(0, 10)}.json`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lê um arquivo de backup. Lança erro com mensagem amigável se for inválido. */
export async function importData(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw new Error('O arquivo não é um JSON válido.'); }
  if (data?.format !== FORMAT) throw new Error('Este arquivo não é um backup do docfiles.');

  if (data.settings) settingsStore.set(data.settings);
  if (Array.isArray(data.favorites)) favoritesStore.set(data.favorites.filter((x) => typeof x === 'string'));
  if (Array.isArray(data.history)) historyStore.set(data.history.filter((x) => typeof x?.slug === 'string'));
  if (Array.isArray(data.recentSearches)) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(data.recentSearches.slice(0, 6))); } catch { /* ignore */ }
  }
}

export function clearData() {
  settingsStore.set(DEFAULTS);
  favoritesStore.set([]);
  historyStore.set([]);
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}
