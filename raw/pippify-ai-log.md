---

# AI Log — pippify

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

**Pippify**: app per libreria tracce audio con import (upload e **YouTube**), backend separato, frontend evoluto verso **Next.js** con API route e integrazione **yt-dlp** / fallback, UI **SoliDS** “cyberpunk” (**`@soli92/solids` ^1.14.1**, font in `frontend/public/index.html`, test **`frontend/src/solidsPackage.test.ts`**), test e CI backend.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: **Cursor** — `b6ac039` + `.cursor/rules/agents-context.mdc`. Milestone **P0/P1** nei messaggi commit. Nessun SDK chat nel frontend oltre integrazioni YouTube (`ytdl-core` / `yt-dlp`). Pattern commit duplicati suggeriscono sessioni assistite o rebase.

**Periodo di sviluppo**: 2026-03-16 (`a67b116` first commit) → 2026-04-08 (`36d689b` bump SoliDS).

**Numero di commit**: 34

---

## Aggiornamento 2026-04-27 — Soli Prof (RAG) / documentazione

- [soli-prof](https://github.com/soli92/soli-prof) indica questo repo in `CORPUS_REPOS` dove applicabile. Webhook `push` verso `https://soli-prof.vercel.app/api/webhooks/github` (HMAC) per re-ingest. Allineati `AGENTS.md` e riferimenti; i test del repo **non** dipendono.

---

## Aggiornamento 2026-04-29 — Branding frontend Soli + bump SoliDS

- Migrazione branding nel client CRA: asset Soli dedicati (`logo.svg`, `favicon.svg`, `apple-touch-icon.svg`, `soli-symbol.svg`) e wiring in `public/index.html` / `public/manifest.json`.
- Introduzione `BrandLoader` (`frontend/src/components/BrandLoader.tsx`) con integrazione nei flussi async principali (auth, play loading, import YouTube e upload cookies).
- Allineamento versione frontend su **`@soli92/solids` ^1.14.1** (`frontend/package.json`, lockfile, test `frontend/src/solidsPackage.test.ts`) + docs aggiornate (`README.md`, `frontend/README.md`, `AGENTS.md`).
- Validazione frontend eseguita: `CI=true npm test -- --watch=false` e `npm run build` entrambi verdi.

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — MVP CRA/backend e CORS

**Timeframe**: `a67b116` → `8d62ea4`.

**Cosa è stato fatto**: gitignore, config ambiente, CORS verso `pippify.vercel.app`, icone/titolo UI, API delete tracce, fix eslint.

**Evidenza di AI-assist** (inferita):

- Bassa/medio: commit molto granulari “style/chore” tipici di iterazione umana.

**Decisioni architetturali notevoli**:

- **Backend** separato con controlli CORS espliciti.

**Prompt chiave usati**

> **Prompt [inferito]**: "Crea monorepo frontend/backend con CORS verso Vercel, API delete tracce, fix eslint base."
> *Evidenza*: `8d62ea4`, `c82bde0`, commit style granulari.

**Lezioni apprese**

- **CORS esplicito** verso dominio produzione evita sorprese quando il frontend è su Vercel e API su host separato (`8d62ea4`).

### Fase 2 — Import YouTube: API route Next, ytdl-core, runtime Node

**Timeframe**: `9169bee`–`f7fdd4d` (componenti + `export const runtime = 'nodejs'`).

**Cosa è stato fatto**: componenti `YoutubeImport` / `YoutubeAudioExtractor`, dipendenze `ytdl-core`, fix compatibilità Vercel serverless.

**Evidenza di AI-assist** (inferita):

- Duplicazione simmetrica di messaggi (`c61fee3`/`37df310` entrambi “feat: aggiungi componente YoutubeImport”) suggerisce **ripetizione o merge/rebase** più che narrativa umana lineare — possibile tooling assistito o copia-incolla.

**Decisioni architetturali notevoli**:

- Esecuzione estrazione su **runtime Node** su Vercel per limiti delle librerie YouTube.

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi API route Next e componenti React per import audio YouTube con ytdl-core; imposta `runtime = 'nodejs'` su Vercel."
> *Evidenza*: `1371792`, `f7fdd4d`, commit duplicati `YoutubeImport`.

**Lezioni apprese**

- **ytdl-core** su runtime Edge/non-Node fallisce → dichiarare **`export const runtime = 'nodejs'`** (`f7fdd4d`).
- Duplicare commit con stesso messaggio (`c61fee3`/`37df310`) complica la lettura della history — squash consigliato.

### Fase 3 — Migrazione Next unificata, toolchain, rate limit, yt-dlp

**Timeframe**: `62e5427` feat(next) P0 → `83ec916` cookie YouTube e SoliDS.

**Cosa è stato fatto**: stabilizzazione build Next, rate limit/timeout, test Vitest/Jest, CI backend, import con **yt-dlp**, messaggi errore IT, tema SoliDS.

**Evidenza di AI-assist** (inferita):

- Milestone **P0/P1** in messaggi commit.
- Commit documentazione e fix anti-bot (`65789e2`) densi di contesto ToS/API.

**Decisioni architetturali notevoli**:

- Passaggio da **ytdl-core** verso **yt-dlp** come percorso preferito (`27f1cc1`, `908f8da`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Unifica toolchain Next (P0), aggiungi rate limit/timeout, test Vitest/Jest, CI backend, passa a yt-dlp con cookie utente, tema SoliDS cyberpunk."
> *Evidenza*: `62e5427`, `51dc75d`, `83ec916`, `65789e2`.

**Lezioni apprese**

- **Anti-bot YouTube** richiede messaggi UX localizzati e documentazione ToS (`65789e2`).
- **yt-dlp + cookie file** supera limiti di `getInfo` su alcuni video (`908f8da`, `83ec916`).

### Fase 4 — Tooling Node 22, AGENTS/Cursor, bump SoliDS

**Timeframe**: `0906815` → `36d689b`.

**Cosa è stato fatto**: upgrade dipendenze, documentazione, allineamento ecosistema soli92, bump `@soli92/solids` ^1.5.0.

**Evidenza di AI-assist** (inferita):

- `b6ac039` esplicita integrazione **Cursor** nella documentazione repo.

**Decisioni architetturali notevoli**:

- Allineamento versione **SoliDS** con altri progetti personali.

**Prompt chiave usati**

> **Prompt [inferito]**: "Allinea Node 22, AGENTS.md e regola Cursor, aggiorna dipendenze e bump @soli92/solids."
> *Evidenza*: `0906815`, `b6ac039`, `36d689b`.

**Lezioni apprese**

- Allineare **SoliDS** con altri repo personali riduce drift visivo cross-app (`36d689b` stesso giorno di bump multi-repo).

---

## Pattern ricorrenti identificati

- **Conventional commits** con scope (`feat(youtube):`, `fix(frontend/main):`).
- **Milestone P0/P1** nel linguaggio dei messaggi.
- **Doppio binario** frontend/backend con CORS e env dedicati.
- **Documentazione** aggiornata in parallelo alle fix ToS/anti-bot.

---

## Tecnologie e scelte di stack

- **Framework**: Next.js (API routes) + storico CRA/main (`frontend/main` nei messaggi)
- **Styling**: SoliDS, tema cyberpunk (`83ec916`)
- **State**: React hooks (inferito)
- **Deploy**: Vercel (commit runtime e CORS)
- **LLM integration**: nessuna nel prodotto utente

## Problemi tecnici risolti (inferiti)

1. **Formato audio YouTube non trovato**: `40171ae fix(youtube): evita No such format found…`.
2. **Anti-bot / messaggi IT**: `65789e2`.
3. **Passaggio cookie a yt-dlp**: `908f8da`, `83ec916`.
4. **Variabile inutilizzata eslint**: `6e0d309`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `36d689b` chore(deps): bump @soli92/solids to ^1.5.0
- `b6ac039` chore: add AGENTS.md, README link, Cursor agents-context rule
- `83ec916` feat: cookie YouTube per utente, sezione dedicata, SoliDS cyberpunk
- `27f1cc1` feat(backend): import YouTube con yt-dlp e fallback ytdl-core
- `62e5427` feat(next): P0 YouTube unificato, toolchain e build stabile
- `f7fdd4d` fix: aggiunto export const runtime = nodejs per compatibilità ytdl-core su Vercel
- `1371792` feat: aggiungi API route per estrazione audio da YouTube
- `a67b116` first commit - Pippify

### Fase bump — @soli92/solids 1.7.0 e font stack (2026-04-24)

**Cosa è stato fatto**: **`frontend/package.json`** su **`@soli92/solids` ^1.7.0**; link **Google Fonts** in **`frontend/public/index.html`**; test **`frontend/src/solidsPackage.test.ts`** (Jest/CRA); README frontend / **AGENTS** / questo log aggiornati.

**Lezioni**: in CRA usare **`npm install --legacy-peer-deps`** se `typescript@5` conflitta con `react-scripts@5` finché lo stack non migra a Vite/Next.

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `frontend/` e `backend/` (esclusi lockfile): nessun match prioritario in questa passata.
- **ToS YouTube / API ufficiali**: documentati nei commit anti-bot (`65789e2`) — restano vincoli legali non risolvibili solo in codice.
- **Debito tecnico inferito**: doppia stack CRA/Next in transizione — da consolidare o documentare archivio CRA se ancora presente.
- **Debito tecnico inferito**: dipendenza da binario `yt-dlp` in deploy serverless — verificare dimensione cold start e permessi filesystem per cookie.
- **Debito tecnico inferito**: test split Jest/Vitest (`ac75146`) — uniformare runner riduce manutenzione CI.

---

> **Nota metodologica**: completamento 2026-04-22; validare strategia YouTube con consulenza legale aggiornata.

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **34** commit
- **~8** file (`package.json` root/workspace, `AGENTS.md`, `.cursor/rules`, backend/frontend README, workflow CI se presenti)
- **0** TODO/FIXME rilevanti dal grep workspace su sorgenti

**Punti di minore confidenza:**

- Dettaglio esatto cartelle CRA vs Next non ispezionato file-per-file qui.
- Confidenza su “duplicati = AI”: potrebbe anche essere errore umano di `git commit` ripetuto.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.
