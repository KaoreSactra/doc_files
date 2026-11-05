import { useEffect, useState } from 'react';

// KaTeX (+ CSS e fontes) só é baixado quando um documento tem fórmulas.
let katexPromise;
const loadKatex = () =>
  (katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([m]) => m.default));

/** Fórmula LaTeX: `$...$` (inline) ou `$$...$$` (bloco). */
export default function MathTex({ tex, inline = false }) {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadKatex().then((katex) => {
      if (cancelled) return;
      setHtml(katex.renderToString(tex, { displayMode: !inline, throwOnError: false, output: 'htmlAndMathml' }));
    });
    return () => { cancelled = true; };
  }, [tex, inline]);

  if (inline) {
    return html === null
      ? <code>{tex}</code>
      : <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return html === null
    ? <div className="math-block not-prose"><code>{tex}</code></div>
    : <div className="math-block not-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
