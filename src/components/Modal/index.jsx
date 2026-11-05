import { useEffect, useRef } from 'react';
import { sfx } from '@/lib/sfx';
import { CloseIcon } from '../Icons';

/**
 * Janela modal acessível: fecha com Esc ou clique fora, prende o Tab
 * dentro do painel e devolve o foco ao elemento anterior ao fechar.
 * `variant="drawer"` abre como painel lateral à direita.
 */
export default function Modal({ open, ...props }) {
  if (!open) return null;
  return <ModalPanel {...props} />;
}

function ModalPanel({ onClose, title, variant = 'center', children, footer }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const previous = document.activeElement;
    sfx.open();
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus?.(); sfx.close(); };
  }, []);

  const drawer = variant === 'drawer';
  return (
    <div
      className={`fixed inset-0 z-50 flex print:hidden ${drawer ? 'justify-end bg-black/20' : 'items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`flex flex-col overflow-hidden border-line bg-surface shadow-2xl outline-none ${
          drawer ? 'anim-drawer h-full w-full max-w-sm border-l' : 'anim-pop max-h-[76vh] w-full max-w-lg rounded-xl border'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" className="btn-ghost -mr-2" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
