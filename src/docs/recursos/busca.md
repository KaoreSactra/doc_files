---
title: Busca avançada
description: Atalhos, filtros, destaque no documento e como o índice é construído.
tags: [busca, referencia]
order: 1
updated: 2026-11-05
---

# Busca avançada

A pesquisa indexa **cada seção** de cada documento, então o resultado leva direto ao título certo.

## Atalhos

| Atalho | Ação |
| --- | --- |
| [[Ctrl+K]] | Abre/fecha a pesquisa |
| [[/]] | Abre a pesquisa |
| [[↑]] / [[↓]] | Navega pelos resultados |
| [[Enter]] | Abre o resultado |
| [[Esc]] | Fecha |

## Filtros

**Por tag:** digite `#guia` para restringir aos documentos com a tag `guia`, ou clique nos chips. Dá para combinar:
`#guia #setup instalar`.

**Por grupo:** use os chips *Em: Todos / Geral / Guia / …* para buscar só dentro de uma pasta.

## Destaque no documento

Ao abrir um resultado, todas as ocorrências do termo ficam destacadas no documento e a página rola até a primeira.
Um aviso mostra quantas foram encontradas.

:::tip Limpar o destaque
Pressione [[Esc]] com o documento aberto. O termo também fica no endereço (`?q=...`), então um link copiado leva
o destaque junto.
:::

## Ranking

Os pesos são: título da seção (3), título do documento (2), tags (1,5) e texto (1). A busca ignora acentos e tolera
pequenos erros de digitação — experimente buscar "instalaçao".

:::note
As últimas buscas ficam salvas no navegador e aparecem ao abrir a pesquisa vazia.
:::
