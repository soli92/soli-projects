---
type: lint
created: 2026-06-25
topic: ci-coverage-audit
scope: EP-004 TSK-029
---
# CI Coverage Audit — 2026-06-25

> Audit conformità workflow GitHub Actions per i repository soli92. Ispezionati i workflow presenti localmente in `/Users/simone.olivieri/Documents/Personal/Repos/`. Ogni repo non trovato localmente è marcato "not checked locally".

## Metodologia

- Ispezione diretta dei file `.github/workflows/*.yml` per repo disponibili in locale.
- Colonne: **lint** (`npm run lint`), **typecheck** (`npm run type-check` o `tsc`), **test** (`npm test` o `npm run test:*`), **build** (`npm run build`), **deploy** (step di deploy automatico), **conformità** (rispetto al template `ci-template.md`).
- Legenda: ✅ presente | ❌ assente | N/A non applicabile | — non verificato localmente

## Tabella conformità

| Repo | Workflow CI | lint | typecheck | test | build | deploy | Conformità template |
|------|-------------|------|-----------|------|-------|--------|---------------------|
| **soli-prof** | `deploy.yml` (CI) | ❌ | ✅ `type-check` | ✅ `npm test` | ✅ | N/A (Vercel auto) | Parziale — manca lint |
| **soli-agent** | `deploy.yml` (CI) | ❌ | ✅ `type-check` | ✅ `npm test` | ✅ | N/A (Vercel auto) | Parziale — manca lint |
| **soli-agent** | `eval.yml` | N/A | N/A | ✅ eval suite | N/A | N/A | Workflow specializzato |
| **soli-agent** | `smoke-secrets.yml` | N/A | N/A | N/A | N/A | N/A | Workflow operativo (manual) |
| **solids** | `release.yml` | ❌ | ❌ | ❌ | ✅ | ✅ npm publish + Storybook Pages | Parziale — solo build + deploy |
| **solids** | `storybook-pages.yml` | N/A | N/A | N/A | ✅ Storybook | ✅ GitHub Pages | Workflow specializzato (manual) |
| **soli-platform** | `ci.yml` | ✅ | ❌ (solo build TS) | ✅ `test:ci` | ✅ + Docker build | N/A | Buona — manca typecheck esplicito |
| **soli-platform** | `publish-containers.yml` | N/A | N/A | N/A | ✅ Docker push | ✅ GHCR + SSH deploy | Workflow specializzato |
| **soli-platform** | `deploy.yml` | N/A | N/A | N/A | N/A | ✅ SSH manual | Workflow operativo (manual) |
| **soli-dm-fe** | `ci.yml` | ✅ | ✅ `type-check` | ✅ `npm test` | ✅ | N/A (Vercel auto) | ✅ Conforme |
| **soli-dm-be** | `cors-smoke.yml` | N/A | N/A | N/A | N/A | N/A | Workflow operativo (manual) — **nessun CI** |
| **casa-mia-be** | `deploy.yml` | ❌ | ❌ | ❌ | ❌ | ✅ Render deploy hook | Solo deploy — **nessun CI** |
| **pippify** | `ci.yml` | ❌ | ❌ | ✅ `test:run` (Vitest, FE+BE) | ✅ (FE) | N/A | Parziale — manca lint, typecheck |
| **soli-boy** | `ci.yml` | ❌ | ✅ `typecheck` | ✅ Vitest + Playwright E2E | ✅ | N/A | Parziale — manca lint |
| **soli-boy** | `cd-vercel.yml` | N/A | N/A | N/A | ✅ `vercel build` | ✅ Vercel CLI prod/preview | Workflow specializzato |
| **soli-projects** | — | — | — | — | — | — | No CI workflow |
| **soli-dome** | — | — | — | — | — | — | not checked locally (no .github/workflows) |
| **koollector** | — | — | — | — | — | — | not checked locally (no .github/workflows) |
| **bachelor-party-claudiano** | — | — | — | — | — | — | not checked locally (no .github/workflows) |
| **casa-mia-fe** | — | — | — | — | — | — | not checked locally (no .github/workflows) |
| **soli-dm-fe** — source entity | `ci.yml` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ Conforme |

## Riepilogo stato per repo

