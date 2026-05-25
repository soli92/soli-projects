---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-dm-be-agents.md]
status: draft
---
# Soli Dungeon Master Backend

> API Express 4 + TypeScript con Supabase per campagne D&D: personaggi, dadi, wiki SRD e CORS configurabile.

## Summary

Backend API per il Dungeon Master digitale, costruito con Express 4 e TypeScript, persistenza su Supabase (service role). Espone endpoint per campagne, personaggi (con scheda `sheet_data`, normalizzazione `class`/`class_name`), lancio dadi (`diceRoll`), e wiki SRD (classi, razze, divinità, regole) con cache su tabella `wiki_srd_cache` e fallback statico. Deploy su Render; `createApp()` separato per test con supertest [^src: raw/soli-dm-be-agents.md §Progetto].

## Stack

| Area | Tecnologia |
|------|------------|
| Framework | Express 4, TypeScript |
| Persistenza | Supabase (client service role) |
| Build | `tsc` → `dist/` (CommonJS) |
| Start produzione | `scripts/start.cjs` → `dist/server.js` |
| Wiki SRD | `wiki_srd_cache` (Supabase) + fallback statico |
| Test | Vitest — unit (`src/lib/*.test.ts`), integration (`*.integration.test.ts`), smoke (`smoke:cors`, `smoke:api`) |
| Deploy | Render (`render.yaml`) |

[^src: raw/soli-dm-be-agents.md §Progetto]

## Architettura test

| Layer | File | Scopo |
|-------|------|-------|
| Unit | `src/lib/*.test.ts`, `src/middleware/*.test.ts` | Logica pura (dadi, CORS, API key, tipologiche) |
| Integrazione HTTP | `src/*.integration.test.ts` | supertest + `createApp()` |
| Smoke produzione | `smoke:cors`, `smoke:api` | Verifica endpoint reali |

Mock Supabase globale in `vitest.setup.ts` con coda FIFO + fallback; helper `dbOk`, `dbList`, `dbErr` [^src: raw/soli-dm-be-agents.md §Test].

## Wiki SRD

Sync esterno da **dnd5eapi.co** con `npm run sync:wiki-srd` → upsert su `wiki_srd_cache` in Supabase. Se la tabella è vuota, il server usa dati statici da `src/data/wikiClassesStatic.ts` / `wikiRacesStatic.ts`. Divinità e regole core sono statiche in route dedicate [^src: raw/soli-dm-be-agents.md §Wiki SRD].

## Key integrations

- [[soli-dm-fe]] — frontend Next.js 15; comunicazione REST; API key opzionale (`SOLI_DM_API_KEY`) su tutte le route `/api/*` (escluso `GET /health` e preflight OPTIONS) [^src: raw/soli-dm-be-agents.md §Variabili d'ambiente]
- [[soli-prof]] — repository in `CORPUS_REPOS` per re-ingest RAG via webhook [^src: raw/soli-dm-be-agents.md §Integrazione Soli Prof]
- **Supabase** — persistenza con service role; `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (mai esposta al client) [^src: raw/soli-dm-be-agents.md §Variabili d'ambiente]
- **dnd5eapi.co** — fonte SRD per sync classi/razze/regole [^src: raw/soli-dm-be-agents.md §Wiki SRD]

## CORS

`CORS_ORIGIN` per allowlist (virgola-separata); `CORS_ALLOW_VERCEL_PREVIEW` per deploy preview Vercel (`CORS_VERCEL_PREVIEW_SUBSTRING` default `soli-dm`). Senza `CORS_ORIGIN`: `origin: true` [^src: raw/soli-dm-be-agents.md §Variabili d'ambiente].

## Commands

`npm run dev` · `npm run build` · `npm start` · `npm run type-check` · `npm test` · `npm run test:watch` · `npm run smoke:cors` · `npm run smoke:api` · `npm run sync:wiki-srd`

## Key files

- `src/createApp.ts` — app HTTP senza `listen` (testabile)
- `src/server.ts` — dotenv + listen
- `scripts/start.cjs` — entry produzione (trova root, fallback build su Render)
- `src/routes/characters.ts` — CRUD personaggi, normalizzazione `name`/`character_name`, `class`/`class_name`, `sheet_data`
- `src/lib/diceRoll.ts` — logica lancio dadi `NdX`
- `src/lib/tipologiche.ts` — default campagna/personaggio, allineamenti
- `src/scripts/syncWikiSrd.ts` — sync wiki SRD da dnd5eapi.co
- `src/middleware/apiKey.ts` — middleware API key
- `render.yaml` — deploy blueprint Render

## Deploy

Build su Render con `npm ci && npm run build`; start via `scripts/start.cjs` che carica `dist/server.js`. Root Directory deve restare **vuota** (root repo), altrimenti i path `dist/` non coincidono. Su Render, se `dist/server.js` manca e `RENDER` è valorizzato, esegue build una volta come fallback [^src: raw/soli-dm-be-agents.md §Deploy].

## Connections

- Related: [[soli-dm-fe]] — frontend diretto (REST API)
- Related: [[casa-mia-be]] — pattern simile (Express + multi-tenancy, CORS config, deploy Render)
- Related: [[soli-prof]] — indicizzato nel RAG multi-corpus
