# PATTERN — Agentic Factory `llm-wiki++` v2.11

> Contratto universale agent-agnostic. Qualsiasi runtime (Claude Code, Cursor, OpenAI Assistants,
> Aider, …) che rispetti questo file può operare sul repo. Gli adapter di runtime vivono in
> cartelle dedicate (`.claude/`, `.cursor/`, …) e implementano i ruoli §2.

## §0 — Identità & versione
Pattern version: **2.11**.
Origine: llm-wiki (Karpathy) + estensione PM/Arch + memory tree cross-conversazione + adapter `thin agents, fat skills` + execution layer L5 + topology + stack modes + VCS integration + sync adapters multi-sorgente + publisher adapters multi-target + parallel scheduler DAG-driven (v2.11).
Scope: knowledge-base eseguibile cross-progetto per i repository **soli92**. Topologia `plan-only`: fino a TSK, consumer umano. Nessun dev-agent. La KB è il prodotto principale; altri repo la includeranno come git submodule.
Progetto host: **Soli Projects** (`owner: soli92`, `language: it`).

## §1 — Modello a layer
- **L1 `raw/`** — input multi-sorgente. AGENTS.md, AI_LOG.md, README.md dai repository soli92 + eventuali PDF/Figma. **Immutabile** (solo il ruolo *Sync* scrive in `raw/`).
- **L2 `wiki/`** — wiki llm-style con `log.md` append-only. Unico autore: ruolo *Analyst* (`wiki-keeper`). Layout karpathy-style: `sources/concepts/entities/syntheses/runbooks/incidents/`.
- **L3 `management/`** — `kanban/EP-*/`, `roadmap.md`, `questions.md`. Autore: ruolo *PM*.
- **L4 `design_&_architecture/` + `management/kanban/**/TSK-*.md`** — autore: ruolo *Arch* + *TPM*.
- **L5** — non attivo (`topology: plan-only`, `code_path: ""`). I dev-agent non esistono in questa topologia.
- **`memory/`** — persistenza cross-conversazione (side-channel).

Cascata: ogni layer è derivato dal precedente. L'aggiornamento di Lk rende Lk+1 *stale*.

## §2 — Ruoli (responsabilità, non file)
Ogni runtime mappa questi ruoli ai propri costrutti (agenti, rules, modes, …).

**Principio**: `wiki/` è **read-universal** (ogni agente la legge), **write-restricted** (solo `wiki-keeper` scrive contenuto; eccezioni puntuali sotto).

| Ruolo | Legge | Scrive | Trigger |
|---|---|---|---|
| **Orchestrator** | tutto (read-only) | `memory/episodic/**`, `wiki/log.md`, **eccezione**: edit `status:`/`updated:` frontmatter di `wiki/**/*.md` (operazione `promote`) | richiesta dashboard di stato; operazione `promote` |
| **Sync** (`sync-docs`) | `raw/**/*.pdf` | `raw/**/*.txt`, `raw/images/*-fig-NN.md`, `raw/.extraction-manifest.json` | nuovo input in `raw/` |
| **Analyst** (`wiki-keeper`) | `raw/**`, `memory/**`, `wiki/**` | `wiki/**` (escluso `query/`, `lint/`) + append `wiki/log.md` + append `wiki/gaps.md` | L1 aggiornato OR gap aperti |
| **PM** (`product-manager`) | `wiki/**`, `memory/**` | `management/kanban/EP-*/**`, `management/{roadmap,questions}.md`, **append-only**: `wiki/gaps.md` + `## Storie collegate` su wiki pages | L2 aggiornato |
| **Arch** (`lead-architect`) | `management/kanban/**`, `management/questions.md`, `raw/tech_stack.md`, `memory/**`, `wiki/**` | `design_&_architecture/**`, **append-only**: `wiki/gaps.md` | L3 OK + gate questions resolved |
| **TPM** (`tpm`) | `design_&_architecture/**`, `management/kanban/**`, `raw/tech_stack.md`, `memory/**`, `wiki/**` | `management/kanban/**/TSK-*.md`, `management/kanban/sprint.md`, **append-only**: `wiki/gaps.md` | L4 architettura OK |
| **Query** (`wiki-query`) | `wiki/**` (esclusivo) | `wiki/query/` + append `wiki/log.md` + append `wiki/gaps.md` | domanda NL |
| **Lint** (`wiki-lint`) | `wiki/**`, `management/kanban/**`, `design_&_architecture/**`, `factory.config.yaml` | `wiki/lint/` + append `wiki/log.md` | richiesta health check |

