// Destaca termos da busca no documento com a CSS Custom Highlight API
// (não altera o DOM do React). Navegadores sem suporte simplesmente não destacam.

const NAME = 'search-term';
const supported = () => typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

/** Minúsculas e sem acento, preservando o tamanho (índices batem com o texto original). */
function fold(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) out += s[i].toLowerCase().normalize('NFD')[0];
  return out;
}

export function clearHighlights() {
  if (supported()) CSS.highlights.delete(NAME);
}

/** Devolve { count, first: Range | null }. */
export function highlightTerms(container, query) {
  clearHighlights();
  if (!supported() || !container) return { count: 0, first: null };

  const terms = [...new Set(String(query).split(/\s+/).map(fold).filter((t) => t.length >= 2))];
  if (!terms.length) return { count: 0, first: null };

  const ranges = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('.anchor, svg, .katex-mathml')
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT),
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = fold(node.data);
    for (const term of terms) {
      for (let i = text.indexOf(term); i !== -1; i = text.indexOf(term, i + term.length)) {
        const r = new Range();
        r.setStart(node, i);
        r.setEnd(node, i + term.length);
        ranges.push(r);
      }
    }
  }
  if (!ranges.length) return { count: 0, first: null };

  ranges.sort((a, b) => a.compareBoundaryPoints(Range.START_TO_START, b));
  CSS.highlights.set(NAME, new Highlight(...ranges));
  return { count: ranges.length, first: ranges[0] };
}
