import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { allTags, groupedDocs } from '@/lib/docs';
import { parseQuery, search } from '@/lib/search';
import { sfx } from '@/lib/sfx';
import { ClockIcon, EnterIcon, FileIcon, HashIcon, SearchIcon } from '../Icons';
import Highlighted from './Highlighted';

const GROUPS = groupedDocs().map(({ group, label }) => ({ group, label }));

export default function SearchPalette({ open, onClose }) {
  if (!open) return null;
  return <Palette onClose={onClose} />;
}

function Palette({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useLocalStorage('docfiles:recent-searches', []);
  const [group, setGroup] = useState(null);

  const results = useMemo(() => search(query, { group }), [query, group]);
  const { tags: activeTags, text: queryText } = parseQuery(query);

  useEffect(() => {
    inputRef.current?.focus();
    sfx.open();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; sfx.close(); };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (r) => {
    const q = query.trim();
    if (q) setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 6));
    onClose();
    navigate({
      to: '/docs/$',
      params: { _splat: r.slug },
      hash: r.id || undefined,
      // O termo vai na URL para ser destacado no documento.
      search: queryText ? { q: queryText } : {},
    });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'Backspace' && !query) setActive(0);
  };

  const change = (value) => { setQuery(value); setActive(0); };
  const toggleTag = (t) => {
    const has = activeTags.includes(t);
    const rest = query.replace(new RegExp(`(^|\\s)#${t}(?=\\s|$)`, 'gi'), ' ').trim();
    change(has ? rest : `${rest} #${t}`.trim() + ' ');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
         onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Pesquisar na documentação"
           className="flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => change(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pesquisar… use #tag para filtrar"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `result-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        {GROUPS.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2" role="radiogroup" aria-label="Filtrar por grupo">
            <span className="mr-1 text-xs text-muted">Em:</span>
            {[{ group: null, label: 'Todos' }, ...GROUPS].map((g) => (
              <button key={g.label} type="button" role="radio" aria-checked={group === g.group}
                      onClick={() => { setGroup(g.group); setActive(0); inputRef.current?.focus(); }}
                      className={`chip ${group === g.group ? 'chip--on' : ''}`}>
                {g.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2">
          <HashIcon size={13} className="text-muted" />
          {allTags.map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)}
                    className={`chip ${activeTags.includes(t.toLowerCase()) ? 'chip--on' : ''}`}>
              {t}
            </button>
          ))}
        </div>

        <div ref={listRef} id="search-results" role="listbox" className="overflow-y-auto p-2">
          {!query && recent.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted">Recentes</div>
              {recent.map((r) => (
                <button key={r} type="button" onClick={() => change(r)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-hover">
                  <ClockIcon size={14} className="text-muted" />{r}
                </button>
              ))}
              <div className="px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted">Documentos</div>
            </div>
          )}

          {results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-muted">
              Nada encontrado para <strong className="text-fg">“{query}”</strong>.
            </p>
          )}

          {results.map((r, i) => (
            <button
              key={`${r.slug}#${r.id}`}
              id={`result-${i}`}
              role="option"
              aria-selected={i === active}
              type="button"
              onMouseMove={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${i === active ? 'bg-hover' : ''}`}
            >
              <span className="mt-0.5 text-muted">{r.isDoc ? <FileIcon /> : <HashIcon />}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  <Highlighted text={r.heading} ranges={r.ranges.heading} />
                </span>
                {!r.isDoc && (
                  <span className="block truncate text-xs text-muted">
                    em <Highlighted text={r.docTitle} ranges={r.ranges.docTitle} />
                  </span>
                )}
                {r.snippet && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                    <Highlighted text={r.snippet.text} ranges={r.snippet.ranges} />
                  </span>
                )}
              </span>
              {i === active && <EnterIcon size={14} className="mt-1 text-muted" />}
            </button>
          ))}
        </div>

        <div className="flex gap-4 border-t border-line px-4 py-2 text-xs text-muted">
          <span><kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navegar</span>
          <span><kbd className="kbd">↵</kbd> abrir</span>
          <span className="ml-auto">{results.length} resultado{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
