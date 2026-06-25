---
type: synthesis
created: 2026-06-25
topic: testing-strategies
sources: [wiki/sources/soli-prof.md, wiki/sources/soli-agent.md, wiki/sources/soli-projects.md, wiki/sources/soli-dome.md, wiki/sources/soli-boy.md, wiki/sources/soli-dm-fe.md, wiki/sources/bachelor-party-claudiano.md, wiki/concepts/deployment-patterns.md]
---
# Testing Strategies — Approcci per Tipo di Progetto

## Overview

L'ecosistema soli92 usa Vitest come test runner universale per unit e integration test — è la scelta costante in tutti i repo frontend e fullstack. Playwright è adottato per gli E2E test nei progetti con flussi critici (soli-projects, soli-dome, soli-agent). soli-agent aggiunge una eval suite propria per la qualità dell'output AI. La CI (GitHub Actions) esegue la catena lint + type-check + test + build su tutti i repo, con job E2E separato dove configurato.

## Confronto per repo

| Repo | Unit/Integration | E2E | Eval/AI | Note |
|---|---|---|---|---|
| **soli-prof** | Vitest 3.x (unit su lib, hooks, webhook route) | Non documentato | — | Focus su lib e API routes; `npm test` / `npm run test:watch` |
| **soli-agent** | Vitest | Playwright (opzionale) | `npm run eval` (eval suite dedicata) | Dry-run mode per eval/CI (`lib/agent/tools/dry-run.ts`) |
| **soli-projects** | Vitest 3 (jsdom) | Playwright E2E Chromium | — | E2E su auth, wiki, navigation; job CI separato; env auth in CI |
| **soli-dome** | Vitest + Playwright E2E | Playwright E2E | — | `npm run test:all`; `src/solids-package.test.ts` per validazione range dipendenza |
| **soli-boy** | Vitest (in `packages/app/`) | — | — | Architettura monorepo Vite; WasmBoy + mGBA verificati in e2e (interno al ciclo factory) |
| **soli-dm-fe** | Vitest + Testing Library | — | — | `npm test`; focus su componenti React; `npm run type-check` esplicito |
| **bachelor-party-claudiano** | Vitest + Testing Library (happy-dom), Node test | — | — | `npm test` / `npm run test:watch`; happy-dom come environment |

[^src: wiki/sources/soli-prof.md §Stack — Testing: Vitest 3.x (unit su lib, hooks, webhook route)]
[^src: wiki/sources/soli-agent.md §Stack — Testing: Vitest, Playwright (E2E opzionale), eval suite (`npm run eval`)]
[^src: wiki/sources/soli-projects.md §Stack — Testing: Vitest 3 (jsdom) + Playwright (E2E Chromium); §CI — job ci + job e2e separato]
[^src: wiki/sources/soli-dome.md §Stack — Test: Vitest, Playwright (E2E); §Commands — `npm run test:all`]
[^src: wiki/sources/soli-boy.md §Stack — Vite; §Summary — WasmBoy (GB/GBC) e mGBA (GBA) verificati in e2e]
[^src: wiki/sources/soli-dm-fe.md §Stack — Test: Vitest + Testing Library]
[^src: wiki/sources/bachelor-party-claudiano.md §Stack — Test: Vitest + Testing Library (happy-dom), Node test]

## Pattern emergenti

### 1. Vitest come standard universale
Vitest è il test runner adottato in ogni repo frontend e fullstack dell'ecosistema. Non esiste nessun progetto che usi Jest. La scelta è coerente con il build tool (Vite o Next.js con Vitest config) e riduce la superficie di configurazione.
[^src: wiki/concepts/deployment-patterns.md §Key points — GitHub Actions CI standard: checkout, setup Node 22, npm ci, lint, type-check, test, build]

### 2. Playwright per E2E su flussi critici
Playwright (Chromium) è usato dove i flussi critici non possono essere validati solo a livello unit: autenticazione (soli-projects), navigazione (soli-projects, soli-dome), render wiki (soli-projects). soli-agent lo include come opzionale.
[^src: wiki/sources/soli-projects.md §CI — job e2e: install Playwright browsers, run E2E tests, upload report artifact; env auth vars]
[^src: wiki/sources/soli-dome.md §Stack — Test: Vitest, Playwright (E2E)]

