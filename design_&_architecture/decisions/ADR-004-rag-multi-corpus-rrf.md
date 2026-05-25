---
id: ADR-004
title: RAG multi-corpus con fusione RRF
status: accepted
date: 2026-05-25
wiki_pages: [rag-pipeline, soli-prof, soli-agent]
epic: EP-003
---
# ADR-004 — RAG multi-corpus con fusione RRF

## Contesto

soli-prof indicizza conoscenza da 13+ repository in 3 corpora distinti (ai_logs, agents_md, repo_configs). Le query devono cercare trasversalmente su tutti i corpora con ranking unificato [^src: raw/soli-prof-agents.md §RAG].

## Decisione

Adottare Reciprocal Rank Fusion (RRF, K=60) per fondere i risultati di query parallele sui 3 corpora. Embedding via Voyage, storage su Supabase pgvector. soli-agent consuma la KB via tool `search_knowledge` con POST parallele.

## Conseguenze

- **Pro:** ricerca cross-corpus senza re-indicizzazione monolitica; ranking robusto con RRF.
- **Contro:** latenza = max(latenza per corpus) + overhead fusione; soglia similarity da calibrare.
- **Mitigazione:** benchmark latenza (TSK-019); allineamento soglia (TSK-021).

## Alternative considerate

1. **Corpus unico monolitico:** semplice ma perde la granularità per-tipo (log vs config vs docs).
2. **Ricerca sequenziale (cascata):** più lento, non sfrutta parallelismo.
