---
type: concept
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-agent-agents.md]
status: draft
---
# RAG Pipeline

> Pipeline di Retrieval-Augmented Generation multi-corpus: soli-prof come servizio RAG centralizzato, soli-agent come consumer principale.

## Summary

La RAG pipeline dell'ecosistema soli92 e implementata in [[soli-prof]] come servizio centralizzato. Opera su tre corpus distinti (`ai_logs`, `agents_md`, `repo_configs`) indicizzando file da tutti i repository dell'ecosistema [^src: raw/soli-prof-agents.md §RAG]. [[soli-agent]] consuma il servizio via tool `search_knowledge` con fusione Reciprocal Rank Fusion (RRF) [^src: raw/soli-agent-agents.md §Tool search_knowledge].

## Key points

- **Tre corpus**: `ai_logs` (AI_LOG.md dai repo), `agents_md` (AGENTS.md dai repo), `repo_configs` (file di configurazione) [^src: raw/soli-prof-agents.md §RAG]
- **Vector store**: [[supabase]] pgvector con embeddings Voyage [^src: raw/tech_stack.md §Stack comune]
- **Ingest**: CLI via `npm run rag:ingest` (sync), endpoint HTTP `POST /api/rag/ingest` e `POST /api/rag/ingest-stream` (SSE con progress per-repo), admin panel con UI `/admin` [^src: raw/soli-prof-agents.md §RAG]
- **Query**: `POST /api/rag/query` (singolo corpus), `queryMultipleCorpora` (RRF su N corpus, `RRF_K=60`) usato nella chat di soli-prof [^src: raw/soli-prof-agents.md §RAG]
- **Consumer soli-agent**: tre POST parallele a soli-prof, fusione RRF, stringa contesto per il modello (`lib/agent/tools/search-knowledge.ts`) [^src: raw/soli-agent-agents.md §Tool search_knowledge]
- **Re-ingest automatico**: webhook GitHub su `push` da tutti i repo verso `/api/webhooks/github` (fire-and-forget, HMAC) [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **Repository indicizzati**: soli-agent, casa-mia-be, casa-mia-fe, bachelor-party-claudiano, solids, soli-prof, soli-dm-be, soli-dm-fe, soli-dome, pippify, soli-platform, Koollector, health-wand-and-fire [^src: raw/soli-prof-agents.md §Repository indicizzati]

## Projects

| Progetto | Ruolo nella pipeline |
|----------|---------------------|
| [[soli-prof]] | Servizio RAG: ingest, query, vector store, admin panel, webhook receiver |
| [[soli-agent]] | Consumer principale via tool `search_knowledge` |
| Tutti i 13+ repo | Sorgenti dati: AGENTS.md, AI_LOG.md, file config indicizzati |

## Connections

- Related: [[cross-repo-webhooks]] — meccanismo di trigger per re-ingest automatico
- Related: [[supabase-integration]] — pgvector come vector store
- Related: [[anthropic-claude]] — LLM usato per la chat RAG-augmented di soli-prof (Haiku 3.5)
- Related: [[deployment-patterns]] — soli-prof deployato su Vercel
