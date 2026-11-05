---
title: Como contribuir
description: Como escrever um documento novo e enviá-lo para quem mantém a documentação.
tags: [guia, contribuir]
order: 3
updated: 2026-11-05
---

# Como contribuir

A forma mais comum de contribuir é com **conteúdo**: um documento novo ou a correção de um existente.

## Passo a passo

1. Faça um **fork** do repositório e rode o projeto ([instalação](./instalacao.md)).
2. Crie o arquivo em `src/docs/`, na pasta do grupo certo (ou na raiz, para o grupo **Geral**).
3. Escreva usando a [sintaxe suportada](./sintaxe.md) e confira o resultado com `pnpm dev`.
4. Envie: abra um **pull request** ou mande o arquivo `.md` para quem mantém o projeto.

:::note Só o .md já basta
Para conteúdo, você não precisa mexer em código. O arquivo `.md` sozinho é suficiente — se ele tiver imagens,
envie-as junto.
:::

## Modelo de documento

```markdown
---
title: Nome do documento
description: Uma frase sobre o que ele explica.
tags: [guia]
order: 10
updated: 2026-11-05
---

# Nome do documento

Parágrafo de abertura: o que a pessoa vai aprender aqui.

## Primeira seção

Conteúdo...
```

## Boas práticas

- **Nome do arquivo** em minúsculas e com hífens: `primeiros-passos.md`. Ele vira o endereço da página.
- **Um `#` título** por documento; use `##` e `###` para as seções — são elas que aparecem no índice e na busca.
- **`description`** curta: aparece nos cards da página inicial e nas prévias de link.
- **`tags`** reaproveitando as que já existem, para os filtros da busca continuarem úteis.
- **Links internos** relativos (`./outro.md#secao`), para funcionarem no site e no GitHub.
- **Imagens** em `public/` e referenciadas com caminho absoluto: `![Descrição](/minha-imagem.png)`.
- Sempre escreva o **texto alternativo** das imagens: ele vira a legenda no zoom.

## Contribuindo com código

Rode antes de abrir o pull request:

```bash
pnpm lint
pnpm build
```
