/** Renderiza `text` destacando os intervalos [início, fim] (inclusivos). */
export default function Highlighted({ text, ranges = [] }) {
  if (!ranges.length) return text;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [s, e] of sorted) {
    const last = merged.at(-1);
    if (last && s <= last[1] + 1) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  const out = [];
  let pos = 0;
  merged.forEach(([s, e], i) => {
    if (s > pos) out.push(text.slice(pos, s));
    out.push(<mark key={i} className="search-hit">{text.slice(s, e + 1)}</mark>);
    pos = e + 1;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}