### 3. Eval suite per qualità output AI (soli-agent)
soli-agent è l'unico progetto con una eval suite dedicata (`npm run eval`) per misurare la qualità dell'output del modello AI. Include una dry-run mode (`lib/agent/tools/dry-run.ts`) per eseguire scenari di test senza chiamate reali al LLM.
[^src: wiki/sources/soli-agent.md §Stack — eval suite (`npm run eval`); §Key files — `lib/agent/tools/dry-run.ts` modalità dry-run per eval/CI]

### 4. Validazione dipendenze come test
soli-prof, soli-dome e soli-projects includono un test dedicato alla validazione del range della dipendenza `@soli92/solids` (`lib/solids-package.test.ts` o `src/solids-package.test.ts`). Questo protegge da rotture silenti del design system.
[^src: wiki/sources/soli-projects.md §Key files — `lib/solids-package.test.ts`: Validates @soli92/solids range]
[^src: wiki/sources/soli-dome.md §Key files — `src/solids-package.test.ts`: validazione range @soli92/solids]

### 5. Testing Library per test di componenti React
I progetti con componenti React interattivi (soli-dm-fe, bachelor-party-claudiano) usano `@testing-library/react`. bachelor-party-claudiano usa `happy-dom` come environment (più leggero di jsdom).
[^src: wiki/sources/soli-dm-fe.md §Stack — Test: Vitest + Testing Library]
[^src: wiki/sources/bachelor-party-claudiano.md §Stack — Test: Vitest + Testing Library (happy-dom), Node test]

### 6. CI job separato per E2E
soli-projects separa il job E2E (`needs: ci`) da quello di lint/type-check/test/build. Gli E2E hanno bisogno di env vars auth (`SOLI_PROJECTS_SESSION_SECRET`, `SOLI_PROJECTS_PASSWORD`) configurate in CI. Il report Playwright viene preservato 7 giorni come artifact.
[^src: wiki/sources/soli-projects.md §CI — Job e2e (needs ci): checkout → setup-node → npm ci → install Playwright browsers → run E2E tests → upload report artifact; Playwright report retained 7 days]

### 7. Pipeline di correttezza FE con factory gate (soli-boy)
soli-boy, gestito come Agentic Factory llm-wiki++ v2.19, usa una pipeline di gate opt-in per la correttezza FE: `develop → visual-oracle → ux-ui-review/a11y → functional-oracle → code-review`. Il Functional Oracle (EP-018) esercita il flusso reale caricando una ROM di test.
[^src: wiki/sources/soli-boy.md §Factory & layer — Pipeline di correttezza FE: develop → visual-oracle → ux-ui-review/a11y → functional-oracle → code-review]

## Raccomandazione

- **Stack di base per ogni nuovo repo**: Vitest (unit) + `npm run type-check` (tsc --noEmit). Zero setup aggiuntivo con Vite o Next.js.
- **Aggiungere Playwright** quando il progetto ha flussi con auth, navigazione complessa, o UI critica. Usare job CI separato (`needs: ci`) per non bloccare il feedback rapido.
- **Testing Library** per componenti React interattivi; preferire `happy-dom` su `jsdom` per test più veloci quando non servono API browser avanzate.
- **Eval suite separata** per qualsiasi progetto che espone output AI: i test standard non misurano qualità semantica. Usare dry-run mode in CI.
- **Test di validazione dipendenze** (`solids-package.test.ts`): aggiungere in ogni repo che consuma `@soli92/solids` per proteggere da rotture silenti al momento del rilascio di nuove versioni.

> ℹ️ Informazione non disponibile nelle sorgenti attuali — da aggiungere al prossimo ingest: strategie di test di koollector (GraphQL + Expo), soli-platform (monorepo Docker), agentic-value-investor-application (Testcontainers — documentato in deployment-patterns ma non nel dettaglio del test setup).

## Riferimenti

- [[deployment-patterns]] — CI GitHub Actions standard (lint, type-check, test, build); Testcontainers in agentic-value-investor-application
- [[soli-agent]] — dry-run mode e eval suite per AI quality
- [[soli-boy]] — pipeline factory gate (Visual Oracle, Functional Oracle, A11y)
- [[soli-projects]] — E2E Playwright su auth + wiki + navigation con job CI separato
