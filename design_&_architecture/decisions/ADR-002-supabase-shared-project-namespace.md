---
id: ADR-002
title: Supabase progetto condiviso con namespace isolation
status: accepted
date: 2026-05-25
wiki_pages: [supabase-integration, supabase]
epic: EP-005
---
# ADR-002 — Supabase progetto condiviso con namespace isolation

## Contesto

soli-prof e soli-projects condividono lo stesso progetto Supabase. Servono convenzioni per evitare conflitti di naming sulle tabelle [^src: raw/soli-projects-agents.md §Supabase schema].

## Decisione

- soli-prof usa il namespace `rag_*` per tutte le tabelle RAG.
- soli-projects usa tabelle non prefissate (`pm_projects`, `pm_ideas`, `pm_todos`).
- Eventuali nuovi consumer dello stesso progetto Supabase devono dichiarare un proprio prefisso.

## Conseguenze

- **Pro:** isolamento logico senza schema Postgres separati; semplice da implementare.
- **Contro:** nessun enforcement a livello DB (solo convenzione); serve audit periodico.
- **Mitigazione:** TSK-037/038/039 (audit e migration plan).

## Alternative considerate

1. **Schema Postgres separati per progetto:** isolamento forte ma complessità di gestione e costi su free tier.
2. **Istanze Supabase separate:** zero conflitti ma duplication di infra e costi.
