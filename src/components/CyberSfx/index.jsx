import { useEffect } from 'react';
import { SECRET_THEME, useSettings } from '@/lib/settings';
import { sfx } from '@/lib/sfx';

const INTERACTIVE = 'a[href], button, [role="option"], summary';

/** Sons de hover e clique, ligados só no tema secreto com som ativado. */
export default function CyberSfx() {
  const { theme, cyberSound } = useSettings();
  const on = theme === SECRET_THEME.id && cyberSound;

  useEffect(() => {
    if (!on) return;
    let last = null;
    let lastAt = 0;
    const onOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE);
      if (!el || el === last) return;
      last = el;
      const now = performance.now();
      if (now - lastAt < 60) return;
      lastAt = now;
      sfx.hover();
    };
    const onOut = (e) => { if (!e.relatedTarget?.closest?.(INTERACTIVE)) last = null; };
    const onClick = (e) => { if (e.target.closest?.(INTERACTIVE)) sfx.click(); };

    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('click', onClick, true);
    };
  }, [on]);

  return null;
}
