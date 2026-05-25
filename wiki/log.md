---
type: log
created: 2026-05-25
---
# Wiki Log

> Append-only. Ogni ingest, lint, heal, promote, query persistita appende qui.

## 2026-05-25 — Bootstrap
- Creato: wiki/index.md, wiki/log.md, wiki/gaps.md
- Topologia: plan-only (knowledge base cross-progetto)
- Pattern version: 2.11 (da soli-multi-agents-factory)
- Adapter: .cursor/ (Cursor IDE)
- Note: primo scaffolding della KB centralizzata per i 16 repository soli92.

## 2026-05-25 — Ingest batch: source pages + concept pages + entity pages
- Created (sources): wiki/sources/llm-wiki-template.md, wiki/sources/soli-obsidian-vault.md, wiki/sources/soli-multi-agents-factory.md
- Created (concepts): wiki/concepts/design-system-solids.md, wiki/concepts/rag-pipeline.md, wiki/concepts/deployment-patterns.md, wiki/concepts/supabase-integration.md, wiki/concepts/cross-repo-webhooks.md, wiki/concepts/pwa-patterns.md
- Created (entities): wiki/entities/vercel.md, wiki/entities/supabase.md, wiki/entities/anthropic-claude.md
- Updated: wiki/index.md (aggiunta navigazione per tutte le nuove pagine)
- Contradictions: none
- Notes: primo ingest strutturato della KB. Pagine source per i 3 repo rimanenti (llm-wiki-template, soli-obsidian-vault, soli-multi-agents-factory). 6 concept pages cross-cutting (design system, RAG, deploy, Supabase, webhooks, PWA). 3 entity pages (Vercel, Supabase, Anthropic Claude). Tutte le pagine hanno citazioni tracciate a raw/. Concetti non promossi a pagina propria: Obsidian (solo editor, non un concetto architetturale), Git submodule strategy (menzionata in soli-projects ma non ancora operativa), Generative UI (specifico di soli-prof, non cross-cutting).

## 2026-05-25 — Ingest: bachelor-party-claudiano, casa-mia-fe, casa-mia-be, soli-dm-fe, soli-dm-be
- Created: wiki/sources/bachelor-party-claudiano.md, wiki/sources/casa-mia-fe.md, wiki/sources/casa-mia-be.md, wiki/sources/soli-dm-fe.md, wiki/sources/soli-dm-be.md
- Updated: wiki/log.md
- Contradictions: nessuna
- Notes: primo batch ingest da raw/ — 5 repository (app eventi, casa, D&D). Wikilink incrociati tra source page (es. casa-mia-fe ↔ casa-mia-be, soli-dm-fe ↔ soli-dm-be). Pattern comuni evidenziati: SoliDS condiviso, integrazione Soli Prof RAG, Supabase come persistenza.

## 2026-05-25 — Ingest: soli-agent-agents.md, soli-prof-agents.md, soli-projects-agents.md, soli-platform-agents.md
- Created: wiki/sources/soli-agent.md, wiki/sources/soli-prof.md, wiki/sources/soli-projects.md, wiki/sources/soli-platform.md
- Updated: wiki/index.md, wiki/log.md
- Contradictions: nessuna
- Note: primo batch di source page (4 su 16 repo). Ogni pagina documenta stack, integrazioni chiave, comandi e file principali. Wikilink cross-repo inseriti dove le integrazioni sono esplicite nella sorgente.

## 2026-05-25 — Ingest: solids-agents.md, koollector-agents.md, soli-dome-agents.md, pippify-agents.md
- Created: wiki/sources/solids.md, wiki/sources/koollector.md, wiki/sources/soli-dome.md, wiki/sources/pippify.md
- Updated: wiki/log.md
- Contradictions: nessuna
- Notes: prima ingest batch di 4 sorgenti AGENTS.md. Tutti i repo hanno integrazione Soli Prof (webhook push per re-ingest HMAC). SoliDS è consumer trasversale (usato da soli-dome, pippify, e molti altri). Koollector non dichiara dipendenza esplicita da SoliDS nel suo AGENTS.md.

