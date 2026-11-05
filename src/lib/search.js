import Fuse from 'fuse.js';
import { docs } from './docs';

const entries = docs.flatMap((doc) =>
  doc.sections.map((s) => ({
    slug: doc.slug,
    docTitle: doc.title,
    group: doc.group,
    tags: doc.tags,
    id: s.id,
    heading: s.heading,
    text: s.text,
    isDoc: s.id === '',
  })),
);

const fuse = new Fuse(entries, {
  includeMatches: true,
  includeScore: true,
  ignoreLocation: true,
  ignoreDiacritics: true,
  threshold: 0.3,
  minMatchCharLength: 2,
  keys: [
    { name: 'heading', weight: 3 },
    { name: 'docTitle', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'text', weight: 1 },
  ],
});

/** Interpreta "#tag" no texto da busca: devolve { tags, text }. */
export function parseQuery(raw) {
  const tags = [];
  const text = raw
    .replace(/(^|\s)#([\w-]+)/g, (_, sp, t) => {
      tags.push(t.toLowerCase());
      return sp;
    })
    .trim();
  return { tags, text };
}

function snippet(text, indices) {
  if (!text) return null;
  const best = [...indices].sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
  if (!best) return { text: text.slice(0, 120), ranges: [] };
  const start = Math.max(0, best[0] - 50);
  const end = Math.min(text.length, best[1] + 90);
  const prefix = start > 0 ? '…' : '';
  const cut = (prefix + text.slice(start, end) + (end < text.length ? '…' : ''));
  const offset = prefix.length - start;
  const ranges = indices
    .filter(([a, b]) => a >= start && b < end)
    .map(([a, b]) => [a + offset, b + offset]);
  return { text: cut, ranges };
}

/** `group`: null = todos; '' = documentos da raiz; 'guia' = grupo e subgrupos. */
const inGroup = (e, group) =>
  group == null || (group === '' ? e.group === '' : e.group === group || e.group.startsWith(`${group}/`));

export function search(raw, { limit = 12, group = null } = {}) {
  const { tags, text } = parseQuery(raw);
  const matchesTags = (e) =>
    inGroup(e, group) && tags.every((t) => e.tags.some((x) => x.toLowerCase() === t));

  if (!text) {
    return entries
      .filter((e) => e.isDoc && (tags.length === 0 || matchesTags(e)))
      .slice(0, limit)
      .map((e) => ({ ...e, ranges: {}, snippet: null }));
  }

  return fuse
    .search(text)
    .filter((r) => matchesTags(r.item))
    .slice(0, limit)
    .map(({ item, matches = [] }) => {
      const by = Object.fromEntries(matches.map((m) => [m.key, m.indices]));
      return {
        ...item,
        ranges: { heading: by.heading ?? [], docTitle: by.docTitle ?? [] },
        snippet: by.text ? snippet(item.text, by.text) : null,
      };
    });
}
