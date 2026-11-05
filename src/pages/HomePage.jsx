import { Link } from '@tanstack/react-router';
import { FileIcon, StarIcon } from '@/components/Icons';
import { docs, groupedDocs } from '@/lib/docs';
import { MOD_KEY, favoriteDocs, favoritesStore, historyStore, recentDocs } from '@/lib/library';
import { useStore } from '@/lib/store';

const groups = groupedDocs();

export default function HomePage() {
  const recent = recentDocs(useStore(historyStore)).filter((h) => h.progress < 0.97).slice(0, 4);
  const favorites = favoriteDocs(useStore(favoritesStore));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Documentação</h1>
      <p className="mt-3 text-lg text-muted">
        {docs.length} documentos. Pressione <kbd className="kbd">{MOD_KEY} K</kbd> ou <kbd className="kbd">/</kbd> para
        pesquisar e <kbd className="kbd">?</kbd> para ver os atalhos.
      </p>

      {recent.length > 0 && (
        <section className="mt-10">
          <SectionTitle>Continue lendo</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map(({ doc, progress }) => (
              <Link key={doc.slug} to="/docs/$" params={{ _splat: doc.slug }}
                    className="rounded-xl border border-line bg-surface p-4 transition hover:border-accent">
                <div className="flex items-center gap-2 font-medium"><FileIcon />{doc.title}</div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                  {Math.round(progress * 100)}%
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="mt-10">
          <SectionTitle><StarIcon size={13} filled className="text-accent" /> Favoritos</SectionTitle>
          <DocGrid items={favorites} />
        </section>
      )}

      {groups.map(({ group, label, items }) => (
        <section key={group} className="mt-10">
          <SectionTitle>{label}</SectionTitle>
          <DocGrid items={items} />
        </section>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted">{children}</h2>
  );
}

function DocGrid({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((d) => (
        <Link key={d.slug} to="/docs/$" params={{ _splat: d.slug }}
              className="rounded-xl border border-line bg-surface p-4 transition hover:border-accent">
          <div className="flex items-center gap-2 font-medium"><FileIcon />{d.title}</div>
          {d.description && <p className="mt-1 text-sm text-muted">{d.description}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.tags.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        </Link>
      ))}
    </div>
  );
}
