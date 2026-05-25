---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-agent-agents.md]
status: draft
---
# Soli Agent

> Assistente AI per lo sviluppo, disponibile come Web Chat PWA e Telegram Bot, costruito su Next.js 16 con supporto multi-modello e sub-agent specializzati.

## Summary

Soli Agent è un'applicazione **Next.js 16** (TypeScript) che funge da assistente AI per lo sviluppo software. Espone una **Web Chat PWA** e un **Telegram Bot**, entrambi con UI e prompt in italiano [^src: raw/soli-agent-agents.md §Project]. L'agente runtime supporta **sub-agent paralleli** con ruoli specializzati (frontend, backend, devops, tester, code-reviewer, graphic-designer, ecc.), orchestrazione con coda e timeout, e persistenza dello stato su **Redis** [^src: raw/soli-agent-agents.md §Sub-agent roles]. Include un sistema di **model routing** con circuit breaker, prompt cache Anthropic e metriche di costo per sessione [^src: raw/soli-agent-agents.md §Model routing / circuit breaker].

## Stack

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 16, TypeScript, App Router |
| **Build** | webpack (non Turbopack) |
| **LLM** | Anthropic Claude (SDK `@anthropic-ai/sdk`), OpenAI, Gemini, OpenCode |
| **Sub-agent** | `spawn_sub_agent` con ruoli tipizzati, Redis per stato |
| **Image gen** | OpenAI (`generate_image`), fal.ai FLUX (`generate_image_hf`), Recraft V3 SVG |
| **RAG** | Tool `search_knowledge` → [[soli-prof]] API (`/api/rag/query`, RRF) |
| **Testing** | Vitest, Playwright (E2E opzionale), eval suite (`npm run eval`) |
| **Styling** | `@soli92/solids` ^1.14.1 (font in `app/layout.tsx`) |
| **Deploy** | Vercel |

[^src: raw/soli-agent-agents.md §Project] [^src: raw/soli-agent-agents.md §Commands]

## Key integrations

- **[[soli-prof]]** — il tool `search_knowledge` esegue tre POST parallele verso `/api/rag/query` di Soli Prof (corpus `ai_logs`, `agents_md`, `repo_configs`) con fusione RRF; la chiave `SOLI_PROF_RAG_API_KEY` deve coincidere con `RAG_API_KEY` su Soli Prof [^src: raw/soli-agent-agents.md §Tool search_knowledge].
- **[[solids]]** — design system per la UI web; pacchetto `@soli92/solids` ^1.14.1, font stack in layout [^src: raw/soli-agent-agents.md §Project].
- **GitHub repos** — l'agente runtime legge `README.md` di ogni repo prima di modifiche ampie, tramite tool `read_github_file` / `list_github_files` [^src: raw/soli-agent-agents.md §GitHub repos].
- **Soli Prof webhook** — il repo è in `CORPUS_REPOS` di Soli Prof; un webhook `push` attiva re-ingest automatico (HMAC) [^src: raw/soli-agent-agents.md §Tool search_knowledge].

## Commands

`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:e2e` · `npm run build` · `npm run repomix` · `npm run eval` [^src: raw/soli-agent-agents.md §Commands]

## Key files

- `lib/agent/prompts.ts` — system prompt (variante concise disponibile)
- `lib/agent/run-agent.ts` — loop principale agente
- `lib/agent/tools/definitions.ts` — definizioni tool + ruoli sub-agent
- `lib/agent/tools/search-knowledge.ts` — RAG Soli Prof + RRF
- `lib/agent/tools/dry-run.ts` — modalità dry-run per eval/CI
- `lib/anthropic-usage.ts` — metriche token e costi
- `lib/anthropic-cache.ts` — prompt cache Anthropic
- `lib/chat-usage.ts` — payload usage per stream
- `app/api/chat/route.ts` — endpoint SSE chat
- `app/page.tsx` — UI chat con AbortController, Markdown rendering
- `app/components/AgentSettingsPanel.tsx` — impostazioni agente (profilo, costi, metriche)

[^src: raw/soli-agent-agents.md §Useful files]

## Connections

- Related: [[soli-prof]] — fornitore della knowledge base RAG consumata dal tool `search_knowledge`
- Related: [[solids]] — design system condiviso per tutta la UI
- Related: [[soli-projects]] — questo repo è indicizzato nella KB centralizzata
