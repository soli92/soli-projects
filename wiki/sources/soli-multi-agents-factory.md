---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-multi-agents-factory-readme.md]
status: draft
---
# Soli Multi-Agents Factory

> Meta-framework agentico: da documenti grezzi a progetti IT completi, attraverso una wiki citation-grounded e una pipeline supervisor-worker di agenti specializzati.

## Summary

soli-multi-agents-factory combina due componenti in un unico repository: un substrato LLM Wiki (pattern Karpathy) per compilare documenti grezzi in pagine wiki interconnesse, e una factory multi-agente che sopra il substrato pilota agenti specializzati (product-manager, lead-architect, tpm) per produrre epic, user story, ADR, task [^src: raw/soli-multi-agents-factory-readme.md §Cos'e]. Il contratto universale agent-agnostic vive in `PATTERN.md` (v2.11) e definisce topologie, VCS integration, e un parallel scheduler DAG-driven [^src: raw/soli-multi-agents-factory-readme.md §Contratto].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Contratto | `PATTERN.md` v2.11 (agent-agnostic) |
| Config | `factory.config.yaml` (topology, routing, scheduler) |
| Adapter | Claude Code (`.claude/`), Cursor (`.cursor/`) |
| Pattern base | LLM Wiki (Karpathy) |

## Architettura a cinque layer

Il framework estende i tre layer del [[llm-wiki-template]] con due livelli aggiuntivi [^src: raw/soli-multi-agents-factory-readme.md §Struttura]:

- **L1 `raw/`** — documenti grezzi immutabili
- **L2 `wiki/`** — wiki LLM-style con citazioni
- **L3 `management/`** — kanban, roadmap, questions (epiche/storie/task)
- **L4 `design_&_architecture/`** — BE/FE/API/DB + ADR
- **L5 `<code_path>/`** — codice prodotto (puo essere esterno al repo)

## Topologie

Sei topologie supportate, switchabili a runtime con `/topology set <nome>` [^src: raw/soli-multi-agents-factory-readme.md §Topologie]:

- `knowledge-only` — knowledge factory pura, nessun dev-agent
- `plan-only` — fino a TSK, consumer umano (default storico)
- `full-stack-agents` — tutto agentico end-to-end
- `hybrid-be-agents` / `hybrid-fe-agents` — mix agentico/umano
- `custom` — sottoinsieme a la carte

## VCS integration (v2.8)

Cinque modalita per la relazione fra factory repo e codice prodotto: `none`, `monorepo`, `submodule`, `sibling`, `external` [^src: raw/soli-multi-agents-factory-readme.md §VCS integration].

## Parallel scheduler (v2.11)

Lo scheduler riconosce a runtime le finestre di parallelismo usando un DAG costruito da `depends_on`, `blocked_by` e `code_path` nel frontmatter degli artefatti. Cap fan-out a 4, gate umano dopo 3 sub-agent, otto regole inviolabili R.S1-R.S8 [^src: raw/soli-multi-agents-factory-readme.md §Parallel scheduler].

## Invarianti hard

Il rispetto del contratto e LLM-trust (no hook bash), verificato dal wiki-lint e dall'umano in review [^src: raw/soli-multi-agents-factory-readme.md §Invarianti hard]:

- `raw/` immutabile; citazione obbligatoria; wikilink per link interni
- `wiki/log.md` append-only; scope di scrittura chiuso per ruolo
- `raw/tech_stack.md` ha priorita assoluta sugli standard tecnologici

## Credits

Il pattern origina dal gist di Andrej Karpathy (aprile 2026), con estensioni da GitHub Spec Kit e Mem0 State of AI Agent Memory 2026 [^src: raw/soli-multi-agents-factory-readme.md §Credits].

## Connections

- Related: [[llm-wiki-template]] — template base del substrato wiki
- Related: [[soli-obsidian-vault]] — altra istanza del pattern wiki (research)
- Related: [[soli-projects]] — consumer diretto: adotta llm-wiki++ v2.11 con topologia plan-only
- Related: [[agentic-value-investor-application]] — consumer v2.8 con topologia full-stack-agents (Kotlin/Next.js/Python, 14 dev-agent attivi)
