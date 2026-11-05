import { useEffect, useState } from 'react';
import { useIsDark, useSettings } from '@/lib/settings';

// Mermaid é pesado (~1 MB): só é baixado quando um documento tem diagrama.
let mermaidPromise;
const loadMermaid = () => (mermaidPromise ??= import('mermaid').then((m) => m.default));
let renderCount = 0;

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Diagrama a partir de um bloco ```mermaid, com as cores do tema atual. */
export default function Mermaid({ code }) {
  const dark = useIsDark();
  const { theme } = useSettings();
  const [result, setResult] = useState({ svg: '', error: null });
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: getComputedStyle(document.body).fontFamily,
          themeVariables: {
            darkMode: dark,
            background: cssVar('--bg'),
            mainBkg: cssVar('--surface'),
            primaryColor: cssVar('--surface'),
            primaryTextColor: cssVar('--fg'),
            primaryBorderColor: cssVar('--accent'),
            secondaryColor: cssVar('--hover'),
            secondaryTextColor: cssVar('--fg'),
            secondaryBorderColor: cssVar('--line'),
            tertiaryColor: cssVar('--bg'),
            tertiaryTextColor: cssVar('--fg'),
            lineColor: cssVar('--muted'),
            textColor: cssVar('--fg'),
            noteBkgColor: cssVar('--hover'),
            noteTextColor: cssVar('--fg'),
            noteBorderColor: cssVar('--line'),
            actorBkg: cssVar('--surface'),
            actorBorder: cssVar('--accent'),
            actorTextColor: cssVar('--fg'),
            signalColor: cssVar('--fg'),
            signalTextColor: cssVar('--fg'),
            fontSize: '14px',
          },
        });
        return mermaid.render(`mermaid-${++renderCount}`, code);
      })
      .then(({ svg }) => { if (!cancelled) setResult({ svg, error: null }); })
      .catch((e) => { if (!cancelled) setResult({ svg: '', error: e?.message || String(e) }); });
    return () => { cancelled = true; };
  }, [code, dark, theme]);

  const { svg, error } = result;
  return (
    <figure className="code-block mermaid-block not-prose">
      <div className="code-block__bar">
        <span>{error ? 'diagrama (erro)' : 'diagrama'}</span>
        {!error && (
          <button type="button" className="code-block__copy" onClick={() => setShowCode((v) => !v)}>
            {showCode ? 'Ver diagrama' : 'Ver código'}
          </button>
        )}
      </div>
      {error && <p className="mermaid-block__error">Não foi possível desenhar o diagrama: {error}</p>}
      {showCode || error ? (
        <pre><code className="hljs">{code}</code></pre>
      ) : svg ? (
        <div className="mermaid-block__svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="mermaid-block__loading">Desenhando diagrama…</div>
      )}
    </figure>
  );
}
