# AGENTS.md — contesto per assistenti AI

Riassunto operativo per **Pippify** (Next + CRA + Express). Dettaglio per cartella: **`README.md`**, **`backend/README.md`**. Stato file: **`git status`**.

**Aggiornato:** 2026-04-27

## Repo

Tre superfici: **root Next 16** (API YouTube / Vitest), **`frontend/`** CRA + Howler + **`@soli92/solids` ^1.14.1** (font in `frontend/public/index.html`), **`backend/`** Express 5 (JWT, Supabase, R2, import YouTube). Node **22+**. Uso personale: rispettare **copyright** e ToS YouTube.

## Cosa fare dopo (checklist)

1. **Root Next** — `.env.example` → `.env.local` dove serve; `npm run dev`, test con `npm run test` / `npm run test:run`.
2. **Backend** — `cd backend`, env da README backend, `npm start` (porta tipica API diversa da Next).
3. **Frontend CRA** — `REACT_APP_API_URL` verso backend; `cd frontend && npm start`.
4. **Integrazione YouTube** — cookie / limiti: vedere variabili in README root e `backend/README.md`.

## Comandi (root)

`npm run dev` · `npm run lint` · `npm test` · `npm run test:run` · `npm run build`

## File utili

`README.md` · `AI_LOG.md` · `.env.example` · `backend/README.md` · `frontend/` · `backend/`

### Integrazione Soli Prof (RAG / webhook)

Questo repository è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof) (`lib/rag-service/config.ts`). Un webhook GitHub su **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare **re-ingest** (HMAC; segreto solo lato Soli Prof / GitHub). I test e i comandi locali del repo **non** dipendono da quel canale. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

## Regole per l’agente

- Non committare segreti (JWT, Supabase, R2, cookie YouTube); solo `*.example`.
- Modifiche che toccano più cartelle: verificare coerenza URL API e CORS tra CRA e Express.
