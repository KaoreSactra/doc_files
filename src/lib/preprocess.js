// Transforma sintaxes estendidas em Markdown padrão antes da renderização.

const CALLOUT_ALIASES = {
  note: 'NOTE', info: 'NOTE',
  tip: 'TIP', success: 'TIP',
  important: 'IMPORTANT',
  warning: 'WARNING', warn: 'WARNING',
  caution: 'CAUTION', danger: 'CAUTION',
};

/** Divide o texto preservando blocos de código (que não devem ser alterados). */
function mapOutsideFences(source, fn) {
  const lines = source.split('\n');
  const out = [];
  let buffer = [];
  let fence = null;
  const flush = () => {
    if (buffer.length) out.push(fn(buffer.join('\n')));
    buffer = [];
  };
  for (const line of lines) {
    const m = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      out.push(line);
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
    } else if (m) {
      flush();
      fence = m[1];
      out.push(line);
    } else {
      buffer.push(line);
    }
  }
  flush();
  return out.join('\n');
}

/** :::tip Título ... ::: → > [!TIP] */
function directives(text) {
  return text.replace(
    /^:::(\w+)[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/gm,
    (full, kind, title, body) => {
      const type = CALLOUT_ALIASES[kind.toLowerCase()];
      if (!type) return full;
      const quoted = body.split('\n').map((l) => `> ${l}`).join('\n');
      const head = title.trim() ? `> **${title.trim()}**\n>\n` : '';
      return `> [!${type}]\n${head}${quoted}`;
    },
  );
}

/** ==destaque== → <mark>, ++inserido++ → <ins>, [[Ctrl+K]] → <kbd>, H~2~O / x^2^ */
function inline(text) {
  return text
    .replace(/==(?=\S)([^=\n]+?)(?<=\S)==/g, '<mark>$1</mark>')
    .replace(/\+\+(?=\S)([^+\n]+?)(?<=\S)\+\+/g, '<ins>$1</ins>')
    .replace(/\[\[([^\]\n]+)\]\]/g, (_, keys) =>
      keys
        .split('+')
        .map((k) => `<kbd>${k.trim()}</kbd>`)
        .join('+'),
    )
    .replace(/(?<!~)~([^~\s]+)~(?!~)/g, '<sub>$1</sub>')
    .replace(/(?<!\^)\^([^^\s]+)\^(?!\^)/g, '<sup>$1</sup>');
}

/** Marca invisível que identifica uma fórmula inline dentro de um `code`. */
export const MATH_MARK = '\u2061';

/** $$ ... $$ (em linhas próprias) → bloco ```math */
function blockMath(text) {
  return text.replace(/^[ \t]*\$\$([\s\S]+?)\$\$[ \t]*$/gm, (_, tex) => `\n\`\`\`math\n${tex.trim()}\n\`\`\`\n`);
}

const INLINE_MATH = /(?<![\\$\w])\$(?=\S)([^$\n]+?)(?<=\S)\$(?![\w$])/g;
const CODE_SPAN = /(`+)([^\n]*?[^`\n])\1(?!`)/g;

/**
 * Protege `código` e $fórmulas$ das sintaxes extras (ex.: x^2 não vira <sup>)
 * e converte $tex$ em `⁡tex`, renderizado com KaTeX pelo componente de código inline.
 */
function protectInline(text, fn) {
  const slots = [];
  const keep = (s) => `\u0000${slots.push(s) - 1}\u0000`;
  let t = text.replace(CODE_SPAN, keep);
  t = t.replace(INLINE_MATH, (_, tex) => keep('`' + MATH_MARK + tex + '`'));
  return fn(t).replace(/\u0000(\d+)\u0000/g, (_, i) => slots[i]);
}

export function preprocess(source) {
  return mapOutsideFences(
    mapOutsideFences(source, blockMath),
    (chunk) => protectInline(chunk, (t) => inline(directives(t))),
  );
}

/** Remove a sintaxe Markdown para indexação de busca. */
export function stripMarkdown(text) {
  return mapOutsideFences(text, (t) => t)
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```.*\n?|```$/g, ' '))
    .replace(/^:::\w+.*$|^:::$/gm, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]\n]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|?\s*$/gm, ' ')
    .replace(/^>\s*\[!\w+\]\s*$/gm, ' ')
    .replace(/^[>#\-*+\s]+(?=\S)/gm, '')
    .replace(/[*_`~=|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
