---
title: Introdução
description: Visão geral do docfiles e do que ele consegue fazer.
tags: [inicio, guia]
order: 1
updated: 2026-11-05
---

# Introdução

O **docfiles** transforma arquivos `.md` em uma documentação navegável: busca instantânea, temas, modo offline e uma
leitura confortável, sem banco de dados nem servidor — é só um site estático.

:::tip Comece pela busca
Pressione [[Ctrl+K]] ou [[/]] em qualquer página para pesquisar. Para ver todos os atalhos, pressione [[?]].
:::

## Como funciona

1. Coloque arquivos `.md` em `src/docs/` — cada subpasta vira um grupo na barra lateral.
2. Opcionalmente adicione *frontmatter* (título, descrição, tags, ordem) no topo.
3. Pronto: a navegação, o índice de busca e a página inicial são gerados automaticamente.

O projeto é pensado para ser usado via **fork**: cada equipe mantém o seu, e quem quiser contribuir com conteúdo
envia o `.md` para quem cuida da documentação. Veja [como contribuir](./guia/contribuir.md).

## Por onde seguir

| Quero… | Leia |
| --- | --- |
| Rodar o projeto ou publicar | [Instalação e deploy](./guia/instalacao.md) |
| Escrever um documento | [Sintaxe Markdown](./guia/sintaxe.md) |
| Enviar um documento | [Como contribuir](./guia/contribuir.md) |
| Encontrar algo rápido | [Busca avançada](./recursos/busca.md) |
| Ler com mais conforto | [Leitura](./recursos/leitura.md) |
| Ajustar temas e fontes | [Configurações](./recursos/configuracoes.md) |

## Recursos

- [x] Busca por seção, sem acentos e tolerante a erros, com filtros por tag e grupo
- [x] Termo pesquisado destacado no documento
- [x] Callouts, tabelas, tarefas, notas de rodapé e blocos recolhíveis
- [x] Código com realce e botão de copiar
- [x] Diagramas (Mermaid) e fórmulas (KaTeX)
- [x] Zoom em imagens
- [x] 6 temas, modo claro/escuro e preferências de leitura
- [x] Favoritos, histórico e "continue de onde parou"
- [x] Funciona offline e pode ser instalado como aplicativo
- [x] Pronto para Docker e Vercel
