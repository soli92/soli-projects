---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-obsidian-vault-agents.md]
status: draft
---
# Soli Obsidian Vault

> Vault Obsidian personale di soli92, istanza reale del pattern LLM Wiki con supporto multimodale.

## Summary

soli-obsidian-vault e il vault Obsidian personale che implementa il pattern [[llm-wiki-template]] in un contesto di ricerca. Usa la variante `research-project` e aggiunge il supporto per ingest multimodale: immagini, PDF e file Office vengono processati automaticamente come sorgenti di prima classe [^src: raw/soli-obsidian-vault-agents.md §3.1]. Il vault e progettato per sync multi-device via Git, con file `.obsidian/` leggeri tracciati e plugin/cache esclusi [^src: raw/soli-obsidian-vault-agents.md §1].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Editor | Obsidian |
| Sync | Git (multi-device) |
| Pattern | LLM Wiki (variante research-project) |
| Adapter | Claude Code (`CLAUDE.md`), Cursor (`.cursor/rules/`, `.cursor/skills/`) |

## Differenze dal template base

- **Ingest multimodale**: il prompt `prompts/ingest-multimodal.md` si applica automaticamente per ogni sorgente non-Markdown sotto `raw/` (immagini, PDF, Office) senza trigger separato dall'umano [^src: raw/soli-obsidian-vault-agents.md §3.1]
- **Cursor skills**: `.cursor/skills/llm-wiki-vault-ingest/` e `.cursor/skills/llm-wiki-diagram-read/` wrappano i prompt per discovery nell'IDE [^src: raw/soli-obsidian-vault-agents.md §8.1]
- **Multi-device sync**: configurazione `.gitignore` specifica per escludere stato macchina-locale (workspace JSON, cache, graph) e plugin compilati, mantenendo config portabile [^src: raw/soli-obsidian-vault-agents.md §1]
- **Plugin config tracciata**: directory plugin-owned come `.claudian/` (Real Claudian) possono essere tracciate se piccole, portabili e prive di segreti [^src: raw/soli-obsidian-vault-agents.md §1]

## Connections

- Related: [[llm-wiki-template]] — template base da cui deriva il vault
- Related: [[soli-multi-agents-factory]] — estensione del pattern con factory multi-agente
- Related: [[soli-projects]] — adotta lo stesso pattern per la KB centralizzata cross-progetto
