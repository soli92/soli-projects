---
type: runbook
created: 2026-06-25
topic: ci-template
---
# Runbook: Template CI condiviso — GitHub Actions soli92

> Template di riferimento per i workflow GitHub Actions dell'ecosistema soli92. Ogni repo soli92-owned deve avere almeno questi step nella propria pipeline CI.

## Step minimi raccomandati

Un workflow CI soli92 conforme deve includere, nell'ordine:

1. **`actions/checkout@v4`** — clone del repo (con `submodules: true` se il repo li usa)
2. **`actions/setup-node@v4`** con `node-version: '22'` e `cache: 'npm'` — setup runtime + cache dipendenze
3. **`npm ci`** — installazione riproducibile da `package-lock.json`
4. **`npm run lint`** — ESLint / linting (se configurato nel repo)
5. **`npm run type-check`** — TypeScript type check (`tsc --noEmit` o script equivalente)
6. **`npm test`** — suite di test (solo se il repo ha test configurati — vedi sezione requisiti)
7. **`npm run build`** — build di produzione (verifica che il bundle compili senza errori)

## Snippet YAML completo: `ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  ci:
    runs-on: ubuntu-latest

    env:
      NODE_VERSION: 22

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: true  # rimuovere se il repo non usa submoduli

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

Salva questo file in `.github/workflows/ci.yml` nella root del repo.

## Variazioni per tipo di progetto

### Next.js su Vercel

Il workflow standard si applica senza modifiche. Note:

- `npm run build` esegue `next build` e verifica anche i type check Next.js (se configurato così).
- Se il repo usa `--webpack` (es. soli-agent), nessuna modifica al workflow è necessaria: il flag è nel `package.json`.
- Per soli-agent con eval suite: aggiungere un secondo job `eval` separato (non parte del template base) che dipende dal job `ci` e usa `pull_request` come trigger specifico.
- Vercel esegue la sua build autonomamente al push su `main`: il job `build` in CI serve solo come gate preventivo.

### Express backend su Render

Il workflow standard si applica. Note aggiuntive:

- `npm run build` deve compilare TypeScript in `dist/` (`tsc` o build tool equivalente).
- Aggiungere un check finale che verifica che `dist/index.js` esista:
  ```yaml
  - name: Verify build output
    run: test -f dist/index.js
  ```
- Il deploy su Render è separato: avviene tramite push su `main` (auto-deploy) o tramite deploy hook. Non includere step di deploy nel CI principale.

### Docker / monorepo (soli-platform)

Il workflow base va esteso con un secondo job `docker`:

```yaml
  docker:
    name: Docker build (verify)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - name: Validate docker-compose
        run: docker compose -f deploy/docker-compose.prod.yml config --quiet
      - name: Build image (no push)
        uses: docker/build-push-action@v6
        with:
          context: .
          file: Dockerfile.<service>
          push: false
          tags: <service>:ci
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Il publish delle immagini su GHCR deve stare in un workflow separato (`publish-containers.yml`) che si attiva solo dopo CI verde su `main` (pattern `workflow_run`).

### Monorepo con più package (pippify, soli-boy)

Usare `defaults.run.working-directory` per ogni job:

```yaml
jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: packages/app/package-lock.json
      - run: npm ci
      - run: npm test
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      # ...
```

## Requisiti per abilitare `npm test`

Prima di aggiungere lo step `npm test` in CI, il repo deve soddisfare questi requisiti:

### package.json con Vitest (preferito)

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.x"
  }
}
```

### package.json con Jest

```json
{
  "scripts": {
    "test": "jest --ci --passWithNoTests"
  },
  "devDependencies": {
    "jest": "^29.x"
  }
}
```

Note:
- **`--passWithNoTests`** (Jest) o equivalente Vitest evita che CI fallisca su repo senza test file ancora presenti.
- **Vitest** è preferito per i nuovi repo (compatibile con ESM, config minimale, integrazione nativa con Vite/Next.js).
- Per backend Express/Node puri, usare Vitest con `environment: 'node'` in `vitest.config.ts`.
- Il flag `CI: true` in env è buona prassi per Jest (disabilita watch mode).

### Repo senza test configurati

Se il repo non ha ancora una test suite, usare uno script placeholder:

```json
{
  "scripts": {
    "test": "echo 'No tests configured yet' && exit 0"
  }
}
```

Questo mantiene il template uniforme e rende visibile nel kanban il gap da colmare (TSK-030).

## Riferimenti

- [[deployment-patterns]] — architettura deploy ecosistema soli92
- [[deploy-vercel]] — runbook deploy Vercel
- [[deploy-render]] — runbook deploy Render
- `wiki/lint/ci-coverage-audit-2026-06-25.md` — audit conformità CI per repo soli92