| Repo | Stato CI | Note |
|------|----------|------|
| soli-prof | Parziale | CI presente ma manca lint |
| soli-agent | Parziale | CI presente ma manca lint; eval suite separata |
| solids | Parziale | Solo build + release; nessun lint/typecheck/test nella CI |
| soli-platform | Buona | CI completa + Docker build verify; typecheck implicito nel build |
| soli-dm-fe | Conforme | Tutti gli step presenti |
| soli-dm-be | Critico | Nessun CI workflow — solo cors-smoke manuale |
| casa-mia-be | Critico | Solo deploy hook Render — nessun CI gate |
| pippify | Parziale | Test presente (Vitest), manca lint e typecheck |
| soli-boy | Parziale | Test Vitest + E2E Playwright, manca lint |
| soli-projects | Assente | Nessun workflow CI |
| soli-dome | Non verificato | Nessun .github/workflows locale |
| koollector | Non verificato | Nessun .github/workflows locale |
| bachelor-party-claudiano | Non verificato | Nessun .github/workflows locale |
| casa-mia-fe | Non verificato | Nessun .github/workflows locale |

## Gaps identificati

### Priorità ALTA

1. **`soli-dm-be` — nessun CI workflow**
   - Unico workflow: `cors-smoke.yml` (manuale, verifica CORS in produzione, non è CI).
   - Gap: zero lint, typecheck, test, build automatici.
   - Fix: creare `.github/workflows/ci.yml` dal template standard. Verificare se esiste script `npm run build` e `npm run type-check` nel `package.json`.

2. **`casa-mia-be` — solo deploy, nessun CI gate**
   - Workflow `deploy.yml` si limita a triggerare il deploy hook Render su push a `main`.
   - Gap: nessun lint, typecheck, test, build prima del deploy. Rischio di deployare codice rotto.
   - Fix: aggiungere job `ci` che esegue lint + typecheck + build come prerequisito del job `deploy`, oppure creare `ci.yml` separato.

3. **`soli-projects` — nessun CI**
   - Repo di KB: struttura prevalentemente Markdown, ma ha script Node (management tools, kanban).
   - Fix a bassa urgenza: se vengono aggiunti script TypeScript/Node, aggiungere CI minima.

### Priorità MEDIA

4. **`soli-prof` e `soli-agent` — mancano lint**
   - Entrambi hanno type-check, test e build ma non `npm run lint`.
   - Fix: aggiungere step lint prima di type-check (verificare che `npm run lint` sia configurato in `package.json`).

5. **`solids` — CI assente nel workflow release**
   - `release.yml` esegue `npm ci && npm run build && npm run release` senza lint/typecheck/test.
   - Fix: aggiungere job `ci` che precede `release` con lint + typecheck + test, o separare in workflow `ci.yml` dedicato.

6. **`pippify` — mancano lint e typecheck**
   - CI presente ma incompleta. Il frontend ha Vitest, il backend ha test ma nessun lint/typecheck.
   - Fix: aggiungere `npm run lint` e `npm run type-check` agli step di entrambi i job.

### Priorità BASSA

7. **`soli-boy` — manca lint**
   - CI ottima (Vitest + Playwright E2E), manca solo lint.
   - Fix: aggiungere `npm run lint` dopo install.

8. **`soli-platform` — typecheck implicito**
   - Il TypeScript build (`npm run build`) implica type check, ma non è esplicito come step separato.
   - Fix opzionale: aggiungere `npm run type-check` prima del build per feedback più rapido in CI.

9. **Repo senza CI locale** (soli-dome, koollector, bachelor-party-claudiano, casa-mia-fe)
   - Non verificabili localmente. Verificare su GitHub se hanno workflow o sono solo frontend statici.

## Note sul template soli-boy

soli-boy usa `actions/checkout@v6` e `actions/setup-node@v6` (anziché `@v4`). Il template soli92 standard specifica `@v4`. Questa divergenza non impatta la funzionalità ma rompe la consistenza. Da allineare a `@v4` in TSK-030.

## Riferimenti

- [[ci-template]] — template workflow CI condiviso
- [[deployment-patterns]] — architettura deploy ecosistema soli92
- `management/kanban/EP-004-infrastruttura-ci-cd/US-010-standardizzazione-workflow-ci/TSK-029.md`
