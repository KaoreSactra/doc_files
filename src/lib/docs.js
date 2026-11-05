import { slugify } from 'markdown-to-jsx';
import { parseFrontmatter } from './frontmatter';
import { stripMarkdown } from './preprocess';

const modules = import.meta.glob('/src/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const titleCase = (s) =>
  s.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Quebra o corpo em seções por título (## e ###), para busca com deep-link. */
function splitSections(content, docTitle) {
  const sections = [{ id: '', heading: docTitle, lines: [] }];
  let fence = false;
  for (const line of content.split('\n')) {
    if (/^\s{0,3}(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (h) {
      const heading = h[2].replace(/[*_`]/g, '');
      if (h[1].length === 1 && sections.length === 1 && !sections[0].lines.join('').trim()) {
        sections[0].heading = heading;
      } else {
        sections.push({ id: slugify(heading), heading, lines: [] });
      }
    } else {
      sections[sections.length - 1].lines.push(line);
    }
  }
  return sections.map((s) => ({ ...s, text: stripMarkdown(s.lines.join('\n')) }));
}

function build([path, raw]) {
  const slug = path.replace('/src/docs/', '').replace(/\.md$/, '');
  const parts = slug.split('/');
  const { data, content } = parseFrontmatter(raw);
  const firstH1 = content.match(/^#\s+(.+)$/m)?.[1];
  const title = data.title || firstH1 || titleCase(parts.at(-1));
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;

  return {
    slug,
    group: parts.length > 1 ? parts.slice(0, -1).join('/') : '',
    title,
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    order: typeof data.order === 'number' ? data.order : 999,
    updated: data.updated || '',
    content,
    readingTime: Math.max(1, Math.round(words / 200)),
    sections: splitSections(content, title),
  };
}

export const docs = Object.entries(modules)
  .map(build)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'pt'));

export const docsBySlug = new Map(docs.map((d) => [d.slug, d]));
export const allTags = [...new Set(docs.flatMap((d) => d.tags))].sort();

/** Árvore para a sidebar: [{ group, label, items }] */
export function groupedDocs() {
  const map = new Map();
  for (const d of docs) {
    if (!map.has(d.group)) map.set(d.group, []);
    map.get(d.group).push(d);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b, 'pt')))
    .map(([group, items]) => ({
      group,
      label: group ? titleCase(group.split('/').at(-1)) : 'Geral',
      items,
    }));
}

/** Resolve um link relativo (./x.md, ../y) a partir de um doc. */
export function resolveDocLink(href, fromSlug) {
  const [pathPart, hash] = href.split('#');
  const clean = pathPart.replace(/\.md$/, '');
  const base = fromSlug.split('/').slice(0, -1);
  const stack = clean.startsWith('/') ? [] : base;
  for (const seg of clean.replace(/^\//, '').replace(/^docs\//, '').split('/')) {
    if (seg === '..') stack.pop();
    else if (seg && seg !== '.') stack.push(seg);
  }
  const slug = stack.join('/');
  return docsBySlug.has(slug) ? { slug, hash: hash || undefined } : null;
}
