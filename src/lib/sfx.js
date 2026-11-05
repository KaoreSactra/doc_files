// Efeitos sonoros do tema secreto, sintetizados com Web Audio (sem arquivos).
// Volume baixo de propósito: são "texturas", não devem atrapalhar a leitura.
import { SECRET_THEME, settingsStore } from './settings';

const VOLUME = 0.07;
let ctx;
let master;

const enabled = () => {
  const s = settingsStore.get();
  return s.theme === SECRET_THEME.id && s.cyberSound;
};

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, to, dur = 0.06, type = 'square', gain = 0.3, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

let noiseBuffer;
function noise({ dur = 0.08, gain = 0.25, delay = 0, freq = 2500 }) {
  const c = audio();
  if (!c) return;
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const env = c.createGain();
  src.buffer = noiseBuffer;
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.2;
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const play = (fn) => () => {
  if (!enabled()) return;
  try { fn(); } catch { /* áudio indisponível */ }
};

export const sfx = {
  /** Passar o mouse sobre link/botão: um "tic" agudo e curtíssimo. */
  hover: play(() => tone({ freq: 2600, dur: 0.022, type: 'sine', gain: 0.18 })),
  /** Clique. */
  click: play(() => {
    tone({ freq: 1400, to: 700, dur: 0.045, type: 'square', gain: 0.22 });
    noise({ dur: 0.03, gain: 0.12, freq: 5000 });
  }),
  /** Abrir janela/busca: varredura para cima. */
  open: play(() => {
    tone({ freq: 320, to: 1300, dur: 0.12, type: 'sawtooth', gain: 0.16 });
    tone({ freq: 1950, dur: 0.04, type: 'square', gain: 0.12, delay: 0.1 });
  }),
  /** Fechar janela: varredura para baixo. */
  close: play(() => tone({ freq: 1100, to: 260, dur: 0.1, type: 'sawtooth', gain: 0.13 })),
  /** Aviso (toast): dois bipes. */
  notify: play(() => {
    tone({ freq: 880, dur: 0.05, type: 'square', gain: 0.16 });
    tone({ freq: 1320, dur: 0.07, type: 'square', gain: 0.16, delay: 0.065 });
  }),
  /** Entrada no tema: liga, chiados de glitch, linhas do log e "acesso concedido". */
  boot: play(() => {
    tone({ freq: 70, to: 880, dur: 0.9, type: 'sawtooth', gain: 0.22 });
    [0.15, 0.32, 0.58].forEach((d) => noise({ dur: 0.07, gain: 0.3, delay: d, freq: 1800 + d * 4000 }));
    for (let i = 0; i < 6; i++) tone({ freq: 1500 + i * 90, dur: 0.025, type: 'square', gain: 0.14, delay: 0.37 + i * 0.22 });
    [660, 990, 1320].forEach((f, i) => tone({ freq: f, dur: 0.45, type: 'triangle', gain: 0.16, delay: 1.95 + i * 0.03 }));
  }),
  /** Saída do tema: desliga. Deve ser chamado antes da troca de tema. */
  powerDown: play(() => {
    tone({ freq: 900, to: 50, dur: 0.55, type: 'sawtooth', gain: 0.2 });
    noise({ dur: 0.25, gain: 0.2, freq: 900 });
  }),
};
