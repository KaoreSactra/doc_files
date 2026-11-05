# docfiles

Leitor de documentação em Markdown: você escreve arquivos `.md`, ele entrega um site de documentação com busca
instantânea, temas, modo offline e uma leitura confortável. Feito com React 19, Vite, Tailwind 4 e TanStack Router.

O projeto foi pensado para ser **usado via fork**: cada equipe faz um fork, coloca seus `.md` em `src/docs/` e publica
com Docker ou na Vercel. Para contribuir com conteúdo de um projeto existente, basta enviar o `.md` para quem cuida dele
(veja [Contribuindo](#contribuindo)).

## Sumário

- [Começando](#começando)
- [Escrevendo documentos](#escrevendo-documentos)
- [Recursos](#recursos)
- [Atalhos do teclado](#atalhos-do-teclado)
- [Deploy](#deploy)
- [Personalizando o projeto](#personalizando-o-projeto)
- [Estrutura do código](#estrutura-do-código)
- [Contribuindo](#contribuindo)

## Começando

Requisitos: **Node.js 20.19+** e **pnpm 10** (a versão exata está em `packageManager` no `package.json`;
com `corepack enable` ela é usada automaticamente).

```bash
pnpm install
pnpm dev
```

Abra http://localhost:5173.

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento com recarga automática |
| `pnpm build` | Gera o site estático em `dist/` |
| `pnpm preview` | Serve o `dist/` localmente (use para testar o modo offline) |
| `pnpm lint` | Verifica o código com ESLint |

## Escrevendo documentos

Crie arquivos `.md` em `src/docs/`. Cada subpasta vira um grupo na barra lateral
(`src/docs/guia/instalacao.md` → grupo **Guia**, endereço `/docs/guia/instalacao`).

O frontmatter é opcional:

```yaml
---
title: Meu documento          # padrão: primeiro "# título" ou o nome do arquivo
description: Resumo dos cards # aparece na página inicial e nas prévias de link
tags: [guia, api]             # filtros na busca (#guia)
order: 1                      # ordem dentro do grupo (menor primeiro)
updated: 2026-11-05           # mostrado no topo do documento
---
```

Além do Markdown padrão (tabelas, listas de tarefas, notas de rodapé, `<details>`), há sintaxes extras:

| Recurso | Sintaxe |
| --- | --- |
| Callouts | `> [!NOTE]` (estilo GitHub) ou `:::tip Título` … `:::` |
| Destaque, inserção | `==texto==`, `++texto++` |
| Teclas | `[[Ctrl+K]]` |
| Sub/sobrescrito | `H~2~O`, `x^2^` |
| Código com realce | ` ```js ` (js, ts, bash, json, css, html, python, sql, yaml, diff, markdown) |
| Diagramas | ` ```mermaid ` |
| Fórmulas | `$E = mc^2$` ou `$$` em linhas próprias |
| Links entre docs | `[texto](./outro.md#secao)` — navega sem recarregar |

A referência completa, com exemplos renderizados, está em [`src/docs/guia/sintaxe.md`](src/docs/guia/sintaxe.md)
(ou em `/docs/guia/sintaxe` com o site rodando).

## Recursos

**Busca**
- Pesquisa por seção, com trecho e destaque; abre direto no título certo.
- Ignora acentos e tolera erros de digitação.
- Filtros por `#tag` e por grupo; buscas recentes salvas.
- O termo pesquisado fica destacado no documento aberto (`Esc` limpa).

**Leitura**
- Índice "Nesta página" com a seção atual marcada (botão flutuante em telas menores).
- Barra de progresso, voltar ao topo e navegação entre documentos anterior/próximo.
- Retoma de onde você parou em cada documento.
- Favoritos e "Continue lendo" na página inicial.
- Zoom em imagens, copiar link do documento ou de uma seção (clique no `#` do título).
- Imprimir / salvar como PDF com layout limpo.
- Modo foco, que esconde a barra lateral.

**Configurações** (engrenagem na barra lateral ou `Ctrl ,`)
- Modo Sistema, Claro ou Escuro e 6 temas: Índigo, Oceano, Floresta, Sépia, Rosa e Grafite.
- Tamanho do texto, fonte (sem serifa, serifada ou mono), espaçamento entre linhas e largura do conteúdo.
- Liga/desliga índice, barra de progresso, lembrar posição, modo foco e animações.
- Quebra de linhas longas nos blocos de código.
- Exportar/importar um backup com configurações, favoritos e histórico.

Tudo isso fica salvo apenas no navegador (`localStorage`); nada é enviado a servidor algum.

**Offline e instalável (PWA)**
- Depois da primeira visita, o site e todos os documentos funcionam sem internet.
- Pode ser instalado como aplicativo pelo navegador.
- Atualiza sozinho a cada novo deploy.
- Mermaid e KaTeX só são baixados quando um documento usa diagramas ou fórmulas.

## Atalhos do teclado

| Atalho | Ação |
| --- | --- |
| `Ctrl K` ou `/` | Pesquisar |
| `Ctrl ,` | Configurações |
| `?` | Lista de atalhos |
| `T` | Alternar claro/escuro |
| `F` | Modo foco |
| `[` / `]` | Documento anterior / próximo |
| `S` | Favoritar o documento |
| `U` | Voltar ao topo |
| `Esc` | Fechar janela / limpar destaque da busca |

No macOS, `Ctrl` vira `⌘`.

## Deploy

O build é um site estático (SPA): rotas como `/docs/...` precisam cair no `index.html`. As duas opções abaixo já vêm
configuradas para isso, com cache longo para `/assets/` e sem cache para `index.html` e o service worker.

### Docker

Build multi-stage (Node + pnpm → nginx). A configuração do nginx fica em [`docker/nginx.conf`](docker/nginx.conf).

```bash
docker compose up -d --build
```

Acesse http://localhost:8080. Para outra porta: `PORT=3000 docker compose up -d --build`.

Sem compose:

```bash
docker build -t docfiles .
docker run -d -p 8080:80 docfiles
```

### Vercel

Configuração em [`vercel.json`](vercel.json) (Vite, pnpm, saída `dist/`, rewrite da SPA e cabeçalhos de cache).

- **Pelo painel:** importe o repositório em vercel.com/new; não há mais nada para configurar.
- **Pela CLI:** `pnpm dlx vercel` (preview) e `pnpm dlx vercel --prod` (produção).

### Outra hospedagem estática

Publique a pasta `dist/` e configure o fallback de rotas para `/index.html`. Não sirva `sw.js` com cache longo.

## Personalizando o projeto

**Nome e cores do site:** `index.html` (título, descrição e metatags), `vite.config.js` (nome e cores do app instalável)
e os ícones em `public/`.

**Novo tema:** adicione as variáveis em `src/styles/index.css`:

```css
[data-theme="meu-tema"] {
  --bg: #fff; --surface: #f8f8f8; --hover: #eee; --line: #ddd;
  --fg: #111; --muted: #666; --accent: #0a7; --accent-fg: #fff; --code-bg: #f6f6f6;
}
.dark[data-theme="meu-tema"] { /* mesmas variáveis, versão escura */ }
```

e registre em `THEMES` (`src/lib/settings.js`):

```js
{ id: 'meu-tema', label: 'Meu tema' },
```

**Linguagens de código:** registre novas linguagens do highlight.js em `src/components/Markdown/highlight.js`.

## Estrutura do código

```
src/
  docs/          conteúdo .md (subpastas = grupos)
  pages/         HomePage, DocPage
  components/
    MainLayout/  layout, atalhos globais
    Sidebar/     navegação e favoritos
    SearchPalette/
    SettingsPanel/
    Markdown/    renderização, código, callouts, Mermaid, KaTeX, zoom de imagens
    Reading/     progresso, ações do documento, índice flutuante
    Modal/, Toaster/, ShortcutsDialog/, TableOfContents/, ThemeToggle/, Icons/
  lib/
    docs.js          carga dos .md, frontmatter, grupos e links entre docs
    preprocess.js    sintaxes extras (callouts, ==destaque==, fórmulas…)
    search.js        índice e busca (Fuse.js)
    settings.js      configurações e temas
    library.js       favoritos, histórico, avisos
    store.js         stores persistentes (localStorage, sincronizadas entre abas)
    highlightTerms.js, meta.js, pwa.js, userData.js
  hooks/         useHotkey, useLocalStorage, useScrollProgress
  styles/        index.css (temas, tipografia, componentes)
docker/          nginx.conf
public/          ícones do site e do app
```

## Contribuindo

**Com documentação** (o caso mais comum):

1. Faça um fork do repositório.
2. Crie ou edite o `.md` em `src/docs/`, seguindo a [referência de sintaxe](src/docs/guia/sintaxe.md).
3. Confira com `pnpm dev`.
4. Abra um pull request, ou envie o arquivo `.md` para quem mantém o projeto.

**Com código:** rode `pnpm lint` e `pnpm build` antes de abrir o pull request.
