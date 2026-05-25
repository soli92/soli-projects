# AGENTS.md — contesto per assistenti AI

Riassunto operativo per **Soli Dome** (portale app / home links). Dettaglio: **`README.md`**. Stato file: **`git status`**. Memoria sviluppo AI-assisted: **`AI_LOG.md`**.

**Aggiornato:** 2026-04-29

## Repo

**Next.js 16**, **React 19**, Tailwind + **`@soli92/solids` ^1.14.1**, **Lucide**. Node **22+**. Font stack in **`src/app/layout.tsx`**. Dati app in **`src/data/apps.ts`** (incl. **Health, Wand and Fire**; test in `apps.test.ts`, più **`src/solids-package.test.ts`** per il range SoliDS). Branding/loader PWA: `src/components/SoliBrandLogo.tsx`, `src/components/SoliLogoLoader.tsx`, `src/app/manifest.ts`.

## Cosa fare dopo (checklist)

1. **Dopo modifiche alle app** — aggiornare `src/data/apps.ts`; eseguire `npm run test` (Vitest).
2. **Prima di PR** — `npm run lint`, `npm run test`, opz. `npm run test:e2e` o `npm run test:all`.
3. **Release / deploy** — `npm run build` come da README.

## Comandi

`npm run dev` · `npm run lint` · `npm run test` · `npm run test:watch` · `npm run test:e2e` · `npm run test:all` · `npm run build`

## File utili

`README.md` · `AI_LOG.md` · `src/data/apps.ts` · `src/solids-package.test.ts` · `src/app/manifest.ts` · `src/components/SoliBrandLogo.tsx` · `src/components/SoliLogoLoader.tsx` · `playwright.config.ts`

### Integrazione Soli Prof (RAG / webhook)

Questo repository è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof) (`lib/rag-service/config.ts`). Un webhook GitHub su **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare **re-ingest** (HMAC; segreto solo lato Soli Prof / GitHub). I test e i comandi locali del repo **non** dipendono da quel canale. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

## Regole per l’agente

- UI dark / glass: rispettare pattern e token **SoliDS** già usati nel progetto.
- Non introdurre dipendenze non necessarie; stack volutamente snello.

## Known edge cases & gotchas

- **Export `apps`/`categories` strettamente coerenti**: in questo repo errori su export/import di `apps` e `categories` hanno già causato bug runtime silenziosi; quando tocchi i dati o i consumatori, verifica sempre i named export effettivi. Riferimenti: `8269fef`, `e7c4cc5`, `a70c48b`.

- **Scroll desktop/touchpad fragile con `overflow: hidden` annidato**: mettere `overflow: hidden` su wrapper intermedi può rompere lo scroll (specialmente touchpad desktop). Il pattern stabilizzato è lasciare lo scroll su `html/body` ed evitare blocchi non necessari nei container. Riferimenti: `1a2e4a2`, `28e2b9b`, `55af31d`, `dc56b13`.

- **PWA: layout, manifest e path icone devono combaciare**: la PWA funziona in modo affidabile solo se meta/layout, manifest e file icone (192/512) restano coerenti tra loro; mismatch sui path rompe installazione/offline UX. Riferimenti: `304ca1b`, `0b7e553`, `4742737`, `28de86c`.

- **Prop contrattuali UI da non perdere (`categories`, `index`)**: regressioni già avvenute per prop mancanti o errate (`categories` in page e `index` in `AppCard`), quindi durante refactor va verificata la compatibilità delle prop attese. Riferimenti: `8fa45ed`, `9c72f78`, `8dc0d8f`.
