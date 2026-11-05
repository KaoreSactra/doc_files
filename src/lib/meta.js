// Atualiza <title> e metatags (descrição, Open Graph, Twitter) da página atual.
// Obs.: em SPA, robôs que não executam JS só veem os valores padrão do index.html.

const SITE = 'docfiles';
const DEFAULT_DESCRIPTION = 'Leitor de documentação em Markdown.';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setPageMeta({ title, description } = {}) {
  const fullTitle = title ? `${title} · ${SITE}` : SITE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = window.location.origin + window.location.pathname;

  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', desc);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}
