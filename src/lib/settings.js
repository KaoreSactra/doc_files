import { useSyncExternalStore } from 'react';
import { createPersistentStore, createStore, useStore } from './store';

export const THEMES = [
  { id: 'indigo', label: 'Índigo' },
  { id: 'ocean', label: 'Oceano' },
  { id: 'forest', label: 'Floresta' },
  { id: 'sepia', label: 'Sépia' },
  { id: 'rose', label: 'Rosa' },
  { id: 'graphite', label: 'Grafite' },
];

/** Tema secreto: só ativa segurando o botão de claro/escuro (não aparece nas configurações). Sempre escuro. */
export const SECRET_THEME = { id: 'cyber', label: 'Cyberpunk' };

/** Opções de cada configuração de escolha (o primeiro valor não é necessariamente o padrão). */
export const OPTIONS = {
  mode: [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
  ],
  theme: [...THEMES, SECRET_THEME].map((t) => ({ value: t.id, label: t.label })),
  lastTheme: THEMES.map((t) => ({ value: t.id, label: t.label })),
  fontSize: [
    { value: 'sm', label: 'Pequeno' },
    { value: 'md', label: 'Médio' },
    { value: 'lg', label: 'Grande' },
    { value: 'xl', label: 'Enorme' },
  ],
  fontFamily: [
    { value: 'sans', label: 'Sem serifa' },
    { value: 'serif', label: 'Serifada' },
    { value: 'mono', label: 'Mono' },
  ],
  lineHeight: [
    { value: 'compact', label: 'Compacto' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Amplo' },
  ],
  contentWidth: [
    { value: 'narrow', label: 'Estreita' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Larga' },
    { value: 'full', label: 'Total' },
  ],
};

export const DEFAULTS = {
  mode: 'system',
  theme: 'indigo',
  fontSize: 'md',
  fontFamily: 'sans',
  lineHeight: 'normal',
  contentWidth: 'normal',
  showToc: true,
  showProgress: true,
  rememberPosition: true,
  codeWrap: false,
  reduceMotion: false,
  focusMode: false,
  cyberSound: true,
  lastTheme: 'indigo',
};

function normalize(value) {
  const raw = value && typeof value === 'object' ? value : {};
  const out = {};
  for (const [key, def] of Object.entries(DEFAULTS)) {
    const v = raw[key];
    if (OPTIONS[key]) out[key] = OPTIONS[key].some((o) => o.value === v) ? v : def;
    else out[key] = typeof v === 'boolean' ? v : def;
  }
  return out;
}

/** Migra a chave antiga `docfiles:theme` ("light" | "dark"). */
function initial() {
  try {
    const old = JSON.parse(localStorage.getItem('docfiles:theme'));
    if (old === 'light' || old === 'dark') return { ...DEFAULTS, mode: old };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export const settingsStore = createPersistentStore('docfiles:settings', initial(), normalize);

export const useSettings = () => useStore(settingsStore);
export const updateSettings = (patch) => settingsStore.set((s) => ({ ...s, ...patch }));
export const toggleSetting = (key) => settingsStore.set((s) => ({ ...s, [key]: !s[key] }));
export const resetSettings = () => settingsStore.set(DEFAULTS);

/* ---------- Aplicação no <html> ---------- */

const media = window.matchMedia('(prefers-color-scheme: dark)');
const resolveDark = (s) =>
  s.theme === SECRET_THEME.id || s.mode === 'dark' || (s.mode === 'system' && media.matches);

/** Fontes do tema secreto, carregadas só quando ele é usado. */
function loadCyberFonts() {
  if (document.getElementById('cyber-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cyber-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
  document.head.appendChild(link);
}

/**
 * Cada configuração vira um atributo `data-*` no <html> (ex.: data-font-size="lg"),
 * e o CSS mapeia esses atributos para variáveis. O script inline do index.html
 * faz o mesmo antes da primeira pintura, evitando "piscar" o tema errado.
 */
function apply(s) {
  const el = document.documentElement;
  for (const [k, v] of Object.entries(s)) el.dataset[k] = String(v);
  el.classList.toggle('dark', resolveDark(s));
  if (s.theme === SECRET_THEME.id) loadCyberFonts();
}

apply(settingsStore.get());
settingsStore.subscribe(apply);
media.addEventListener('change', () => apply(settingsStore.get()));

export const toggleDark = () =>
  updateSettings({ mode: resolveDark(settingsStore.get()) ? 'light' : 'dark' });

/** Efeito de glitch na tela inteira (desligado com "Reduzir animações"). */
export function glitchScreen() {
  const el = document.documentElement;
  el.classList.remove('cyber-boot');
  void el.offsetWidth; // reinicia a animação
  el.classList.add('cyber-boot');
  setTimeout(() => el.classList.remove('cyber-boot'), 900);
}

/** Dispara a tela de "boot" do tema secreto (valor = id da execução). */
export const cyberBootStore = createStore(0);

/** Entra/sai do tema secreto. Devolve true se entrou. */
export function toggleCyber() {
  const s = settingsStore.get();
  const entering = s.theme !== SECRET_THEME.id;
  settingsStore.set(entering
    ? { ...s, theme: SECRET_THEME.id, lastTheme: s.theme }
    : { ...s, theme: s.lastTheme });
  glitchScreen();
  if (entering && !s.reduceMotion) cyberBootStore.set(Date.now());
  return entering;
}

const subscribeDark = (cb) => {
  const off = settingsStore.subscribe(cb);
  media.addEventListener('change', cb);
  return () => { off(); media.removeEventListener('change', cb); };
};

/** Tema escuro efetivo (considera o modo "Sistema"). */
export const useIsDark = () =>
  useSyncExternalStore(subscribeDark, () => resolveDark(settingsStore.get()));
