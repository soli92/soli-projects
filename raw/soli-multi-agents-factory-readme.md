# Soli Multi-Agents Factory

> Un **meta-framework agentico**: data una cartella di file grezzi (`raw/`),
> compila una wiki citation-grounded (`wiki/`) e, su quella, pilota una pipeline
> supervisor-worker che produce progetti IT — webapp, applicazioni native,
> librerie — attraverso agenti specializzati.

Linguaggio del contenuto: **italiano**. Schema (frontmatter, slug, codice) in inglese, per convenzione.

---

## Cos'è

Due cose in un solo repo, by design:

1. **Substrato (LLM Wiki, à la Karpathy)**. Documenti grezzi immutabili in
   `raw/` → un LLM li compila in pagine wiki interconnesse, ogni claim
   citato. Le operazioni canoniche sono `ingest`, `query`, `lint`.
2. **Factory multi-agente**. Sopra il substrato girano agenti specializzati
   (`product-manager`, `lead-architect`, `tpm`) che producono epic, user
   story, ADR, OpenAPI, task — con citazioni alla wiki e gate di confidence fra layer.

L'orchestrator suggerisce, turno per turno, il prossimo step in base allo stato.

---

## Contratto

- [`PATTERN.md`](PATTERN.md) — **contratto universale agent-agnostic** v2.11. Single source of truth per il pattern.
- [`CLAUDE.md`](CLAUDE.md) — pointer all'adapter Claude Code in `.claude/`.
- [`factory.config.yaml`](factory.config.yaml) — configurazione factory (topology, code_path, vcs, stack_mode, routing, kanban_publish, scheduler).

Altri adapter (`.cursor/`, `.openai/`, …) possono coesistere sullo stesso repo finché rispettano `PATTERN.md`.

## Topologie (v2.7)

| Topologia | Dev-agent attivi | Caso d'uso |
|---|---|---|
| `knowledge-only` | nessuno | Knowledge factory pura |
| `plan-only` | nessuno | Arrivo fino a TSK, consumer umano (default storico) |
| `full-stack-agents` | be-dev, fe-dev, db-dev, qa-dev | Tutto agentico end-to-end |
| `hybrid-be-agents` | be-dev, db-dev | BE/DB agentici, FE/QA umani |
| `hybrid-fe-agents` | fe-dev | FE agentico, BE/DB/QA umani |
| `custom` | sottoinsieme | A la carte |

Switch a runtime: `/topology set <nome>`. Override one-shot di un TSK: `/dev <TSK-id>`.

## VCS integration (v2.8)

Cinque modalità per la relazione fra factory repo e codice prodotto (L5):

| Mode | Significato |
|---|---|
| `none` | Nessun L5 (knowledge-only o plan-only) |
| `monorepo` | L5 dentro al factory repo |
| `submodule` | L5 come git submodule |
| `sibling` | L5 in altro clone, repo separato |
| `external` | Path opaco, factory non coordina git |

La skill [`vcs-handoff`](.claude/skills/vcs-handoff.md) propone i commit cross-repo; **gate umano obbligatorio** per ogni operazione VCS (mai `push`/`clone`/`submodule add` automatici, PATTERN.md §7 r.14). Vedi [[vcs-and-code-path]] per i dettagli.

## Parallel scheduler (v2.11)

Lo scheduler vive nell'Orchestrator (§2) e riconosce a runtime le finestre in cui più operazioni o sub-agent possono essere dispatchati in parallelo senza violare gli invarianti del framework (single-committer §7 r.12, append-only §7 r.5, gate cross-tool §7 r.15).

| Concetto | Valore di default |
|---|---|
| Input frontmatter | `depends_on` (EP/US/TSK), `blocked_by` (TSK, esteso da US), `code_path` (TSK, glob L5) |
| Algoritmo | Build DAG `E_dep ∪ E_conf` → toposort + level grouping → graph-coloring partition |
| Cap fan-out | `max_parallel: 4` (R.S3) |
| Gate umano | `parallel_gate_threshold: 3` sub-agent (R.S4) |
| Policy file vuoto | `empty_code_path_policy: serial` (conservativo) |
| Domini attivi | ingest, develop, lint, query, sync |
| Domini off | plan, design, publish |

Disattivabile con `scheduler.enabled: false` (comportamento legacy seriale). Otto regole inviolabili (R.S1–R.S8) garantiscono safety-by-default. Vedi [[parallel-scheduler]] (concept) + [[migration-v211]] (runbook) + [PATTERN.md §18](PATTERN.md).

---

## Struttura

```
.
├── PATTERN.md                  # ★ contratto universale (v2.11)
├── CLAUDE.md                   # pointer adapter Claude Code
├── factory.config.yaml         # ★ config: topology, code_path, stack_mode, routing, kanban_publish, scheduler
├── raw/                        # L1: documenti grezzi (immutable)
├── wiki/                       # L2: wiki llm-style karpathy
│   ├── sources/ concepts/ entities/ syntheses/
│   ├── runbooks/ incidents/
│   ├── index.md log.md gaps.md
├── management/                 # L3: kanban, roadmap, questions
├── design_&_architecture/      # L4: BE/FE/API/DB + ADR
├── <code_path>/                # L5 (v2.7): codice prodotto, può essere ESTERNO al repo
├── memory/                     # persistenza cross-conversazione
│   ├── episodic/ semantic/ procedural/
└── .claude/
    ├── agents/                 # 8 core + 0..4 dev-agent (in base a topology)
    ├── commands/               # /run /sync-docs /query /lint /promote /heal
    │                           # + /dev /topology (se topology include dev-agent)
    ├── skills/                 # template + procedure (+ dev-protocol, tech-scout in v2.7)
    └── settings.json
```

