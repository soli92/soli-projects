---
type: concept
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-agent-agents.md, soli-dm-fe-agents.md, soli-dm-be-agents.md, soli-platform-agents.md, soli-dome-agents.md, casa-mia-be-agents.md]
status: draft
---
# Deployment Patterns

> Strategie di deploy nell'ecosistema soli92: Vercel per frontend/fullstack, Render per backend puri, GitHub Actions per CI.

## Summary

L'ecosistema soli92 adotta un pattern di deploy uniforme: i progetti frontend e fullstack vanno su [[vercel]] con auto-deploy dal branch `main`, i backend puri su Render, e GitHub Actions gestisce la CI (lint, type-check, test, build) [^src: raw/tech_stack.md §Stack comune]. Tutti i repo usano Node 22+ e npm con `package-lock.json` committato [^src: raw/tech_stack.md §Vincoli inviolabili].

## Key points

- **Vercel auto-deploy da `main`**: tutti i frontend e fullstack Next.js [^src: raw/tech_stack.md §Vincoli inviolabili]
- **Render per backend Express**: soli-dm-be deployato su Render con `scripts/start.cjs` e build `tsc` [^src: raw/soli-dm-be-agents.md §Deploy]
- **soli-platform su Oracle / GHCR**: monorepo con immagini Docker su GitHub Container Registry, deploy su Oracle Free Tier ARM [^src: raw/soli-platform-agents.md §Repo]
- **casa-mia-be**: Express con Prisma, deploy separato dal frontend [^src: raw/casa-mia-be-agents.md §Progetto]
- **GitHub Actions CI standard**: checkout, setup Node 22, npm ci, lint, type-check, test, build [^src: raw/soli-prof-agents.md §CI/CD]
- **webpack, non Turbopack**: soli-agent usa esplicitamente `--webpack` per dev e production [^src: raw/soli-agent-agents.md §Rules for agents]
- **Render root directory**: va lasciata vuota (root del repo); altrimenti i path `dist/` non coincidono [^src: raw/soli-dm-be-agents.md §Deploy]

## Projects

| Progetto | Piattaforma | Note |
|----------|-------------|------|
| [[soli-agent]] | [[vercel]] | Next.js 16, PWA, webpack |
| [[soli-prof]] | [[vercel]] | Next.js 16, SSE streaming, RAG |
| [[soli-projects]] | [[vercel]] | Next.js 16, KB centralizzata |
| [[soli-dome]] | [[vercel]] | Next.js 16, PWA |
| [[soli-dm-fe]] | [[vercel]] | Next.js 15, PWA, URL: soli-dm-fe.vercel.app |
| [[casa-mia-fe]] | [[vercel]] | Next.js 14 |
| [[soli-dm-be]] | Render | Express 4, TS, `scripts/start.cjs` |
| [[casa-mia-be]] | Deploy separato | Express, Prisma, WebSocket |
| [[soli-platform]] | Oracle / GHCR | Docker multi-arch, monorepo |
| [[bachelor-party-claudiano]] | Hosting collegato a GitHub | Vite, auto-deploy da `main` |

## Connections

- Related: [[vercel]] — piattaforma di hosting primaria per frontend
- Related: [[supabase-integration]] — database per diversi progetti deployati
- Related: [[cross-repo-webhooks]] — webhook push per automazioni post-deploy
- Related: [[design-system-solids]] — consumato a build-time da tutti i frontend deployati
