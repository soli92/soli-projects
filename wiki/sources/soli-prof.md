---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-prof-agents.md]
status: draft
---
# Soli Prof

> Tutor AI personale per l'apprendimento di AI engineering, con sistema RAG multi-corpus, Generative UI e admin panel per re-ingest della knowledge base.

## Summary

Soli Prof è un'applicazione web **Next.js 16** (React 19, TypeScript 5) che funge da **tutor AI personale** per un senior frontend developer che sta imparando AI engineering [^src: raw/soli-prof-agents.md §Panoramica progetto]. Risponde in italiano con risposte brevi, concrete e pratiche. Il backend usa **Anthropic Claude Haiku 3.5** con un sistema **RAG multi-corpus** (`ai_logs`, `agents_md`, `repo_configs`) basato su Supabase pgvector e Voyage per gli embeddings [^src: raw/soli-prof-agents.md §RAG]. La chat implementa **Generative UI** con protocollo NDJSON e tool come `show_tutor_focus_card` [^src: raw/soli-prof-agents.md §API endpoint: POST /api/chat].

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 + `@soli92/solids` ^1.14.1 preset + brand assets |
| **Backend** | Next.js API routes (streaming SSE, NDJSON) |
| **LLM** | Anthropic Claude Haiku 3.5 |
| **Embeddings** | Voyage AI (`VOYAGE_API_KEY`) |
| **Vector store** | Supabase pgvector |
| **Testing** | Vitest 3.x (unit su lib, hooks, webhook route) |
| **Deploy** | Vercel (auto da `main`) |

[^src: raw/soli-prof-agents.md §Stack tecnico]

## RAG multi-corpus

Due moduli RAG nel repo [^src: raw/soli-prof-agents.md §RAG]:

| Modulo | Stato |
|--------|-------|
| `lib/rag/` | Legacy, non usato dalla chat |
| `lib/rag-service/` | Attivo: multi-corpus, RRF (`RRF_K=60`), ingest con progress SSE |

Repository indicizzati in `CORPUS_REPOS` (`lib/rag-service/config.ts`): [[soli-agent]], [[casa-mia-be]], [[casa-mia-fe]], [[bachelor-party-claudiano]], [[solids]], soli-prof stesso, [[soli-dm-be]], [[soli-dm-fe]], [[soli-dome]], [[pippify]], [[soli-platform]], [[koollector]], health-wand-and-fire [^src: raw/soli-prof-agents.md §Repository indicizzati].

## Key integrations

- **[[soli-agent]]** — consuma l'API RAG (`POST /api/rag/query`) tramite il tool `search_knowledge`; la chiave `RAG_API_KEY` protegge l'accesso [^src: raw/soli-prof-agents.md §POST /api/rag/query].
- **[[solids]]** — design system per lo stile dell'interfaccia [^src: raw/soli-prof-agents.md §Stack tecnico].
- **[[soli-projects]]** — condivide lo stesso progetto Supabase (namespace tabelle separato: `rag_*` per soli-prof) [^src: raw/soli-prof-agents.md §Repo GitHub].
- **GitHub webhooks** — 13 repo configurati con webhook `push` verso `/api/webhooks/github` per re-ingest automatico (HMAC-SHA256 con `GITHUB_WEBHOOK_SECRET`); script `scripts/setup-webhooks.sh` per registrazione [^src: raw/soli-prof-agents.md §POST /api/webhooks/github].

## Commands

`npm run dev` · `npm test` · `npm run test:watch` · `npm run type-check` · `npm run build` · `npm run rag:ingest` · `npm run rag:ingest -- ai_logs` · `npm run rag:ingest -- agents_md` · `npm run rag:ingest -- repo_configs` [^src: raw/soli-prof-agents.md §CLI ingest]

## Key files

- `app/api/chat/route.ts` — endpoint chat SSE con RAG + Generative UI
- `app/api/rag/query/route.ts` — retrieval multi-corpus (protetto da API key)
- `app/api/rag/ingest/route.ts` — ingest sincrono
- `app/api/rag/ingest-stream/route.ts` — ingest SSE con progress per-repo
- `app/api/webhooks/github/route.ts` — webhook GitHub per re-ingest su push
- `app/admin/page.tsx` — pannello admin (login con password + IngestPanel)
- `lib/rag-service/` — modulo RAG multi-corpus (barrel `index.ts`)
- `lib/generative-ui/` — registry render tool, protocollo NDJSON
- `lib/prompts.ts` — system prompt del tutor
- `lib/admin-session.ts` — sessioni in-memory + cookie httpOnly
- `components/chat-view.tsx` — client chat con SSE buffer + NDJSON parser

[^src: raw/soli-prof-agents.md §Struttura directory]

## Connections

- Related: [[soli-agent]] — consumer principale dell'API RAG
- Related: [[solids]] — design system per UI e branding
- Related: [[soli-projects]] — stessa istanza Supabase, namespace separati
