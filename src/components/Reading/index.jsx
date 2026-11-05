import { useState } from 'react';
import { scrollToTop, useScrollProgress } from '@/hooks/useScrollProgress';
import { copyText, favoriteWithToast, favoritesStore } from '@/lib/library';
import { useStore } from '@/lib/store';
import { ArrowUpIcon, LinkIcon, ListIcon, PrinterIcon, StarIcon } from '../Icons';
import TableOfContents from '../TableOfContents';

/** Barra fina no topo do conteúdo indicando quanto do documento foi lido. */
export function ReadingProgress() {
  const { progress } = useScrollProgress();
  return (
    <div className="pointer-events-none sticky top-0 z-20 -mb-0.5 h-0.5 print:hidden" aria-hidden="true">
      <div className="reading-bar h-full origin-left bg-accent transition-transform duration-100"
           style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function BackToTop() {
  const { top } = useScrollProgress();
  if (top < 600) return null;
  return (
    <button type="button" onClick={scrollToTop} aria-label="Voltar ao topo" title="Voltar ao topo (U)"
            className="anim-pop fixed bottom-6 right-6 z-30 rounded-full border border-line bg-surface p-3 text-muted shadow-lg transition hover:border-accent hover:text-accent print:hidden">
      <ArrowUpIcon />
    </button>
  );
}

/** Ações do documento: favoritar, copiar link e imprimir/salvar PDF. */
export function DocActions({ slug }) {
  const isFavorite = useStore(favoritesStore).includes(slug);
  const pageUrl = () => window.location.origin + window.location.pathname;

  return (
    <div className="flex items-center gap-0.5 print:hidden">
      <button type="button" className="btn-ghost" aria-pressed={isFavorite} onClick={() => favoriteWithToast(slug)}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} title="Favoritar (S)">
        <StarIcon filled={isFavorite} />
      </button>
      <button type="button" className="btn-ghost" onClick={() => copyText(pageUrl(), 'Link copiado')}
              aria-label="Copiar link" title="Copiar link">
        <LinkIcon />
      </button>
      <button type="button" className="btn-ghost" onClick={() => window.print()}
              aria-label="Imprimir ou salvar PDF" title="Imprimir / salvar PDF">
        <PrinterIcon />
      </button>
    </div>
  );
}

/** Índice em botão flutuante, para telas onde a coluna lateral não aparece. */
export function TocButton({ containerRef, deps }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-20 z-30 xl:hidden print:hidden">
      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="anim-pop absolute bottom-14 right-0 max-h-[60vh] w-72 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-line bg-surface p-4 shadow-2xl"
               onClick={(e) => e.target.closest('a') && setOpen(false)}>
            <TableOfContents containerRef={containerRef} deps={deps} />
          </div>
        </>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Nesta página" aria-expanded={open} title="Nesta página"
              className={`rounded-full border bg-surface p-3 shadow-lg transition hover:border-accent hover:text-accent ${
                open ? 'border-accent text-accent' : 'border-line text-muted'
              }`}>
        <ListIcon />
      </button>
    </div>
  );
}
