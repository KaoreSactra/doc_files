import { useMemo, useState } from 'react';
import { CheckIcon, CopyIcon } from '../Icons';
import { highlight } from './highlight';

export default function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => highlight(code, lang), [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard indisponível */ }
  };

  return (
    <div className="code-block not-prose">
      <div className="code-block__bar">
        <span>{lang || 'texto'}</span>
        <button type="button" onClick={copy} className="code-block__copy" aria-label="Copiar código">
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre>
        {html ? <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /> : <code className="hljs">{code}</code>}
      </pre>
    </div>
  );
}
