---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-projects-agents.md]
status: draft
---
# Soli Projects

> Hub di gestione cross-progetto con AI copilot e knowledge base centralizzata LLM Wiki (pattern llm-wiki++ v2.11) per i 18 repository soli92.

## Summary

Soli Projects è un'applicazione **Next.js 16** (React 19, TypeScript strict) che combina **portfolio personale**, **AI copilot** (Claude via SDK Anthropic) e **knowledge base centralizzata** costruita sul pattern **llm-wiki++** v2.11 derivato da soli-multi-agents-factory [^src: raw/soli-projects-agents.md §Project overview]. La KB segue una topologia **plan-only** a 5 layer: `raw/` (sorgenti immutabili), `wiki/` (wiki strutturata), `management/` (epiche/storie/task), `design_&_architecture/` (ADR), e L5 non attivo [^src: raw/soli-projects-agents.md §LLM Wiki KB]. Il database Supabase è condiviso con [[soli-prof]], con namespace separati [^src: raw/soli-projects-agents.md §Supabase schema].

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 (strict) |
| **Styling** | Tailwind CSS 3.4 + `@soli92/solids` ^1.14.1 preset + CSS variables |
| **LLM** | Anthropic Claude (`@anthropic-ai/sdk`) |
| **Database** | Supabase (progetto condiviso con soli-prof, tabelle senza prefisso) |
| **Testing** | Vitest 3 (jsdom) |
| **KB Pattern** | llm-wiki++ v2.11 (plan-only, Cursor adapter) |
| **Deploy** | Vercel (auto-deploy da `main`) |

[^src: raw/soli-projects-agents.md §Stack]

## Topologia wiki

| Layer | Path | Contenuto |
|-------|------|-----------|
| L1 | `raw/` | Sorgenti immutabili (AGENTS.md, AI_LOG.md, README.md dai repo) |
| L2 | `wiki/` | Wiki strutturata con citazioni e wikilink |
| L3 | `management/` | Epiche, storie, task per consumo umano |
| L4 | `design_&_architecture/` | API specs, DB schemas, ADR |
| L5 | — | Non attivo (plan-only) |

[^src: raw/soli-projects-agents.md §Topology: plan-only]

I ruoli PATTERN §2 sono implementati come `.cursor/rules/` (identità) e `.cursor/skills/` (procedure): orchestrator, wiki-keeper, sync-docs, product-manager, lead-architect, tpm, wiki-query, wiki-lint [^src: raw/soli-projects-agents.md §Adapter Cursor].

## Key integrations

- **[[soli-prof]]** — condivide lo stesso progetto Supabase (soli-prof usa namespace `rag_*`); il repo è anche in `CORPUS_REPOS` di Soli Prof per re-ingest via webhook `push` [^src: raw/soli-projects-agents.md §Supabase schema] [^src: raw/soli-projects-agents.md §Soli Prof integration].
- **[[solids]]** — design system per UI; pacchetto `@soli92/solids` ^1.14.1 [^src: raw/soli-projects-agents.md §Stack].
- **soli-multi-agents-factory** — sorgente del pattern llm-wiki++ v2.11 e del contratto `PATTERN.md` [^src: raw/soli-projects-agents.md §Pattern].
- **Tutti i 18 repo** — indicizzati nella KB come sorgenti: [[soli-agent]], [[soli-prof]], [[soli-platform]], [[solids]], [[koollector]], [[soli-dome]], [[pippify]], [[bachelor-party-claudiano]], [[casa-mia-fe]], [[casa-mia-be]], [[soli-dm-fe]], [[soli-dm-be]], [[llm-wiki-template]], soli-obsidian-vault, soli-multi-agents-factory, [[agentic-value-investor-application]], [[soli-boy]] [^src: raw/soli-projects-agents.md §Cross-project scope].
- **Git submodule** — gli altri repo includeranno soli-projects come submodule per accedere a `wiki/`, `management/` e `memory/` [^src: raw/soli-projects-agents.md §Git submodule per i consumer].

## Commands

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run type-check` · `npm test` · `npm run test:watch` [^src: raw/soli-projects-agents.md §Commands]

## Key files

- `PATTERN.md` — contratto universale agent-agnostic v2.11
- `factory.config.yaml` — configurazione factory (topology, routing, scheduler)
- [[index]] — overview KB + navigazione
- [[log]] — operation log (append-only)
- [[gaps]] — feedback loop gap
- `management/roadmap.md` — release planning cross-progetto
- `management/questions.md` — gate domande bloccanti
- `app/page.tsx` — home page (scaffold placeholder)
- `app/layout.tsx` — root layout, Google Fonts, SoliDS CSS
- `lib/solids-package.test.ts` — validazione range `@soli92/solids`

[^src: raw/soli-projects-agents.md §Key files]

## Connections

- Related: [[soli-prof]] — stessa istanza Supabase, provider RAG per l'ecosistema
- Related: [[soli-agent]] — consumer della KB via submodule; indicizzato come sorgente
- Related: [[solids]] — design system condiviso
