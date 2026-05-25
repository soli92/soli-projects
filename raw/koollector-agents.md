# AGENTS.md — contesto per assistenti AI

Riassunto operativo per **Koollector**. Dettaglio setup: **`README.md`**. Stato file: **`git status`**.

**Aggiornato:** 2026-04-27

## Repo

Monorepo **npm workspaces**: **`apps/api`** (GraphQL Apollo + Express, Postgres, porta **4000**), **`apps/mobile`** (Expo + SQLite + Apollo). Node **22+**.

## Cosa fare dopo (checklist)

1. **Database** — `npm run db:up` (Docker); connection string in `README`; reset con `npm run db:reset` se serve schema pulito.
2. **API** — `cp apps/api/.env.example apps/api/.env`, poi `npm run dev:api`.
3. **Mobile** — `npm run dev:mobile` o `npm run dev` (API + mobile insieme con `concurrently`).
4. **Typecheck API** — `npm run typecheck:api` prima di PR se tocchi `apps/api`.

## Comandi

`npm run db:up` · `npm run db:reset` · `npm run dev:api` · `npm run dev:mobile` · `npm run dev` · `npm run typecheck:api`

## File utili

`README.md` · `AI_LOG.md` · `apps/api/` · `apps/mobile/` · `docker-compose.yml` · `scripts/db-init.sql`

### Integrazione Soli Prof (RAG / webhook)

Questo repository è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof) (`lib/rag-service/config.ts`). Un webhook GitHub su **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare **re-ingest** (HMAC; segreto solo lato Soli Prof / GitHub). I test e i comandi locali del repo **non** dipendono da quel canale. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

## Regole per l’agente

- Non committare `.env` con credenziali reali; usare solo `.env.example` come riferimento.
- Coerenza GraphQL + client mobile: verificare tipi e URL API/WS descritti nel README.
