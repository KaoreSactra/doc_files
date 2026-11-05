import { Link } from '@tanstack/react-router';
import Markdown, { RuleType } from 'markdown-to-jsx/react';
import { useMemo } from 'react';
import { resolveDocLink } from '@/lib/docs';
import { copyText } from '@/lib/library';
import { MATH_MARK, preprocess } from '@/lib/preprocess';
import Callout from './Callout';
import CodeBlock from './CodeBlock';
import MathTex from './MathTex';
import Mermaid from './Mermaid';
import ZoomImage from './ZoomImage';

const isExternal = (href) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);

function DocLink({ href = '', children, currentSlug, ...rest }) {
  if (href.startsWith('#')) return <a href={href} {...rest}>{children}</a>;
  if (isExternal(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
  }
  const target = resolveDocLink(href, currentSlug);
  if (!target) return <a href={href} {...rest}>{children}</a>;
  return (
    <Link to="/docs/$" params={{ _splat: target.slug }} hash={target.hash} {...rest}>
      {children}
    </Link>
  );
}

/** Código inline; se vier marcado pelo pré-processador, é uma fórmula $...$. */
function InlineCode({ children, ...rest }) {
  const text = Array.isArray(children) && children.length === 1 ? children[0] : children;
  if (typeof text === 'string' && text.startsWith(MATH_MARK)) return <MathTex inline tex={text.slice(1)} />;
  return <code {...rest}>{children}</code>;
}

export default function DocMarkdown({ content, slug }) {
  const options = useMemo(
    () => ({
      overrides: {
        a: { component: DocLink, props: { currentSlug: slug } },
        img: { component: ZoomImage },
        code: { component: InlineCode },
        table: ({ children }) => (
          <div className="table-wrap not-prose"><table>{children}</table></div>
        ),
      },
      renderRule(next, node, renderChildren) {
        switch (node.type) {
          case RuleType.blockQuote:
            return node.alert ? (
              <Callout key={node.endPos} type={node.alert}>{renderChildren(node.children)}</Callout>
            ) : next();
          case RuleType.codeBlock: {
            const lang = (node.lang || '').toLowerCase();
            if (lang === 'mermaid') return <Mermaid key={node.endPos} code={node.text} />;
            if (lang === 'math' || lang === 'latex' || lang === 'tex') return <MathTex key={node.endPos} tex={node.text} />;
            return <CodeBlock key={node.endPos} code={node.text} lang={node.lang} />;
          }
          case RuleType.heading: {
            const Tag = `h${node.level}`;
            return (
              <Tag key={node.id} id={node.id} className="group scroll-mt-20">
                {renderChildren(node.children)}
                <a href={`#${node.id}`} className="anchor" aria-label="Copiar link desta seção" title="Copiar link desta seção"
                   onClick={() => copyText(`${window.location.origin}${window.location.pathname}#${node.id}`, 'Link da seção copiado')}>#</a>
              </Tag>
            );
          }
          default:
            return next();
        }
      },
    }),
    [slug],
  );

  const source = useMemo(() => preprocess(content), [content]);
  return <Markdown options={options}>{source}</Markdown>;
}
