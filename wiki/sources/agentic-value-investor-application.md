---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [agentic-value-investor-application-readme.md]
status: draft
---
# Agentic Value Investor Application

> Piattaforma multi-agente per screening azionario automatizzato stile Buffett/Munger, composta da un bot Python LangGraph e una web app full-stack Kotlin/Next.js, costruita sulla factory llm-wiki++ v2.8.

## Summary

Progetto in collaborazione con marcociullo86 (non soli92-owned). Combina due componenti: un bot Python LangGraph (~2350 righe) che esegue screening finanziario automatizzato usando Claude Opus 4.7 per analisi profonda e Google Gemini per task leggeri, e una web app full-stack (Kotlin/Spring Boot backend + React/Next.js 16 frontend + PostgreSQL 17 con pgvector + Python embeddings sidecar) [^src: raw/agentic-value-investor-application-readme.md §Progetto]. Il repo segue il pattern [[soli-multi-agents-factory]] v2.8 con topologia `full-stack-agents` e tutti i dev-agent attivi [^src: raw/agentic-value-investor-application-readme.md §Topologia attiva].

## Stack

| Layer | Tech |
|-------|------|
| **Bot Python** | LangGraph, Claude Opus 4.7, Google Gemini, SEC EDGAR, FMP API |
| **Backend** | Kotlin 2.2 + Spring Boot 3.5 (JVM 17+, Gradle) |
| **Frontend** | React 19 + Next.js 16 (App Router, RSC, Turbopack) |
| **Database** | PostgreSQL 17 + Flyway 10.x + Spring Data JPA + pgvector |
| **Embeddings** | Python FastAPI sidecar (Qwen3-Embedding-0.6B) |
| **QA** | JUnit 5 + Testcontainers + Playwright + Vitest |
| **CI** | GitHub Actions (Gradle test, Vitest, Playwright E2E, Docker smoke, OpenAPI contract) |
| **Factory** | llm-wiki++ v2.8, 14 agenti, 19 skill, 8 comandi |
| **VCS** | Monorepo, branch shared, commit coupling float |

[^src: raw/agentic-value-investor-application-readme.md §Stack]

## Repo metadata

| Campo | Valore |
|-------|--------|
| **Owner** | marcociullo86 |
| **Collaboratore** | soli92 (simone.olivieri) |
| **URL** | https://github.com/marcociullo86/agentic-value-investor-application |
| **Pattern** | llm-wiki++ v2.8 |
| **Topology** | `full-stack-agents` |
| **Linguaggi** | Kotlin 61%, TypeScript 21%, Python 18% |

## Componenti principali

### Bot Python (`agent.py`)

Pipeline LangGraph multi-agente: screener (4 segnali) → per-ticker loop (dati finanziari → lettura 10-K/10-Q SEC → sentiment news → price action → DCF → decisione Munger → verdetto) → report HTML [^src: raw/agentic-value-investor-application-readme.md §Componente Python].

### Web application (`src/`)

Riproduce la stessa analisi value investing come piattaforma web con backend Kotlin/Spring Boot, frontend Next.js 16, e un embeddings sidecar Python FastAPI [^src: raw/agentic-value-investor-application-readme.md §Componente web].

### Factory knowledge base

58 pagine wiki, 13 epiche con 169+ task, 20 ADR, OpenAPI spec. Roadmap: R1.0 MVP completato, R1.1 consolidation in progress [^src: raw/agentic-value-investor-application-readme.md §Layer factory].

## Key integrations

- **[[anthropic-claude]]** — Claude Opus 4.7 per analisi finanziaria profonda nel bot Python; modello principale per task complessi [^src: raw/agentic-value-investor-application-readme.md §Componente Python]
- **[[soli-multi-agents-factory]]** — il repo adotta il pattern llm-wiki++ v2.8 con topologia full-stack-agents (la versione piu avanzata in uso nell'ecosistema) [^src: raw/agentic-value-investor-application-readme.md §Progetto]
- **pgvector** — usato nel database PostgreSQL 17 per embeddings vettoriali, senza Supabase (a differenza di [[soli-prof]] e [[soli-projects]]) [^src: raw/agentic-value-investor-application-readme.md §Stack]

## Differenze vs ecosistema soli92

| Aspetto | soli92 repos | Questo repo |
|---------|-------------|-------------|
| **Ownership** | soli92 | marcociullo86 (collaborazione) |
| **Backend** | Node.js/Express o Next.js API | Kotlin/Spring Boot |
| **Database** | Supabase (pgvector) | PostgreSQL 17 diretto (pgvector + Flyway) |
| **Build** | npm | Gradle (BE) + npm (FE) |
| **CI** | Lint + type-check + test + build | + Testcontainers + Playwright real-BE + Docker smoke + OpenAPI contract |
| **Factory pattern** | v2.11 plan-only (soli-projects) | v2.8 full-stack-agents |
| **LLM** | Claude Haiku/Sonnet | Claude Opus 4.7 + Gemini |
| **Design system** | @soli92/solids | Non usato |

## Connections

- Related: [[soli-multi-agents-factory]] — sorgente del pattern llm-wiki++ adottato (v2.8 vs v2.11)
- Related: [[anthropic-claude]] — Claude Opus 4.7 per analisi finanziaria profonda
- Related: [[deployment-patterns]] — CI con Docker, Testcontainers, OpenAPI contract check
- Contrasts with: [[soli-projects]] — stesso pattern factory ma topologia full-stack-agents vs plan-only
