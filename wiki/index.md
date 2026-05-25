---
type: overview
created: 2026-05-25
updated: 2026-05-25
sources: []
status: draft
---
# Soli Projects — Knowledge Base

> Knowledge base centralizzata per tutti i repository soli92, costruita sul pattern llm-wiki (Karpathy) esteso con project management agentico.

## Scope

Questa wiki indicizza, documenta e collega la conoscenza distribuita nei 16 repository dell'ecosistema soli92: architettura, convenzioni, decisioni, dipendenze, integrazioni.

## Progetti indicizzati

- [[soli-agent]] — AI dev assistant (Web Chat PWA + Telegram Bot)
- [[soli-prof]] — AI tutor personale (RAG multi-corpus)
- [[soli-projects]] — Questo repo (portfolio + AI copilot + KB)
- [[soli-platform]] — Monorepo servizi (auth, notification, gateway)
- [[solids]] — Design system (token, CSS, Storybook, registry shadcn)
- [[koollector]] — Monorepo collezionismo (GraphQL API + Expo mobile)
- [[soli-dome]] — Portale app / home links
- [[pippify]] — YouTube player (Next + CRA + Express)
- [[bachelor-party-claudiano]] — App weekend condivisa (Vite + React + Supabase)
- [[casa-mia-fe]] — Frontend casa (Next.js 14)
- [[casa-mia-be]] — Backend casa (Express + Prisma)
- [[soli-dm-fe]] — Dungeon Master frontend (Next.js 15)
- [[soli-dm-be]] — Dungeon Master backend (Express + Supabase)
- [[llm-wiki-template]] — Template LLM wiki (Obsidian)
- [[soli-obsidian-vault]] — Vault Obsidian personale
- [[soli-multi-agents-factory]] — Meta-framework agentico

## Navigazione

### Sources (`wiki/sources/`) — 16 pagine

| Progetto | Pagina |
|---|---|
| Soli Agent | [[soli-agent]] |
| Soli Prof | [[soli-prof]] |
| Soli Projects | [[soli-projects]] |
| Soli Platform | [[soli-platform]] |
| SoliDS | [[solids]] |
| Koollector | [[koollector]] |
| Soli Dome | [[soli-dome]] |
| Pippify | [[pippify]] |
| Bachelor Party Claudiano | [[bachelor-party-claudiano]] |
| Casa Mia FE | [[casa-mia-fe]] |
| Casa Mia BE | [[casa-mia-be]] |
| Soli DM FE | [[soli-dm-fe]] |
| Soli DM BE | [[soli-dm-be]] |
| LLM Wiki Template | [[llm-wiki-template]] |
| Soli Obsidian Vault | [[soli-obsidian-vault]] |
| Soli Multi-Agents Factory | [[soli-multi-agents-factory]] |

### Concepts (`wiki/concepts/`) — 6 pagine

- [[design-system-solids]] — @soli92/solids: token, CSS, Tailwind preset, Storybook, temi, registry
- [[rag-pipeline]] — RAG multi-corpus: soli-prof + soli-agent, Voyage embeddings, RRF
- [[deployment-patterns]] — Vercel, Render, Oracle, GitHub Actions CI
- [[supabase-integration]] — pgvector, Auth, Realtime, shared project, namespace isolation
- [[cross-repo-webhooks]] — Webhook push GitHub → soli-prof per re-ingest automatico HMAC
- [[pwa-patterns]] — Progressive Web App patterns (manifest, service worker, icone)

### Entities (`wiki/entities/`) — 3 pagine

- [[vercel]] — Piattaforma hosting frontend/fullstack
- [[supabase]] — Backend-as-a-service (DB, Auth, Realtime, pgvector)
- [[anthropic-claude]] — LLM primario dell'ecosistema (Haiku, Sonnet, Opus)

### Syntheses, Runbooks, Query, Lint

- `wiki/syntheses/` — risposte cross-source consolidate (da popolare)
- `wiki/runbooks/` — playbook operativi (da popolare)
- `wiki/query/` — risposte a domande persistite
- `wiki/lint/` — report di health check

## Layer attivi

| Layer | Path | Stato |
|---|---|---|
| L1 (raw) | `raw/` | 46 file sincronizzati da 16 repo |
| L2 (wiki) | `wiki/` | 25 pagine (16 source + 6 concept + 3 entity) |
| L3 (management) | `management/` | Da popolare |
| L4 (architecture) | `design_&_architecture/` | Da popolare |
| L5 (code) | — | Non attivo (plan-only) |