---

## Come si usa (workflow tipico)

```
1.  Drop dei PDF/MD in raw/ (naming: YYYY-MM-DD-<slug>.<ext>)
2.  /sync-docs                      → estrae testo + immagini in raw/*.txt e raw/images/
3.  /run                            → orchestrator: suggerisce di invocare wiki-keeper
4.  wiki-keeper                     → wiki/sources, wiki/concepts, wiki/entities
5.  /lint                           → check periodico
6.  /run                            → gate L2 OK → product-manager
       └─ product-manager           → management/kanban/EP-*/US-*/, roadmap.md
7.  /run                            → gate questions (graduato v2.6) → lead-architect
       └─ lead-architect            → design_&_architecture/
       └─ tech-scout (se stack_mode=auto, v2.7) → raw/tech_stack.md.proposal
8.  /run                            → tpm
       └─ tpm                       → TSK con layer:+consumer: (da routing) + sprint.md
9.  /run                            → (v2.7) suggerisce /dev <TSK-id> per TSK consumer=agent
       └─ /dev TSK-XXX              → be-dev|fe-dev|db-dev|qa-dev scrive in <code_path>/
```

Gli step si ripetono iterativamente. Cambio topologia a runtime: `/topology set <nome>`.

---

## Invarianti hard (vedi PATTERN.md §7)

1. `raw/` è **immutabile** (eccetto sync-docs).
2. Zero invenzione: info assente → `wiki/gaps.md` o `management/questions.md`.
3. Citazione obbligatoria su ogni claim non triviale.
4. Wikilink `[[…]]` per link interni, mai path relativi.
5. `wiki/log.md` append-only.
6. Scope di scrittura chiuso per ruolo.
7. `management/questions.md` con `status: open` blocca L4.
8. `raw/tech_stack.md` priorità assoluta (standards non si sostituiscono).
9. `memory/` non è wiki/.

Differenza dalle versioni P0/P1/P2 (pre-v2.2): **niente hook bash di enforcement deterministico**. Il rispetto del contratto è LLM-trust, verificato dal `wiki-lint` (read-only report) e dall'umano in review. La pulizia di questo trade-off è documentata in [PATTERN.md §12](PATTERN.md#12--versioning).

---

## Migrazione da implementazioni P0/P1/P2

Il repo è stato migrato da una versione con hook-enforcement + two-phase commit + JSON Schemas + verifier subagent + tenant standards gate. Il runbook completo della migrazione è in [`wiki/runbooks/migration-v22.md`](wiki/runbooks/migration-v22.md). I post-mortem degli incidenti che hanno portato a quella implementazione sono preservati in [`wiki/incidents/`](wiki/incidents/) come archeologia.

---

## Stato attuale

Il bootstrap originale ha creato lo scaffold + alcune pagine concept/entity/source/runbook/incident. Il repo è ora in stato **v2.11** dopo le migrazioni del 2026-05-18 (v2.2), 2026-05-19 (v2.3 → v2.5), 2026-05-20 (v2.6 → v2.7 → v2.8), 2026-05-22 (v2.9 — Sync adapters multi-sorgente: PDF + Figma; v2.10 — Publisher adapters multi-target: GitHub Issues, contratto pronto per GitLab/Jira/Linear; v2.11 — Parallel scheduler DAG-driven con `depends_on`/`blocked_by`/`code_path` frontmatter, 5 domini di parallelismo attivi di default, 8 regole inviolabili R.S1–R.S8).

Prossimi passi suggeriti:
1. Eventuale `tech_stack.md` in `raw/` per vincoli tecnologici, oppure abilita `stack_mode: auto` in `factory.config.yaml` per usare `tech-scout`.
2. `/run` per il dashboard di stato + wave dispatch parallelo se ≥ 2 candidati (v2.11).
3. `wiki-keeper` per il primo ingest reale.
4. `/topology show` per vedere la topologia corrente; `/topology set <nome>` per cambiarla.
5. Per nuovi sprint, popolare `depends_on:` + `code_path:` nei TSK per abilitare il parallelismo (PATTERN §18). Default conservativo: artefatti senza `code_path:` sono serializzanti.

---

## Credits & provenance

- **LLM Wiki pattern** — [Andrej Karpathy's gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), April 2026.
- **Schema agent-agnostic** — [`soli92/llm-wiki-template`](https://github.com/soli92/llm-wiki-template), MIT.
- **Spec-driven specifications** — [GitHub Spec Kit](https://github.com/github/spec-kit).
- **Layered memory** — [Mem0 — State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026).
- **Claude Code subagents + skills** — [Claude Code Docs](https://code.claude.com/docs/en/sub-agents).

Il meta-prompt canonico che riproduce il pattern è in [`meta-prompt-llm-wiki-factory.md`](meta-prompt-llm-wiki-factory.md) (v2.11). Tutte le versioni precedenti e la storia di evoluzione sono indicizzate in [`META-PROMPTS-INDEX.md`](META-PROMPTS-INDEX.md). I runbook di migrazione tra versioni vivono in [`wiki/runbooks/migration-v*.md`](wiki/runbooks/).

---

## Licenza

Il sub-set adattato dal `soli92/llm-wiki-template` è MIT. Il resto del framework è da specificare dall'`owner`.
