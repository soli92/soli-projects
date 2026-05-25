---
type: entity-product
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-projects-agents.md, bachelor-party-claudiano-agents.md, soli-dm-fe-agents.md, soli-dm-be-agents.md, pippify-agents.md]
status: draft
---
# Supabase

> Backend-as-a-service open source usato nell'ecosistema soli92 per database PostgreSQL, pgvector, autenticazione e Realtime.

## Usage in ecosystem

Supabase e adottato da almeno sei progetti soli92 con usi diversificati: database relazionale, vector store, autenticazione email/password e sync real-time [^src: raw/tech_stack.md §Stack comune].

| Progetto | Funzionalita Supabase usate |
|----------|----------------------------|
| [[soli-prof]] | pgvector per RAG (embeddings Voyage), tabelle `rag_*` |
| [[soli-projects]] | Tabelle PM (no prefisso, shared project con soli-prof) |
| [[bachelor-party-claudiano]] | `bpc_state` con Realtime (`postgres_changes`), Auth P4 |
| [[soli-dm-fe]] | Supabase Auth (email/password, OAuth configurabile) |
| [[soli-dm-be]] | Client service role, tabelle campagne/personaggi, `wiki_srd_cache` |
| [[pippify]] | Backend Express con Supabase + R2 |

- **Shared project**: soli-prof e soli-projects condividono lo stesso progetto Supabase con namespace separati per evitare conflitti [^src: raw/soli-projects-agents.md §Supabase schema]
- **pgvector**: estensione PostgreSQL per ricerca vettoriale, usata dal modulo RAG di soli-prof con provider Voyage per gli embeddings [^src: raw/tech_stack.md §Stack comune]
- **Realtime**: bachelor-party-claudiano attiva replication su `bpc_state` per sincronizzazione multi-device via `postgres_changes` [^src: raw/bachelor-party-claudiano-agents.md §Stack]
- **Auth**: soli-dm-fe usa Supabase Auth per registrazione e login; bachelor-party-claudiano ha un flusso P4 con auth email e ruoli evento (`admin`, `groom`, `participant`) [^src: raw/soli-dm-fe-agents.md §Progetto]
- **Service key mai al client**: regola esplicita in soli-dm-be e soli-prof [^src: raw/soli-dm-be-agents.md §Progetto]

## Connections

- Related: [[supabase-integration]] — concept page con dettaglio d'uso per progetto
- Related: [[rag-pipeline]] — pgvector come vector store della pipeline RAG
- Related: [[vercel]] — i progetti che usano Supabase sono deployati su Vercel
- Related: [[deployment-patterns]] — Supabase come componente infrastrutturale cross-progetto
