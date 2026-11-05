---
title: Instalação e deploy
description: Como rodar o projeto localmente e publicar com Docker ou na Vercel.
tags: [guia, setup, deploy]
order: 1
updated: 2026-11-05
---

# Instalação e deploy

## Requisitos

| Ferramenta | Versão mínima | Observação |
| ---------- | :-----------: | ---------- |
| Node.js    | 20.19         | LTS recomendado |
| pnpm       | 10            | a versão exata está em `packageManager` no `package.json` |
| Docker     | 24            | só para o deploy com contêiner |

:::tip pnpm automático
Rode `corepack enable` uma vez e o Node passa a usar a versão do pnpm definida no projeto.
:::

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:5173`. As alterações em `.md` aparecem na hora.

:::warning Porta ocupada
Se a porta `5173` estiver em uso, o Vite escolhe a próxima livre automaticamente.
:::

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Gera o site estático em `dist/` |
| `pnpm preview` | Serve o `dist/` localmente |
| `pnpm lint` | Verifica o código |

## Build de produção

```bash
pnpm build && pnpm preview
```

O resultado é um site estático (SPA). Qualquer hospedagem serve, desde que endereços como `/docs/...` caiam no
`index.html`. O Docker e a Vercel abaixo já vêm configurados para isso.

> O modo offline só funciona no build de produção (`pnpm preview` ou publicado), não no `pnpm dev`.

## Deploy com Docker

O `Dockerfile` faz o build com Node e serve o resultado com nginx.

```bash
docker compose up -d --build
```

O site fica em `http://localhost:8080`. Para outra porta:

```bash
PORT=3000 docker compose up -d --build
```

Sem compose:

```bash
docker build -t docfiles .
docker run -d -p 8080:80 docfiles
```

A configuração do nginx está em `docker/nginx.conf`: fallback da SPA, compressão, cache longo para `/assets/` e sem
cache para `index.html` e o service worker.

## Deploy na Vercel

Tudo está em `vercel.json`.

- **Pelo painel:** importe o repositório em vercel.com/new. Não há mais nada para configurar.
- **Pela CLI:**

```bash
pnpm dlx vercel        # preview
pnpm dlx vercel --prod # produção
```

## Outra hospedagem

Publique a pasta `dist/`, configure o fallback de rotas para `/index.html` e não sirva `sw.js` com cache longo
(senão as atualizações demoram a chegar).

### Variáveis de ambiente

Nenhuma é necessária.
