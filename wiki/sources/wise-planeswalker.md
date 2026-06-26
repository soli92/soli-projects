---
type: source
created: 2026-06-26
updated: 2026-06-26
sources: []
status: draft
---
# Wise Planeswalker

> Knowledge base strutturata su Magic: The Gathering, costruita come Agentic Factory llm-wiki++ v2.23 per alimentare un sistema LLM/RAG sul gioco.

## Summary

Wise Planeswalker è una knowledge base dedicata a Magic: The Gathering, progettata per l'ingestione da parte di LLM via RAG. Il repo è gestito come Agentic Factory llm-wiki++ v2.23 con adapter Claude Code (`.claude/`) e topology `full-stack-agents`. La wiki contiene 13 pagine di concetti MTG (panoramica, mana, zone di gioco, struttura del turno, tipi di carta, combattimento, ruota dei colori, formati, costruzione mazzo, pila/priorità/abilità, layer system, keyword, schede keyword) derivate da raw sources bilingue (italiano con termini canonici inglesi tra parentesi). Il repo include [[koollector]] come submodule in `code_repos/`, suggerendo un futuro utilizzo della KB in contesti di collezionismo o trading card.

## Stack

| Layer | Tecnologia |
|-------|------------|
| Linguaggio principale | Shell (script di ingest/build) |
| Elaborazione | Python |
| Web/tooling | JavaScript |
| Pattern factory | llm-wiki++ v2.23 |
| Adapter runtime | Claude Code (`.claude/`) |
| Submodule | `code_repos/koollector` ([[koollector]]) |

## Architettura wiki

- **Raw sources** (`raw/`): 3 file di input MTG bilingue — `mtg_knowledge_base.md` (KB fondamenta v0.1), `mtg_schede_keyword.md` (schede autoconsistenti per ogni keyword v1.0), `mtg_sistema_livelli.md` (layer system effetti continui v1.0).
- **Wiki concepts** (`wiki/concepts/`): 13 pagine derivate dai raw — `panoramica-del-gioco.md`, `mana-e-costi.md`, `zone-di-gioco.md`, `struttura-del-turno.md`, `tipi-di-carta.md`, `combattimento.md`, `ruota-dei-colori.md`, `formati-di-gioco.md`, `costruzione-mazzo.md`, `pila-priorita-abilita.md`, `layer-system.md`, `keyword.md`, `keyword-schede.md`.
- **Management**: kanban in `management/kanban/`.
- **Nessun AGENTS.md né AI_LOG.md** — non è attualmente indicizzato in soli-prof CORPUS_REPOS.

## Key integrations

- **[[koollector]]** — submodule in `code_repos/koollector`; suggerisce integrazione futura tra KB MTG e piattaforma di collezionismo.

## Stato

- Bootstrap: 2026-06-25 (factory v2.23 scaffoldata)
- Primo ingest: 2026-06-25 (3 raw sources → 13 wiki concept pages)
- Nessun CI/CD configurato al 2026-06-26.
- Nessun deploy attivo al 2026-06-26.

## Open questions

- Quale sarà il consumer della KB? (RAG su soli-prof? endpoint dedicato? CLI?)
- Il submodule koollector implica un'integrazione prezzi/carte in corso?
- Quando sarà aggiunto AGENTS.md per l'indicizzazione in soli-prof CORPUS_REPOS?