## §3 — Operazioni canoniche (verbi)
- **Ingest** = transizione L1 → L2 eseguita da *Sync* + *Analyst*. Append a `wiki/log.md`.
- **Query** = domanda NL → risposta sintetizzata leggendo solo `wiki/`. Append a `wiki/log.md`.
- **Lint** = health check strutturale di L2+L3+L4. Append a `wiki/log.md`.
- **Plan** = transizione L2 → L3 eseguita dal *PM*.
- **Design** + **Execute** = transizione L3 → L4 eseguita da *Arch* poi *TPM*.
- **Promote** = transizione di `status:` di una pagina wiki (`draft → review → approved`).
- **Heal** = ciclo evaluator-optimizer vincolato su ERROR meccanici flaggati dal *Lint*. Opt-in, gated, max 3 iterazioni.
- **Propagate** = riconciliazione downstream quando *Analyst* chiude un gap che cita una `Q_NNN`.

## §4 — Naming conventions
| Artefatto | Pattern |
|---|---|
| PDF | `YYYY-MM-DD-<nome>.pdf` (e `.txt` corrispondente) |
| Figura PDF | `YYYY-MM-DD-<nome>-fig-NN.md` |
| Source page | `wiki/sources/<kebab-slug>.md` |
| Concept page | `wiki/concepts/<kebab-slug>.md` |
| Entity page | `wiki/entities/<kebab-slug>.md` |
| Synthesis page | `wiki/syntheses/<kebab-question>.md` |
| Runbook | `wiki/runbooks/<kebab-slug>.md` |
| Incident | `wiki/incidents/YYYY-MM-DD-<kebab-slug>.md` |
| Epica | `management/kanban/EP-XXX-<slug>/EP-XXX.md` |
| Storia | `management/kanban/EP-XXX-<slug>/US-YYY-<slug>/US-YYY.md` |
| Task | `management/kanban/EP-XXX-<slug>/US-YYY-<slug>/TSK-ZZZ.md` |
| Memoria episodica | `memory/episodic/YYYY-MM-DD-HH-MM-<slug>.md` |
| Memoria semantica | `memory/semantic/<slug>.md` |
| Memoria procedurale | `memory/procedural/<slug>.md` |

Slug: lowercase, spazi→`-`, rimuovi `()/'`, max 40 char. XXX/YYY/ZZZ = 3 cifre zero-padded.

## §5 — Frontmatter (minimo necessario)
- **Wiki page:** `type`, `sources`, `status` (`draft|review|approved`)
- **Epica:** `id`, `title`, `status`, `priority`, `confidence`, `confidence_rationale`, `wiki_pages`, `created`
- **User Story:** `id`, `title`, `role`, `priority`, `status`, `wiki_page`, `blocked_by`
- **Task:** `id`, `sprint`, `layer` (`be|fe|db|qa|infra`), `consumer` (`human`), `priority`, `estimate`, `status`
- **Figura:** `source_pdf`, `page`, `figure_number`, `type`
- **Memoria:** `type` (`episodic`/`semantic`/`procedural`), `created`, `tags`

Regola: `id` e `status` sempre obbligatori; il resto deducibile dal path va rimosso.

## §6 — Grammatica delle citazioni
- Citazione fonte: `[^src: <path-relativo>.{md,txt} §<sezione>]` su ogni claim ≥ 20 parole.
- Link interno wiki: `[[nome-pagina-senza-estensione]]`, **mai** path relativi `../../`.
- Claim senza citazione = claim invalido (segnalato dal *Lint*).

