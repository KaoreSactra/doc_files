const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseValue(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (/^\[.*\]$/.test(v)) {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  if (/^(true|false)$/.test(v)) return v === 'true';
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v.replace(/^['"]|['"]$/g, '');
}

/** Extrai o frontmatter YAML simples (chave: valor, listas inline ou "- item"). */
export function parseFrontmatter(source) {
  const match = source.match(FM_RE);
  if (!match) return { data: {}, content: source };

  const data = {};
  let listKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(parseValue(item[1]));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    if (kv[2] === '') {
      listKey = kv[1];
      data[listKey] = [];
    } else {
      listKey = null;
      data[kv[1]] = parseValue(kv[2]);
    }
  }
  return { data, content: source.slice(match[0].length) };
}
