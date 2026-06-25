---
type: runbook
created: 2026-06-25
topic: npm-release
---
# Runbook: Release SoliDS su npm

> Procedura per rilasciare una nuova versione del pacchetto `@soli92/solids` su npm tramite `semantic-release` e GitHub Actions.

## Pre-requisiti

- Accesso al repo `soli92/solids` con permessi di push su `main`
- Secrets GitHub configurati nel repo:
  - `NPM_TOKEN` — token npm con permesso di publish su `@soli92/solids`
  - `GITHUB_TOKEN` — fornito automaticamente da GitHub Actions (non serve configurarlo)
- `npm run build` e `npm run test:tokens` passano senza errori in locale
- Commit redatti secondo la convenzione **Conventional Commits** (il formato dei commit determina il tipo di bump della versione da parte di `semantic-release`)

## Step

### Preparazione locale

1. Aggiorna le dipendenze e verifica che non ci siano regressioni:
   ```bash
   npm ci
   npm run build
   npm run test:tokens
   npm test
   ```
   `npm test` esegue: build + sanity token (`scripts/tokens-sanity.mjs`) + `build-storybook`.

2. Se hai modificato componenti esposti nel registry shadcn, sincronizza il registry:
   ```bash
   npm run registry:sync
   npm run registry:build
   ```

3. Se hai modificato brand assets o story, aggiorna `README.md`, `AI_LOG.md` e `CHANGELOG.md` secondo la convenzione del repo.

4. Verifica lo Storybook in locale per cambiu UI:
   ```bash
   npm run storybook
   ```

### Trigger della release

La release su npm è **completamente automatizzata** via GitHub Actions (`.github/workflows/release.yml`). Non è necessario eseguire comandi npm publish manualmente.

1. Fai push dei commit su `main`:
   ```bash
   git push origin main
   ```

2. GitHub Actions avvia il workflow `Release` con i seguenti step:
   - Checkout con `fetch-depth: 0` e `fetch-tags: true` (necessario per `semantic-release`)
   - Allineamento tag al remoto (`git fetch origin --tags --force`)
   - Rimozione tag locali non antenati di HEAD (pulizia tag orfani)
   - Setup Node 22
   - `npm ci`
   - `npm run build`
   - `npm run release` con `GITHUB_TOKEN` e `NPM_TOKEN`

3. `semantic-release` analizza i commit dall'ultimo tag e:
   - Se ci sono commit `fix:` → bump **patch**
   - Se ci sono commit `feat:` → bump **minor**
   - Se c'è `BREAKING CHANGE` nel corpo → bump **major**
   - Se non ci sono commit rilevanti → nessuna release

4. Dopo la release, il workflow `storybook-build` / `storybook-deploy` ricostruisce e pubblica automaticamente lo Storybook su GitHub Pages (`https://soli92.github.io/solids/`).

### Aggiornare i consumer dopo la release

Dopo che la nuova versione è disponibile su npm, i progetti consumer devono aggiornare la dipendenza:

```bash
npm install @soli92/solids@latest
# oppure specificando la versione:
npm install @soli92/solids@<x.y.z>
```

I consumer principali sono: `soli-prof`, `soli-dome`, `soli-dm-fe`, `casa-mia-fe`, `pippify`, `bachelor-party-claudiano`, `soli-projects`.

> ⚠️ Da verificare: non è documentato un processo automatico di PR bump nei consumer dopo una release. L'aggiornamento è manuale per ogni repo consumer.

## Verifica post-operazione

1. Verifica la pubblicazione su npm:
   ```
   https://www.npmjs.com/package/@soli92/solids
   ```
   La nuova versione deve comparire nella lista delle versioni.

2. Verifica la creazione del tag e della release su GitHub:
   ```
   https://github.com/soli92/solids/releases
   ```

3. Verifica il `CHANGELOG.md` aggiornato da `semantic-release` nel commit `chore(release): ...`.

4. Verifica che lo Storybook sia aggiornato su GitHub Pages:
   ```
   https://soli92.github.io/solids/
   ```

5. Testa l'installazione in un progetto consumer:
   ```bash
   npm install @soli92/solids@latest
   npm run build
   ```

## Rollback

`semantic-release` non supporta unpublish automatico. In caso di release difettosa:

1. **Depreca la versione difettosa** su npm (non fare unpublish se già scaricata da altri):
   ```bash
   npm deprecate @soli92/solids@<versione-difettosa> "Versione difettosa, usa <versione-precedente>"
   ```
   Richiede che l'utente npm locale abbia permessi di publish su `@soli92/solids`.

2. Correggi il bug e fai push di un commit `fix:` su `main` per triggerare una nuova patch release.

3. Nei progetti consumer, fissa la versione al tag precedente nel `package.json` fino alla nuova fix release.

> ⚠️ Da verificare: le credenziali npm locali per il comando `npm deprecate`. In CI la publish avviene tramite `NPM_TOKEN` secret, ma deprecate/unpublish manuale richiede accesso separato.

## Riferimenti

- [[design-system-solids]] — architettura e dettagli SoliDS
- [[solids]] — source page (comandi, file chiave, integrazione soli-prof)
- [[deployment-patterns]] — contesto CI/CD ecosistema
- [npmjs.com — @soli92/solids](https://www.npmjs.com/package/@soli92/solids)
- [Storybook SoliDS](https://soli92.github.io/solids/)
