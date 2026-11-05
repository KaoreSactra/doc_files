import { useEffect, useState } from 'react';

/** Índice lateral gerado a partir dos títulos renderizados, com scrollspy. */
export default function TableOfContents({ containerRef, deps }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const els = [...(containerRef.current?.querySelectorAll('h2[id], h3[id]') ?? [])];
    setItems(els.map((el) => ({
      id: el.id,
      level: Number(el.tagName[1]),
      text: el.textContent.replace(/#$/, ''),
    })));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="Nesta página" className="sticky top-6 text-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Nesta página</div>
      <ul className="space-y-1 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`}
               className={`-ml-px block border-l py-0.5 transition ${it.level === 3 ? 'pl-6' : 'pl-3'} ${
                 active === it.id ? 'border-accent font-medium text-accent' : 'border-transparent text-muted hover:text-fg'
               }`}>
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
