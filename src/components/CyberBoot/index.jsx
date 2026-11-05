import { useEffect, useState } from 'react';
import { cyberBootStore } from '@/lib/settings';
import { useStore } from '@/lib/store';

const LINES = [
  ['INICIANDO INTERFACE NEURAL', ''],
  ['CARREGANDO IMPLANTES ÓPTICOS', 'OK'],
  ['CALIBRANDO RETINA', 'OK'],
  ['QUEBRANDO ICE DO SERVIDOR', 'OK'],
  ['DESCRIPTOGRAFANDO DOCUMENTOS', 'OK'],
  ['SINCRONIZANDO COM A REDE', 'OK'],
];

const DURATION = 2600;

/** Tela de "boot" exibida ao entrar no tema secreto. */
export default function CyberBoot() {
  const runId = useStore(cyberBootStore);
  return runId ? <Boot key={runId} /> : null;
}

function Boot() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), DURATION - 450);
    const done = setTimeout(() => cyberBootStore.set(0), DURATION);
    const skip = () => cyberBootStore.set(0);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      clearTimeout(out); clearTimeout(done);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <div className={`cyber-boot-screen ${leaving ? 'is-leaving' : ''}`} role="status" aria-label="Conectando à rede">
      <div className="cyber-boot-screen__noise" />
      <div className="cyber-boot-screen__beam" />

      <div className="cyber-boot-screen__inner">
        <div className="cyber-boot-screen__tag">SYS://DOCFILES.NET — v2.0.77</div>

        <h1 className="cyber-glitch" data-text="DOCFILES">DOCFILES</h1>
        <div className="cyber-boot-screen__sub">// PROTOCOLO NEON ATIVADO</div>

        <ul className="cyber-boot-screen__log">
          {LINES.map(([text, status], i) => (
            <li key={text} style={{ '--i': i }}>
              <span className="cyber-boot-screen__prompt">&gt;</span> {text}
              <span className="cyber-boot-screen__dots" />
              {status && <span className="cyber-boot-screen__ok">[{status}]</span>}
            </li>
          ))}
        </ul>

        <div className="cyber-boot-screen__bar"><span /></div>
        <div className="cyber-boot-screen__granted">ACESSO CONCEDIDO</div>
      </div>
    </div>
  );
}
