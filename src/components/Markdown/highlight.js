import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

const languages = {
  bash, css, diff, javascript, json, markdown, python, sql, typescript, xml, yaml,
};
for (const [name, def] of Object.entries(languages)) hljs.registerLanguage(name, def);

const aliases = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  sh: 'bash', shell: 'bash', zsh: 'bash', html: 'xml', md: 'markdown',
  yml: 'yaml', py: 'python',
};
for (const [alias, target] of Object.entries(aliases)) hljs.registerAliases(alias, { languageName: target });

export function highlight(code, lang) {
  const name = (lang || '').toLowerCase();
  if (name && hljs.getLanguage(name)) {
    return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
  }
  return null; // sem linguagem conhecida: texto puro
}
