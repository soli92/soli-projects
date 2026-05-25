---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [llm-wiki-template-agents.md]
status: draft
---
# LLM Wiki Template

> Template repository per knowledge base LLM-maintained, basato sul pattern proposto da Andrej Karpathy (aprile 2026).

## Summary

llm-wiki-template e un repository template che implementa il pattern "LLM Wiki" di Karpathy: sorgenti grezze immutabili in `raw/`, una wiki compilata e interconnessa in `wiki/` posseduta dall'LLM, e uno schema di regole in `AGENTS.md` [^src: raw/llm-wiki-template-agents.md §0]. Il template definisce tre operazioni canoniche (ingest, query, lint) e supporta varianti per casi d'uso diversi (tech project, research project) [^src: raw/llm-wiki-template-agents.md §3].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Formato | Markdown (Obsidian-compatibile) |
| Schema | `AGENTS.md` (agent-agnostic) |
| Varianti | `variants/` (research-project, tech-project) |
| Prompt | `prompts/` (ingest, query, lint) |
| Adapter | Claude Code (`CLAUDE.md`), Cursor (`.cursor/rules/`) |

## Architettura a tre layer

L'architettura e rigidamente stratificata [^src: raw/llm-wiki-template-agents.md §1]:

- **Layer 1 (`raw/`)** — sorgenti immutabili; l'agente legge ma non scrive mai
- **Layer 2 (`wiki/`)** — wiki posseduta dall'agente; l'umano legge, l'agente scrive
- **Layer 3 (schema)** — `AGENTS.md`, `prompts/`, `variants/`; regole del comportamento

L'`inbox/` e una zona di scratch umana, promotabile a `raw/` su istruzione esplicita.

## Operazioni canoniche

Il template definisce tre operazioni fondamentali [^src: raw/llm-wiki-template-agents.md §3]:

- **Ingest** — l'agente legge una sorgente raw, produce/aggiorna pagine wiki con citazioni obbligatorie
- **Query** — l'agente risponde usando solo la wiki, con citazioni tracciabili a sorgenti raw
- **Lint** — audit read-only: pagine orfane, link dangling, claim senza sorgente, contraddizioni

## Regole hard

Ogni claim non-triviale deve essere tracciabile a una sorgente raw — le citazioni sono il sistema immunitario contro le allucinazioni [^src: raw/llm-wiki-template-agents.md §4]. L'agente non deve mai modificare `raw/`, non deve inventare citazioni, e deve segnalare (non risolvere) le contraddizioni [^src: raw/llm-wiki-template-agents.md §8].

## Connections

- Related: [[soli-obsidian-vault]] — istanza reale del template, vault Obsidian personale
- Related: [[soli-multi-agents-factory]] — estende il pattern con factory multi-agente e project management
- Related: [[soli-projects]] — adotta il pattern llm-wiki++ v2.11 per la KB centralizzata
