---
source_path: /Users/simone.olivieri/Documents/Personal/Repos/soli-projects/projects-repos/wise-planeswalker
source_type: repo
git_branch: main
git_commit: 3160e0f7854ae242c3e75a8a0ae795c638b5893b
extracted_at: 2026-07-02T00:00:00+02:00
extractor: repo-sync@2.12.0
---

# Specifiche estratte: wise-planeswalker

> Documento generato da `repo-sync` v2.12 il 2026-07-02. Sorgente: `/Users/simone.olivieri/Documents/Personal/Repos/soli-projects/projects-repos/wise-planeswalker`
> @ commit `3160e0f` (ramo `main`). Read-only verso la sorgente.

---

## Identità

- **Nome**: wise-planeswalker
- **Descrizione** (da README): "Magic knowledge base" — factory llm-wiki++ dedicata alla knowledge base di Magic: The Gathering e al progetto koollector (app per la gestione di collezioni MTG).
- **Owner / top contributors**: soli92 (unico contributor rilevato)
- **Ultimo commit**: 2026-06-26, `3160e0f`, `"feat: plan EP-001 federated auth + ingest koollector + complete MTG wiki"`
- **Attività (ultimo anno)**: 5 commit

---

## Stack rilevato

Questa è una factory **Soli Multi-Agents Factory** (PATTERN v2.23), non un'applicazione con stack di produzione proprio. Il codice di produzione risiede nel submodule `code_repos/koollector` (non ancora inizializzato al momento dell'estrazione).

| Attributo              | Valore                                                              | Confidence |
|------------------------|---------------------------------------------------------------------|------------|
| **Tipo repo**          | Factory llm-wiki++ (PATTERN v2.23)                                  | 1.00       |
| **Topologia**          | `full-stack-agents` (dev-agent attivi su koollector)                | 1.00       |
| **Adapter runtime**    | Claude Code (`.claude/`)                                            | 1.00       |
| **Lingua KB**          | Italiano                                                            | 1.00       |
| **Dominio KB**         | Magic: The Gathering + koollector (app gestione collezioni MTG)     | 1.00       |
| **Pattern version**    | 2.23 (Semantic Drift Detection EP-031, research sprint)             | 1.00       |
| **code_path primario** | `code_repos/koollector` (submodule, vcs.mode: submodule)           | 1.00       |
| **Stack koollector**   | TypeScript / Apollo GraphQL + React Native + PostgreSQL 16          | 0.99       |
| **Kanban publish**     | GitHub (`soli92/wise-planeswalker`, push-only via GITHUB_TOKEN env) | 1.00       |

**Stack koollector** (derivato da `raw/2026-06-26-repo-koollector.md` già presente in questa factory):

| Livello           | Tecnologia                                                    |
|-------------------|---------------------------------------------------------------|
| Language          | TypeScript ESM strict                                         |
| Runtime           | Node.js 22+                                                   |
| Layout            | npm workspaces monorepo (`apps/*`)                            |
| API framework     | Apollo Server 5 + Express 5 + graphql-ws                     |
| Mobile framework  | Expo SDK 54 + React Native 0.81.5 + React 19                 |
| GraphQL client    | Apollo Client 4                                               |
| Database server   | PostgreSQL 16 (Docker Compose)                               |
| Database mobile   | SQLite locale (expo-sqlite 16.x)                             |

---

## Struttura ad alto livello

