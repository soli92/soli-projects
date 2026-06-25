---
type: overview
created: 2026-05-25
updated: 2026-06-25
sources: []
status: draft
---
# Soli Projects — Knowledge Base

> Knowledge base centralizzata per tutti i repository soli92, costruita sul pattern llm-wiki (Karpathy) esteso con project management agentico.

## Scope

Questa wiki indicizza, documenta e collega la conoscenza distribuita nei 18 repository dell'ecosistema soli92 (incluse collaborazioni esterne): architettura, convenzioni, decisioni, dipendenze, integrazioni.

## Progetti indicizzati

- [[soli-agent]] — AI dev assistant (Web Chat PWA + Telegram Bot)
- [[soli-prof]] — AI tutor personale (RAG multi-corpus)
- [[soli-projects]] — Questo repo (portfolio + AI copilot + KB)
- [[soli-platform]] — Monorepo servizi (auth, notification, gateway)
- [[solids]] — Design system (token, CSS, Storybook, registry shadcn)
- [[koollector]] — Monorepo collezionismo (GraphQL API + Expo mobile)
- [[soli-dome]] — Portale app / home links
- [[soli-boy]] — Emulatore multipiattaforma GB/GBC/GBA + arcade (web/desktop/mobile)
- [[pippify]] — YouTube player (Next + CRA + Express)
- [[bachelor-party-claudiano]] — App weekend condivisa (Vite + React + Supabase)
- [[casa-mia-fe]] — Frontend casa (Next.js 14)
- [[casa-mia-be]] — Backend casa (Express + Prisma)
- [[soli-dm-fe]] — Dungeon Master frontend (Next.js 15)
- [[soli-dm-be]] — Dungeon Master backend (Express + Supabase)
- [[llm-wiki-template]] — Template LLM wiki (Obsidian)
- [[soli-obsidian-vault]] — Vault Obsidian personale
- [[soli-multi-agents-factory]] — Meta-framework agentico
- [[agentic-value-investor-application]] — Value investing multi-agent (collaborazione marcociullo86) **[read-only]**

### Nota: collaborazioni esterne

I repo marcati **[read-only]** sono collaborazioni non soli92-owned. soli-projects li indicizza nella wiki e ne traccia il lavoro nel kanban, ma non scrive verso di essi (niente directives, submodule push, webhook RAG). Il flusso di ingest e manuale (sync raw/) anziche automatico.

## Navigazione

### Sources (`wiki/sources/`) — 18 pagine

| Progetto | Pagina |
|---|---|
| Soli Agent | [[soli-agent]] |
| Soli Prof | [[soli-prof]] |
| Soli Projects | [[soli-projects]] |
| Soli Platform | [[soli-platform]] |
| SoliDS | [[solids]] |
| Koollector | [[koollector]] |
| Soli Dome | [[soli-dome]] |
| Soli Boy | [[soli-boy]] |
| Pippify | [[pippify]] |
| Bachelor Party Claudiano | [[bachelor-party-claudiano]] |
| Casa Mia FE | [[casa-mia-fe]] |
| Casa Mia BE | [[casa-mia-be]] |
| Soli DM FE | [[soli-dm-fe]] |
| Soli DM BE | [[soli-dm-be]] |
| LLM Wiki Template | [[llm-wiki-template]] |
| Soli Obsidian Vault | [[soli-obsidian-vault]] |
| Soli Multi-Agents Factory | [[soli-multi-agents-factory]] |
| Agentic Value Investor | [[agentic-value-investor-application]] |

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

### Runbooks (`wiki/runbooks/`) — 3 runbook

- [[deploy-vercel]] — Deploy frontend/fullstack su Vercel (auto-deploy da `main`, fallback CLI)
- [[rag-ingest]] — Ingest corpus RAG soli-prof (CLI, HTTP, admin panel, webhook GitHub)
- [[npm-release]] — Release `@soli92/solids` su npm tramite `semantic-release` e GitHub Actions

### Syntheses (`wiki/syntheses/`) — 3 pagine

- [[auth-patterns-comparison]] — Confronto approcci auth cross-repo (HMAC, Supabase Auth, assenza di auth)
- [[state-management-patterns]] — Stato condiviso e pattern di stato (Redis, IndexedDB, Supabase Realtime, Server Components)
- [[testing-strategies]] — Approcci test per tipo di progetto (Vitest, Playwright, eval suite AI, factory gate)

### Query, Lint
- `wiki/query/` — risposte a domande persistite
- `wiki/lint/` — report di health check

## Layer attivi

| Layer | Path | Stato |
|---|---|---|
| L1 (raw) | `raw/` | 49 file sincronizzati da 18 repo |
| L2 (wiki) | `wiki/` | 33 pagine (18 source + 6 concept + 3 entity + 3 runbook + 3 synthesis) |
| L3 (management) | `management/` | 6 epiche, 18 storie, 54 task (kanban) + roadmap |
| L4 (architecture) | `design_&_architecture/` | 5 ADR (decisions) |
| L5 (code) | — | Non attivo (plan-only) |
| memory | `memory/` | 1 record episodico |

## Management (L3) — Epiche

| Epica | Titolo | Priorità | Storie | Task |
|---|---|---|---|---|
| EP-001 | Consolidamento Design System SoliDS | high | 3 | 9 |
| EP-002 | Knowledge Base Centralizzata | high | 3 | 9 |
| EP-003 | RAG & AI Intelligence Pipeline | medium | 3 | 9 |
| EP-004 | Infrastruttura & CI/CD | medium | 3 | 9 |
| EP-005 | Supabase: Schema, Auth & Realtime | medium | 3 | 9 |
| EP-006 | PWA & Cross-device Experience | low | 3 | 9 |

## Architecture (L4) — Decisioni

- ADR-001: @soli92/solids come design system condiviso
- ADR-002: Supabase condiviso con namespace isolation
- ADR-003: soli-projects come KB centralizzata (llm-wiki++)
- ADR-004: RAG multi-corpus con fusione RRF
- ADR-005: Deploy multi-provider (Vercel, Render, Oracle ARM)
