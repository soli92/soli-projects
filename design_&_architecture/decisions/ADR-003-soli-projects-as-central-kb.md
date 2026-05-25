---
id: ADR-003
title: soli-projects come knowledge base centralizzata (llm-wiki++)
status: accepted
date: 2026-05-25
wiki_pages: [soli-projects]
epic: EP-002
---
# ADR-003 — soli-projects come knowledge base centralizzata

## Contesto

16 repository soli92 producono documentazione distribuita (AGENTS.md, AI_LOG.md, README.md). Non esiste un punto unico per consultare e collegare conoscenza cross-progetto [^src: raw/soli-projects-agents.md §Project overview].

## Decisione

Adottare soli-projects come KB centralizzata basata su pattern llm-wiki++ v2.11. Architettura a layer: L1 raw/ (input immutabili), L2 wiki/ (pagine LLM-owned), L3 management/ (kanban), L4 design_&_architecture/. Topologia: plan-only. I repo verticali includono soli-projects come git submodule per accesso diretto.

## Conseguenze

- **Pro:** punto unico di verità per conoscenza cross-progetto; struttura navigabile e ricercabile; piano derivato dalla wiki.
- **Contro:** overhead submodule; wiki stale se ingest non periodico; curva di apprendimento del pattern.
- **Mitigazione:** app web /wiki per navigazione; ciclo lint periodico; submodule opzionale (non bloccante).

## Alternative considerate

1. **Obsidian vault (soli-obsidian-vault):** già usato per apprendimento personale, ma non integrato con app web e non strutturato per PM.
2. **GitHub Wiki per repo:** nativo ma non cross-progetto, non programmaticamente strutturabile.
3. **Notion/Confluence:** SaaS esterni, non versionabili, non integrabili con LLM pattern.