```
wise-planeswalker/
├── CHANGELOG.md            # Changelog PATTERN versioni (Keep a Changelog)
├── CLAUDE.md               # Adapter context Claude Code
├── PATTERN.md              # Contratto meta-framework (v2.23, ~2500 righe)
├── README.md               # "Magic knowledge base" (2 righe)
├── factory.config.yaml     # Configurazione factory (topologia, routing, scheduler…)
├── .claude/
│   ├── agents/             # 25 agenti (orchestrator, wiki-keeper, dev-agent, repo-sync…)
│   ├── commands/           # 29 comandi (/run, /repo-sync, /lint, /dev, /review…)
│   ├── schemas/            # 2 schema JSON
│   ├── skills/             # 59 skill (protocolli riusabili)
│   └── tools/              # 22 tool (analytics, temporal)
├── code_quality/
│   ├── reports/            # 1 report CQRL
│   └── rules/              # canonical / emergent / team-specific
├── code_repos/
│   └── koollector/         # submodule (non inizializzato al momento dell'estrazione)
├── management/
│   └── kanban/             # EP-001…EP-005 + sprint-001.md (25 file totali)
├── memory/
│   ├── episodic/           # 2 file
│   ├── procedural/         # 1 file
│   └── semantic/           # 1 file
├── raw/                    # L1: estrazioni sync (MTG PDF, repo koollector)
│   └── images/
└── wiki/                   # L2: 30 pagine wiki llm-style
    ├── concepts/           # 20 pagine (MTG rules + koollector architettura/stack)
    ├── entities/           # 4 pagine (anatomia carta, glossario, koollector API/schema)
    ├── runbooks/           # 1 runbook
    └── syntheses/          # 1 sintesi (motore del gioco)
```

Pattern di layout rilevato: **factory monorepo** (factory installatain repo separato, L5 come submodule esterno).

---

## Entrypoint e moduli chiave

Non applicabile come entrypoint di applicazione (la factory non ha un processo runtime proprio). I "moduli core" della factory sono:

- **`PATTERN.md`** — contratto del meta-framework (~2500 righe, v2.23), source-of-truth di tutti i ruoli/layer/invarianti.
- **`factory.config.yaml`** — configurazione operativa (topologia, code_paths, scheduler, CQRL, compression, analytics, semantic drift).
- **`.claude/agents/orchestrator.md`** — dispatcher thin, entry point di ogni sessione operativa.
- **`.claude/skills/repo-extraction-protocol.md`** — protocollo repo-sync (5 fasi).
- **`wiki/`** — L2 knowledge base (30 pagine); input per PM/Arch/Dev-agent.

---

## Epiche in kanban (L3)

| ID      | Titolo                                    | Status  |
|---------|-------------------------------------------|---------|
| EP-001  | Autenticazione e Controllo Accessi        | ready   |
| EP-002  | Dominio Carte e Modello Dati              | ready   |
| EP-003  | Robustezza del Sync Protocol              | ready   |
| EP-004  | Infrastruttura, Deploy e Osservabilità    | ready   |
| EP-005  | Testing e Qualità del Codice              | ready   |

- **User Stories**: 10 totali
- **Tasks**: 8 totali
- **Sprint**: sprint-001 attivo

Contesto EP-001: il client mobile koollector ha uno stub `authLink` con `TODO` JWT/device token; lato server nessun middleware auth; `collection_members` non verificata. Bloccante per deploy prod.

---

## API surface (koollector)

Rilevata da `raw/2026-06-26-repo-koollector.md` (già ingestata):

- **Transport**: GraphQL over HTTP + WebSocket subscriptions (Apollo Server 5 + graphql-ws)
- **Schema**: definito in `apps/api/src/schema/` (type definitions + resolvers)
- **Entità principali**: `Card`, `Collection`, `CollectionMember`, `SyncEvent`
- **Auth**: assente a runtime (backlog EP-001); stub `authLink` nel client mobile

---

## Schema dati (koollector)

- **PostgreSQL 16**: tabelle rilevate — `collection_members (collection_id, user_id, role)` + schema carte
- **SQLite mobile**: database locale `expo-sqlite` per offline-first sync bidirezionale
- **GraphQL schema**: in `apps/api/src/schema/`

---

## Dipendenze esterne

**Factory (infrastruttura):**
- Claude Code (adapter runtime)
- GitHub (kanban publish via API, `GITHUB_TOKEN` env)
- Voyage-3 / text-embedding-3-small (opt-in, EP-031 semantic drift — non ancora attivo)

