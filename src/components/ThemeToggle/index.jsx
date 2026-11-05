import { useEffect, useRef, useState } from 'react';
import { toast } from '@/lib/library';
import { sfx } from '@/lib/sfx';
import { SECRET_THEME, toggleCyber, toggleDark, useIsDark, useSettings } from '@/lib/settings';
import { BoltIcon, MoonIcon, SunIcon } from '../Icons';

/** Tempo segurando o botão para entrar/sair do tema secreto. */
const HOLD_MS = 1200;

/**
 * Clique: alterna claro/escuro.
 * Segurar (mouse ou toque): entra/sai do tema secreto. 🤫
 */
export default function ThemeToggle() {
  const dark = useIsDark();
  const cyber = useSettings().theme === SECRET_THEME.id;
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const fired = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const start = (e) => {
    if (e.button !== 0) return;
    fired.current = false;
    setHolding(true);
    timer.current = setTimeout(() => {
      fired.current = true;
      setHolding(false);
      navigator.vibrate?.([30, 40, 60]);
      if (cyber) sfx.powerDown();
      if (toggleCyber()) sfx.boot();
      else toast('Desconectado da rede. Bem-vindo de volta.');
    }, HOLD_MS);
  };

  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  const click = () => {
    if (fired.current) { fired.current = false; return; }
    if (cyber) toast('Segure o botão para sair da rede');
    else toggleDark();
  };

  return (
    <button
      type="button"
      onClick={click}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className={`btn-ghost relative touch-none select-none ${holding ? 'is-holding' : ''}`}
      aria-label={cyber ? 'Tema secreto ativo' : dark ? 'Usar tema claro' : 'Usar tema escuro'}
      title={cyber ? 'Segure para sair da rede' : 'Alternar claro/escuro (T)'}
    >
      {cyber ? <BoltIcon /> : dark ? <SunIcon /> : <MoonIcon />}
      {holding && (
        <svg className="hold-ring" viewBox="0 0 36 36" aria-hidden="true" style={{ '--hold-ms': `${HOLD_MS}ms` }}>
          <circle cx="18" cy="18" r="16" pathLength="100" />
        </svg>
      )}
    </button>
  );
}
