---
type: source
created: 2026-06-26
updated: 2026-07-02
sources:
  - raw/2026-07-02-repo-wise-planeswalker.md
status: draft
---
# Wise Planeswalker

> Factory llm-wiki++ v2.23 dedicata alla knowledge base di Magic: The Gathering e al progetto [[koollector]] (app per la gestione di collezioni MTG). [^src: raw/2026-07-02-repo-wise-planeswalker.md §Identità]

## Summary

Wise Planeswalker è una factory **Soli Multi-Agents Factory** (PATTERN v2.23) con topology `full-stack-agents`: mantiene una wiki MTG (L2, 30 pagine) e gestisce lo sviluppo del codice di [[koollector]] tramite dev-agent. L'adapter runtime è Claude Code (`.claude/` con 25 agenti, 59 skill, 29 comandi). Il repo è registrato su GitHub come `soli92/wise-planeswalker` con kanban publish attivo. [^src: raw/2026-07-02-repo-wise-planeswalker.md §Identità]

**Nota sulla pagina precedente**: lo stack indicato (shell/python/js) era errato — la factory non ha un proprio stack di produzione; il codice vive in [[koollector]] (submodule TypeScript/GraphQL/React Native).

## Stack

### Factory (infrastruttura)

| Layer | Tecnologia |
|-------|------------|
| Pattern | Soli Multi-Agents Factory PATTERN v2.23 |
| Adapter runtime | Claude Code (`.claude/`) |
| Agenti | 25 (orchestrator, wiki-keeper, dev-agent, repo-sync, …) |
| Skill | 59 protocolli riusabili |
| Comandi | 29 (/run, /repo-sync, /lint, /dev, /review, …) |
| Kanban publish | GitHub (`soli92/wise-planeswalker`, push-only) |
| CQRL | attivo (`code_quality.enabled: true`, max 3 iter) |
| Compression output | Caveman, conservative |
| Semantic drift | opt-in (EP-031, default off) |

### koollector (code_path, submodule)

| Layer | Tecnologia |
|-------|------------|
| Language | TypeScript ESM strict |
| Runtime | Node.js 22+ |
| Layout | npm workspaces monorepo (`apps/*`) |
| API framework | Apollo Server 5 + Express 5 + graphql-ws |
| Mobile framework | Expo SDK 54 + React Native 0.81.5 + React 19 |
| GraphQL client | Apollo Client 4 |
| Database server | PostgreSQL 16 (Docker Compose) |
| Database mobile | SQLite locale (expo-sqlite 16.x) |

[^src: raw/2026-07-02-repo-wise-planeswalker.md §Stack rilevato] [^src: raw/2026-06-26-repo-koollector.md §Stack rilevato]

## Architettura wiki (L2)

- **Raw sources** (`raw/`): 4 file MTG bilingue + 1 repo-sync koollector — `mtg_knowledge_base.md`, `mtg_schede_keyword.md`, `mtg_sistema_livelli.md`, `mtg_regole_avanzate.md` + `2026-06-26-repo-koollector.md`.
- **Wiki concepts** (`wiki/concepts/`): 20 pagine — 17 MTG (panoramica, mana, zone, turno, tipi carta, combattimento, ruota colori, formati, mazzo, pila, layer, keyword, keyword-schede, commander, multiplayer, sostituzione-prevenzione, state-based-actions) + 3 koollector (architettura, stack, sync-protocol).
- **Wiki entities** (`wiki/entities/`): 4 pagine — anatomia-carta, glossario, koollector-api, koollector-schema.
- **Wiki syntheses** (`wiki/syntheses/`): 1 — motore-del-gioco.
- **Wiki runbooks** (`wiki/runbooks/`): 1.
- **Management kanban**: 5 EP + sprint-001 (25 file totali, 10 US, 8 TSK).

[^src: raw/2026-07-02-repo-wise-planeswalker.md §Wiki KB (L2)]

## Kanban (L3)

| EP | Titolo | Status |
|----|--------|--------|
| EP-001 | Autenticazione e Controllo Accessi | ready |
| EP-002 | Dominio Carte e Modello Dati | ready |
| EP-003 | Robustezza del Sync Protocol | ready |
| EP-004 | Infrastruttura, Deploy e Osservabilità | ready |
| EP-005 | Testing e Qualità del Codice | ready |

- **Sprint attivo**: sprint-001
- **US totali**: 10 | **TSK totali**: 8
- **EP-001 bloccante**: nessun middleware auth su server koollector; `collection_members` non verificata; stub JWT nel client mobile → bloccante per deploy prod.

[^src: raw/2026-07-02-repo-wise-planeswalker.md §Epiche in kanban]

## Key integrations

- **[[koollector]]** — submodule `code_repos/koollector`; repo TypeScript con API GraphQL + app React Native per gestione collezioni MTG offline-first.
- **[[soli-projects]]** — wise-planeswalker aggiunto come submodule di soli-projects in `projects-repos/wise-planeswalker` (2026-07-02).
- **[[soli-multi-agents-factory]]** — source del PATTERN v2.23 utilizzato.

## Stato

- Bootstrap: 2026-06-25 (factory v2.23 scaffoldata)
- Primo ingest MTG: 2026-06-25 (3 raw → 13 wiki concept pages MTG)
- Ingest koollector: 2026-06-26 (repo-sync koollector → wiki concepts/entities koollector)
- Repo-sync wise-planeswalker (reflective): 2026-07-02 → questa pagina aggiornata
- Git activity: 5 commit (ultimo: 2026-06-26, `3160e0f`)
- Nessun CI/CD configurato.
- Nessun deploy attivo.

## Open questions

- Quale sarà il consumer della KB MTG? (RAG su soli-prof? endpoint dedicato? CLI?)
- Quando sarà aggiunto AGENTS.md per l'indicizzazione in soli-prof CORPUS_REPOS?
- Come sarà implementata l'autenticazione in EP-001? (JWT, OAuth2, device token — non ancora deciso)
- Il submodule koollector in `code_repos/` è inizializzato? (vuoto al 2026-07-02 nel worktree soli-projects)
