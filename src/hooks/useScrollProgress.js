import { useEffect, useState } from 'react';

export const scrollRoot = () => document.getElementById('scroll-root');
export const scrollToTop = () => scrollRoot()?.scrollTo({ top: 0 });

/** Posição de rolagem do conteúdo principal: { top, progress (0–1) }. */
export function useScrollProgress() {
  const [state, setState] = useState({ top: 0, progress: 0 });

  useEffect(() => {
    const el = scrollRoot();
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      setState({ top: el.scrollTop, progress: max > 0 ? Math.min(1, el.scrollTop / max) : 1 });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    frame = requestAnimationFrame(update);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  return state;
}
