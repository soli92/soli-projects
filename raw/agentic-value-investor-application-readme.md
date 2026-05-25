# Agentic Value Investor Application — README + factory.config.yaml + CLAUDE.md

> Sync manuale dal repo [marcociullo86/agentic-value-investor-application](https://github.com/marcociullo86/agentic-value-investor-application). Collaborazione (non soli92-owned).

## Progetto

Repo agentic factory **`llm-wiki++` v2.8** — knowledge base eseguibile stile Karpathy estesa con planning (PM/Arch/TPM), execution layer L5 (4 dev-agent), memoria cross-conversazione e VCS integration esplicita.

- **Contratto autoritativo (universale, agent-agnostic):** `PATTERN.md` (v2.8)
- **Adapter Claude Code:** `CLAUDE.md` + `.claude/`
- **Adapter Cursor:** `CURSOR.md` + `.cursor/`
- **Configurazione factory:** `factory.config.yaml`

## Topologia attiva

- **`topology: full-stack-agents`** — tutti i dev-agent (be/fe/db/qa/infra) attivi
- **`code_path: ./src/`** — codice nel monorepo
- **`stack_mode: auto`** — la skill `tech-scout` propone lo stack (gate umano per applicare)
- **`vcs.mode: monorepo`** — commit chain unico, ogni operazione VCS è gated umano

## Stack (factory.config.yaml)

```yaml
pattern_version: "2.8"
topology: full-stack-agents
code_path: ./src/
stack_mode: auto

routing:
  be: agent
  fe: agent
  db: agent
  qa: agent
  infra: agent

stack:
  backend: "Kotlin 2.2 + Spring Boot 3.5 (JVM 17+)"
  frontend: "React 19 + Next.js 16.x (App Router + RSC + Turbopack)"
  database: "PostgreSQL 17 + Flyway 10.x + Spring Data JPA"
  qa: "JUnit 5 + Testcontainers + Playwright + Vitest"

vcs:
  mode: monorepo
  branch_strategy: shared
  commit_coupling: float
```

## Componente Python: agent.py

Bot LangGraph multi-agente (~2350 righe, "Value Investor Bot — Team Buffett v2.6.1") per screening azionario automatizzato stile Buffett/Munger. Pipeline: screener (4 segnali) → per-ticker loop (dati finanziari → 10-K/10-Q → sentiment news → price action → DCF → decisione Munger → verdetto) → report HTML.

LLM: Claude Opus 4.7 per analisi finanziaria profonda, Google Gemini per task leggeri. Data: SEC EDGAR per 13-F gratuiti, FMP API per dati finanziari.

## Componente web: src/

Full-stack web application:
- **`src/backend/`** — Kotlin/Spring Boot (Gradle, JVM 21, package `com.valueinvesting.webapp`)
- **`src/frontend/`** — Next.js 16 (React 19, TypeScript)
- **`src/embeddings-sidecar/`** — Python FastAPI (Qwen3-Embedding-0.6B)
- **`src/docker/`** — Dockerfile e docker-compose

## Layer factory

| Layer | Path | Contenuto |
|-------|------|-----------|
| L1 | `raw/` | PDF value investing + estratti, `agent.py`, FMP docs (1.1MB JSON + 488KB md), "L'investitore intelligente" (1.3MB), tech_stack.md |
| L2 | `wiki/` | 58 pagine (12 sources, 41 concepts, 3 entities, 5 syntheses, 6 runbooks, 4 lint) |
| L3 | `management/` | 13 epiche, 57+ user stories, 169+ task, sprint.md, roadmap (R1.0 MVP done, R1.1 in progress) |
| L4 | `design_&_architecture/` | 20 ADR, OpenAPI spec, ER diagram, schema SQL, component docs, deploy runbook |
| L5 | `src/` | Codice sorgente (Kotlin + Next.js + Python sidecar + Docker) |
| memory | `memory/` | 3 episodic records |

## Agenti adapter (Claude Code / Cursor)

14 agenti per adapter: orchestrator, sync-docs, wiki-keeper, wiki-keeper-worker, product-manager, lead-architect, tpm, wiki-query, wiki-lint, be-dev, fe-dev, db-dev, qa-dev, infra-dev.

19 skill per adapter: citation-rules, dev-handoff, dev-protocol, heal-protocol, ingest-protocol, lint-checks, promote-status, propagate-resolution, query-protocol, scrivi-epica/task/user-story/wiki-page, state-scan, tech-scout, vcs-handoff, wiki-gap-protocol, wiki-log-entry, apri-question.

8 comandi: `/run`, `/sync-docs`, `/query`, `/lint`, `/promote`, `/heal`, `/dev`, `/topology`.

## CI / GitHub Actions

- **ci.yml**: BE gradle test (Testcontainers/pgvector), FE vitest, Playwright E2E mocked, Playwright E2E real-BE, Docker smoke build
- **contract-check.yml**: OpenAPI contract verification (BE gradle contractCheck + FE type generation)

## Note

- Il repo è **agent-agnostic**: il contratto vive in `PATTERN.md` (universale), gli adapter implementano i ruoli §2.
- Tutte le operazioni distruttive su VCS sono **gated umano** (PATTERN §7 r.14).
- Lo stato del progetto si **deduce dal filesystem** + `wiki/log.md` + `memory/episodic/` — mai file di stato scritti a mano.
- Owner: marcociullo86. Collaboratore: soli92 (simone.olivieri).

## Link

- **GitHub**: https://github.com/marcociullo86/agentic-value-investor-application
