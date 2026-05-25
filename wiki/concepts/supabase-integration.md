---
type: concept
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-projects-agents.md, bachelor-party-claudiano-agents.md, soli-dm-fe-agents.md, soli-dm-be-agents.md]
status: draft
---
# Supabase Integration

> Uso di Supabase come backend-as-a-service trasversale: pgvector per RAG, tabelle PM, stato condiviso con Realtime, autenticazione.

## Summary

[[supabase]] e usato in modi diversi da almeno cinque progetti dell'ecosistema soli92. soli-prof lo usa come vector store pgvector per il RAG [^src: raw/tech_stack.md §Stack comune]. soli-projects condivide lo stesso progetto Supabase con namespace separati (tabelle senza prefisso vs `rag_*`) [^src: raw/soli-projects-agents.md §Supabase schema]. bachelor-party-claudiano usa la tabella `bpc_state` con Realtime per sync multi-device [^src: raw/bachelor-party-claudiano-agents.md §Stack]. soli-dm-fe usa Supabase Auth per email/password [^src: raw/soli-dm-fe-agents.md §Progetto]. soli-dm-be usa il client service role per persistenza [^src: raw/soli-dm-be-agents.md §Progetto].

## Key points

- **Shared Supabase project**: soli-prof e soli-projects condividono lo stesso progetto; soli-prof occupa il namespace `rag_*`, soli-projects usa tabelle senza prefisso [^src: raw/soli-projects-agents.md §Supabase schema]
- **pgvector + Voyage**: soli-prof usa pgvector per embeddings vettoriali con Voyage come provider di embedding [^src: raw/tech_stack.md §Stack comune]
- **Realtime**: bachelor-party-claudiano attiva `postgres_changes` su `bpc_state` per sync multi-device in tempo reale; poll lento come fallback [^src: raw/bachelor-party-claudiano-agents.md §Stack]
- **Supabase Auth**: soli-dm-fe usa email/password con OAuth configurabile in dashboard; flusso P4 di bachelor-party-claudiano usa auth con ruoli evento [^src: raw/soli-dm-fe-agents.md §Progetto]
- **Service role (server-only)**: soli-dm-be usa `SUPABASE_SERVICE_KEY` nel server, mai esposta al client [^src: raw/soli-dm-be-agents.md §Progetto]
- **Client-side vs server-side**: soli-projects espone `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` per il client, `SUPABASE_SERVICE_ROLE_KEY` solo server [^src: raw/soli-projects-agents.md §Supabase schema]
- **Tabella `bpc_state`**: chiavi JSON come `bp:doneTasks`, `bp:quests`; richiede replication abilitata per Realtime [^src: raw/bachelor-party-claudiano-agents.md §Stack]

## Projects

| Progetto | Uso Supabase |
|----------|-------------|
| [[soli-prof]] | pgvector per RAG multi-corpus (embeddings Voyage) |
| [[soli-projects]] | Tabelle PM (shared project con soli-prof, namespace separato) |
| [[bachelor-party-claudiano]] | `bpc_state` + Realtime per sync gruppo, Auth P4 con ruoli |
| [[soli-dm-fe]] | Supabase Auth (email/password, OAuth) |
| [[soli-dm-be]] | Client service role per persistenza (campagne, personaggi, wiki SRD cache) |
| [[pippify]] | Backend Express con Supabase + R2 |

## Connections

- Related: [[supabase]] — entity page del prodotto
- Related: [[rag-pipeline]] — pgvector come componente chiave del RAG
- Related: [[deployment-patterns]] — i progetti che usano Supabase sono deployati su Vercel/Render
- Related: [[cross-repo-webhooks]] — webhook push per re-ingest che popola pgvector
