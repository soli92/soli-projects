---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [koollector-agents.md]
status: draft
---
# Koollector

> Monorepo per gestione collezioni personali con API GraphQL e app mobile Expo.

## Summary

Koollector è un monorepo **npm workspaces** con due applicazioni principali: un'API GraphQL basata su Apollo + Express con database PostgreSQL (porta 4000) e un'app mobile Expo con SQLite locale e client Apollo [^src: raw/koollector-agents.md §Repo]. Il database locale è gestito tramite Docker (`npm run db:up`) e può essere reinizializzato con `npm run db:reset` [^src: raw/koollector-agents.md §Cosa fare dopo].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Runtime | Node **22+** |
| Monorepo | npm workspaces |
| API (`apps/api`) | GraphQL Apollo + Express, PostgreSQL |
| Mobile (`apps/mobile`) | Expo, SQLite, Apollo Client |
| Database dev | Docker (`docker-compose.yml`) |

[^src: raw/koollector-agents.md §Repo]

## Key integrations

- **[[soli-prof]]** — il repo è in `CORPUS_REPOS`; un webhook GitHub su `push` attiva re-ingest HMAC su Soli Prof. I test e comandi locali non dipendono da quel canale [^src: raw/koollector-agents.md §Integrazione Soli Prof].

## Commands

| Comando | Scopo |
|---------|-------|
| `npm run db:up` | Avvia database PostgreSQL (Docker) |
| `npm run db:reset` | Reset schema database |
| `npm run dev:api` | Dev server API GraphQL |
| `npm run dev:mobile` | Dev server Expo mobile |
| `npm run dev` | API + mobile insieme (`concurrently`) |
| `npm run typecheck:api` | Type-check su `apps/api` |

[^src: raw/koollector-agents.md §Comandi]

## Key files

- `README.md`, `AI_LOG.md`
- `apps/api/` — sorgente API GraphQL
- `apps/mobile/` — sorgente app Expo
- `docker-compose.yml` — configurazione database locale
- `scripts/db-init.sql` — script inizializzazione DB

[^src: raw/koollector-agents.md §File utili]

## Connections

- Related: [[soli-prof]] — indicizzato in CORPUS_REPOS per RAG; webhook push per re-ingest
- Related: [[solids]] — possibile consumer del design system per la parte mobile/UI
