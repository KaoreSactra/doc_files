import { useEffect, useRef } from 'react';

const isTyping = (el) =>
  el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Atalho global. `combo`: "mod+k" (mod = Ctrl/Cmd) ou "/".
 * `allowInInput` permite disparar mesmo com foco em campos de texto.
 */
export function useHotkey(combo, handler, { allowInInput = false } = {}) {
  const ref = useRef(handler);
  useEffect(() => { ref.current = handler; });

  useEffect(() => {
    const parts = combo.toLowerCase().split('+');
    const key = parts.at(-1);
    const needMod = parts.includes('mod');
    const onKey = (e) => {
      if (e.key.toLowerCase() !== key) return;
      if (needMod !== (e.ctrlKey || e.metaKey)) return;
      if (!allowInInput && isTyping(e.target)) return;
      e.preventDefault();
      ref.current(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, allowInInput]);
}