## §7 — Regole inviolabili (12)
1. **L1 read-only** (eccetto *Sync*).
2. **Zero invenzione.** Info assente → `wiki/gaps.md` o `management/questions.md`.
3. **Citazione obbligatoria** su ogni claim non triviale.
4. **Wikilink** per link interni, mai path relativi.
5. **`wiki/log.md` append-only.** Stesso vincolo per `wiki/gaps.md` e `wiki/incidents/`.
6. **Report preliminare e STOP** prima di scrivere file in batch.
7. **Update non distruttivo** su pagine `review|approved`: aggiungi `## Aggiornamenti (vYYYY-MM-DD)`.
8. **Scope di scrittura chiuso** per ruolo (§2).
9. **Gate L4 graduato** (`blocking_level: hard|soft`). Q `hard` aperta blocca US dipendenti; `soft` lascia procedere con `pending_clarification`.
10. **`raw/tech_stack.md` priorità assoluta.** Standards normativi citati non si sostituiscono.
11. **`memory/` non è `wiki/`.** Persistenza cross-conversazione vive in `memory/`.
12. **`wiki/` è read-universal, single-committer.** Solo `wiki-keeper` committa su `wiki/`. Eccezioni: `## Storie collegate` (PM), `wiki/gaps.md` (L3+ append), `status:` via `promote` (Orchestrator).

## §8 — State derivation (single source of truth)
Lo stato del progetto si deduce SOLO da:
- Filesystem (presenza/assenza di file e cartelle).
- `wiki/log.md` (ultima entry per tipo di operazione).
- `memory/episodic/` (ultimo run rilevante).
- Data modifica file (`git log` o `stat`).
- `factory.config.yaml` (configurazione, **non stato**).

**Vietato:** `project_manifest.json` o file di stato scritti a mano.

## §9 — Memoria cross-conversazione
- **`memory/episodic/`** — record narrativo del run. Scritto dall'*Orchestrator*.
- **`memory/semantic/`** — fatti consolidati cross-progetto. Promossi da episodic dopo validazione umana.
- **`memory/procedural/`** — playbook riutilizzabili.

## §10 — Wiki maintenance & feedback loop
`wiki/gaps.md` è append-only condiviso. Ciclo: Apertura (L3+ → append) → Pickup (`wiki-keeper` legge in Fase 0) → Chiusura (`**Risolto:** YYYY-MM-DD — [[<pagina>]]`).

Invarianti: append-only su `wiki/log.md` / `gaps.md` / `incidents/`; non distruttivo su `review`/`approved`; touch many small files; flag don't resolve; citation chain integrity.

## §11 — Standards as constraints
Standard normativi nei raw (SPID, OIDC, OAuth2, SAML, eIDAS, GDPR, …) sono vincoli verbatim. L'Arch li adotta esplicitamente via ADR.

## §12 — Adapter (runtime-specific)
- `.cursor/` — adapter Cursor (attivo per questo progetto)
- `.claude/` — adapter Claude Code (futuro)

Più adapter possono coesistere: condividono `raw/`, `wiki/`, `management/`, `design_&_architecture/`, `memory/`.

## §13 — Topology (plan-only)
Topologia corrente: **`plan-only`** — wiki + project management, consumer umano per i task. Nessun dev-agent attivo.

## §14 — Versioning
- **v2.11** (corrente): adattato da soli-multi-agents-factory v2.11 per uso cross-progetto come KB centralizzata.
- Topologia ridotta a `plan-only` per lo scope di knowledge base.
- L5, dev-agent, VCS integration, publisher, parallel scheduler: non attivi (disponibili in factory.config.yaml se necessari in futuro).

## §15 — Cross-project KB scope
Questo repo funge da **knowledge base centralizzata** per tutti i repository soli92. I consumer lo includono come **git submodule** per accesso diretto a `wiki/`, `management/`, e `memory/`. L'ingest avviene dai file sorgente dei repo (`AGENTS.md`, `AI_LOG.md`, `README.md`) copiati in `raw/`.

Repository indicizzati:
- soli-agent
- soli-prof
- soli-projects (self)
- soli-platform
- solids (SoliDS)
- Koollector
- soli-dome
- pippify
- bachelor-party-claudiano
- casa-mia-fe
- casa-mia-be
- soli-dm-fe
- soli-dm-be
- llm-wiki-template
- soli-obsidian-vault
- soli-multi-agents-factory