## 2026-05-25 — PM update: governance collaborazioni esterne post-ingest agentic-value-investor-application
- Updated: management/kanban/EP-002-knowledge-base-centralizzata/EP-002.md (scope 17 repo, policy read-only collaborazioni, rischio sync manuale)
- Updated: management/kanban/EP-003-rag-ai-intelligence/US-008-estensione-corpus-indicizzati/US-008.md (esclusione CORPUS_REPOS per repo esterni, perimetro RAG solo soli92)
- Updated: management/kanban/EP-004-infrastruttura-ci-cd/US-010-standardizzazione-workflow-ci/US-010.md (pattern CI come riferimento lettura, no push template verso esterni)
- Updated: management/roadmap.md (conteggi, policy governance collaborazioni esterne)
- Updated: wiki/index.md (nota collaborazioni read-only)
- Contradictions: nessuna
- Notes: primo aggiornamento PM post-ingest di un repo non soli92-owned. Nessuna nuova epica necessaria: i 6 temi cross-cutting restano validi. Vincolo chiave: flusso read-only (ingest KB + tracking kanban, zero scrittura verso il repo esterno).

## 2026-05-25 — Ingest: agentic-value-investor-application (collaborazione marcociullo86)
- Created (raw): raw/agentic-value-investor-application-readme.md
- Created (source): wiki/sources/agentic-value-investor-application.md
- Updated: wiki/index.md (17o progetto, conteggi aggiornati: 47 raw, 26 wiki pages)
- Updated: wiki/concepts/deployment-patterns.md (Docker multi-stage, Testcontainers, OpenAPI contract, Gradle+npm dual build)
- Updated: wiki/entities/anthropic-claude.md (Claude Opus 4.7 per value investing bot + Gemini)
- Updated: wiki/sources/soli-multi-agents-factory.md (cross-ref: consumer v2.8 full-stack-agents)
- Updated: raw/.extraction-manifest.json (nuova entry manual-sync)
- Contradictions: nessuna
- Notes: primo repo non soli92-owned nella KB (collaborazione con marcociullo86). Concetti non promossi a pagina propria: Value Investing/Buffett-Munger (dominio specifico, non cross-cutting tech), LangGraph (un solo progetto), SEC EDGAR/FMP API (data source finanziari), Kotlin/Spring Boot (stack specifico), Testcontainers (pattern CI locale).

## 2026-05-25 — Plan: ciclo PM → L3 management + L4 architecture
- Operazione: Plan (L2 → L3) + Design (L3 → L4)
- Ruoli: PM (product-manager) + Arch (lead-architect)
- Created (epiche):
  - management/kanban/EP-001-consolidamento-design-system/EP-001.md
  - management/kanban/EP-002-knowledge-base-centralizzata/EP-002.md
  - management/kanban/EP-003-rag-ai-intelligence/EP-003.md
  - management/kanban/EP-004-infrastruttura-ci-cd/EP-004.md
  - management/kanban/EP-005-supabase-schema-auth-realtime/EP-005.md
  - management/kanban/EP-006-pwa-cross-device/EP-006.md
- Created (user stories): US-001 … US-018 (18 storie, 3 per epica)
- Created (task): TSK-001 … TSK-054 (54 task, 3 per storia, consumer: human)
- Created (ADR):
  - design_&_architecture/decisions/ADR-001-solids-as-shared-design-system.md
  - design_&_architecture/decisions/ADR-002-supabase-shared-project-namespace.md
  - design_&_architecture/decisions/ADR-003-soli-projects-as-central-kb.md
  - design_&_architecture/decisions/ADR-004-rag-multi-corpus-rrf.md
  - design_&_architecture/decisions/ADR-005-deployment-multi-provider.md
- Updated: management/roadmap.md (piano derivato con priorità, stime, dipendenze)
- Contradictions: nessuna
- Notes: primo ciclo PM completo dalla wiki (25 source pages → 6 epiche cross-progetto). Topologia plan-only: tutti i task hanno consumer=human. Stima complessiva ~117h. Epiche derivate da 6 temi cross-cutting identificati nelle concept pages: design system, KB centralizzata, RAG pipeline, CI/CD, Supabase integration, PWA patterns.
