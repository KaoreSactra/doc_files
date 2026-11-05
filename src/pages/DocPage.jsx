import { Link, useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { BackToTop, DocActions, Markdown, ReadingProgress, TableOfContents, TocButton } from '@/components';
import { ClockIcon } from '@/components/Icons';
import { useHotkey } from '@/hooks/useHotkey';
import { scrollRoot, scrollToTop } from '@/hooks/useScrollProgress';
import { docs, docsBySlug } from '@/lib/docs';
import { clearHighlights, highlightTerms } from '@/lib/highlightTerms';
import { favoriteWithToast, recordVisit, saveProgress, savedProgress, toast } from '@/lib/library';
import { setPageMeta } from '@/lib/meta';
import { settingsStore, useSettings } from '@/lib/settings';

export default function DocPage() {
  const { _splat: slug } = useParams({ strict: false });
  const { hash } = useLocation();
  const { q } = useSearch({ strict: false });
  const navigate = useNavigate();
  const doc = docsBySlug.get(slug);
  const articleRef = useRef(null);
  const { showToc, showProgress } = useSettings();

  const i = doc ? docs.indexOf(doc) : -1;
  const prev = docs[i - 1];
  const next = i >= 0 ? docs[i + 1] : undefined;
  const goTo = (d) => d && navigate({ to: '/docs/$', params: { _splat: d.slug } });

  useHotkey('[', () => goTo(prev));
  useHotkey(']', () => goTo(next));
  useHotkey('u', scrollToTop);
  useHotkey('s', () => doc && favoriteWithToast(doc.slug));
  // Esc limpa o destaque da busca (remove ?q= da URL).
  useHotkey('escape', () => {
    if (q != null && doc) navigate({ to: '/docs/$', params: { _splat: doc.slug }, hash: hash || undefined, search: {}, replace: true });
  });

  useEffect(() => {
    setPageMeta(doc ? { title: doc.title, description: doc.description } : { title: 'Não encontrado' });
    return () => setPageMeta();
  }, [doc]);

  // Destaca o termo vindo da busca e rola até a primeira ocorrência.
  useEffect(() => {
    if (!doc || q == null || q === '') return;
    const { count, first } = highlightTerms(articleRef.current, q);
    if (count) {
      if (!hash) first.startContainer.parentElement?.scrollIntoView({ block: 'center', behavior: 'instant' });
      toast(`${count} ${count === 1 ? 'ocorrência' : 'ocorrências'} de “${q}” · Esc limpa`);
    }
    return clearHighlights;
  }, [doc, q, hash]);

  // Posição inicial: âncora da URL > posição salva > topo.
  useEffect(() => {
    if (!doc) return;
    const root = scrollRoot();
    const target = hash && document.getElementById(decodeURIComponent(hash.replace(/^#/, '')));
    const saved = savedProgress(doc.slug);
    recordVisit(doc.slug);

    if (target) {
      target.scrollIntoView();
    } else if (q) {
      // a rolagem fica por conta do destaque da busca
    } else if (settingsStore.get().rememberPosition && saved > 0.03 && saved < 0.97 && root) {
      root.scrollTo({ top: saved * (root.scrollHeight - root.clientHeight), behavior: 'instant' });
      toast(`Continuando de onde parou (${Math.round(saved * 100)}%) — U volta ao topo`);
    } else {
      root?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [doc, hash, q]);

  // Salva o progresso de leitura enquanto rola (com debounce).
  useEffect(() => {
    const root = scrollRoot();
    if (!doc || !root) return;
    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const max = root.scrollHeight - root.clientHeight;
        saveProgress(doc.slug, max > 0 ? Math.min(1, root.scrollTop / max) : 1);
      }, 400);
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); root.removeEventListener('scroll', onScroll); };
  }, [doc]);

  if (!doc) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Documento não encontrado</h1>
        <p className="mt-2 text-muted"><code>{slug}</code> não existe.</p>
        <Link to="/" className="mt-6 inline-block text-accent underline">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <>
      {showProgress && <ReadingProgress />}
      <div className="mx-auto flex justify-center gap-10 px-6 py-10">
        <article className="min-w-0 max-w-(--doc-width) flex-1">
          <nav className="mb-4 text-sm text-muted print:hidden" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-fg">Início</Link>
            {doc.group && <> / <span>{doc.group.replace(/\//g, ' / ')}</span></>}
          </nav>

          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1"><ClockIcon size={14} />{doc.readingTime} min de leitura</span>
            {doc.updated && <span>Atualizado em {doc.updated}</span>}
            {doc.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            <span className="ml-auto"><DocActions slug={doc.slug} /></span>
          </div>

          <div ref={articleRef} className="prose prose-doc max-w-none">
            <Markdown content={doc.content} slug={doc.slug} />
          </div>

          <footer className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2 print:hidden">
            {prev ? (
              <Link to="/docs/$" params={{ _splat: prev.slug }} className="rounded-lg border border-line p-3 hover:border-accent">
                <div className="text-xs text-muted">← Anterior <kbd className="kbd ml-1">[</kbd></div>
                <div className="font-medium">{prev.title}</div>
              </Link>
            ) : <span />}
            {next && (
              <Link to="/docs/$" params={{ _splat: next.slug }} className="rounded-lg border border-line p-3 text-right hover:border-accent">
                <div className="text-xs text-muted"><kbd className="kbd mr-1">]</kbd> Próximo →</div>
                <div className="font-medium">{next.title}</div>
              </Link>
            )}
          </footer>
        </article>

        {showToc && (
          <aside className="hidden w-56 shrink-0 xl:block print:hidden">
            <TableOfContents containerRef={articleRef} deps={doc.slug} />
          </aside>
        )}
      </div>
      {showToc && doc.sections.filter((x) => x.id).length >= 2 && (
        <TocButton containerRef={articleRef} deps={doc.slug} />
      )}
      <BackToTop />
    </>
  );
}