**koollector (da repo-sync esistente):**
- Apollo Server 5, Apollo Client 4
- Express 5, graphql-ws
- Expo SDK 54, React Native 0.81.5
- PostgreSQL 16 (Docker Compose)
- expo-sqlite 16.x

---

## Vincoli normativi / Standard

Nessun vincolo normativo esplicito rilevato (GDPR, OAuth2 formale, ISO 27001, ecc.).

EP-001 prevede implementazione autenticazione (JWT / OAuth / device token — non ancora deciso), che potrebbe introdurre vincoli OIDC/OAuth2 in futuro.

---

## Documenti correlati nel repo

- [README.md](README.md)
- [CHANGELOG.md](CHANGELOG.md) — storia versioni PATTERN (v2.11 → v2.23)
- [PATTERN.md](PATTERN.md) — contratto meta-framework completo
- [factory.config.yaml](factory.config.yaml)
- [wiki/README.md](wiki/README.md)
- [wiki/syntheses/motore-del-gioco.md](wiki/syntheses/motore-del-gioco.md)

---

## Wiki KB (L2) — copertura tematica

**Dominio MTG (20 concepts + 4 entities + 1 synthesis):**

| Area              | Pagine chiave                                                              |
|-------------------|---------------------------------------------------------------------------|
| Regole core       | panoramica-del-gioco, struttura-del-turno, mana-e-costi, layer-system     |
| Tipi/Zone         | tipi-di-carta, zone-di-gioco, keyword, keyword-schede                     |
| Interazione       | pila-priorita-abilita, combattimento, state-based-actions                  |
| Formati/Varianti  | formati-di-gioco, commander, multiplayer, ruota-dei-colori                 |
| Meccaniche        | sostituzione-prevenzione, costruzione-mazzo, anatomia-carta (entity)      |
| Glossario         | glossario (entity)                                                         |
| Sintesi           | motore-del-gioco                                                           |

**Dominio koollector (3 concepts + 2 entities):**
- `koollector-architettura.md`, `koollector-stack.md`, `koollector-sync-protocol.md`
- `koollector-api.md`, `koollector-schema.md`

---

## Test coverage rilevato

- Framework di test: rilevato in koollector (da repo-sync koollector); non ancora esercitato nella factory stessa.
- EP-005 "Testing e Qualità del Codice" in stato ready — testing non ancora implementato su koollector.
- CQRL (`code_quality.enabled: true`): attivo, con passes idiomaticity/design/robustness.

---

## Gap evidenti

> Input per `wiki-keeper` durante l'ingest L1→L2.

1. **README stub**: il README della factory è minimale ("Magic knowledge base", 2 righe). Manca descrizione del progetto, quick-start, link a PATTERN.md e al wiki.
2. **Submodule koollector non inizializzato**: `code_repos/koollector/` è vuota al momento dell'estrazione (submodule non `git submodule update --init`-ato in questo working tree). La spec koollector è disponibile solo via `raw/2026-06-26-repo-koollector.md`.
3. **Auth stack non deciso**: EP-001 identifica il gap ma non specifica il meccanismo (JWT, OAuth2, device token). Scelta bloccante per EP-002, EP-003.
4. **5 commit in un anno**: attività molto bassa — factory appena scaffoldata (2026-06-26). Storico di sviluppo minimo.
5. **Testing assente**: EP-005 in stato ready ma nessun test ancora implementato su koollector.
6. **Gap mapping wiki ↔ kanban**: le EP sono già piantate nel kanban (ready) ma mancano ancora alcune US e tutti i TSK per EP-002..EP-005.
7. **`memory/` poco popolata**: 4 file totali — factory giovane, memoria cross-conversazione da costruire.

---

## Note di estrazione

- File sampled: 12 / 217
- Secret redacted: 0 (1 placeholder env `GITHUB_TOKEN` non redatto perché non è un valore)
- Companion tree: `raw/images/2026-07-02-repo-wise-planeswalker-tree.md`
- Estrazione: success
