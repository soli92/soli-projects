# AGENTS.md — contesto per assistenti AI

Riassunto operativo per riprendere il lavoro su `soli-platform`. Dettaglio storico: **`docs/CHANGELOG.md`**. Stato file corrente: **`git status`**.

**Aggiornato:** 2026-04-27

## Repo

Monorepo **Node 22+** (`soli-auth`, `soli-notification` + worker, `soli-gateway`, `soli-lib`). Immagini su **GHCR** (Actions). Architettura: `docs/ARCHITECTURE.md`. Terze parti: `docs/THIRD_PARTY_SETUP.md`.

## Cosa fare dopo (checklist)

1. **Git** — commit/push; poi verificare **CI** e **Publish containers** su GitHub (build multi-arch può essere più lenta).
2. **Oracle** (se serve) — OCI CLI + `deploy/provision-oci-arm-retry.sh` (variabili in testa allo script); rete e stack: `deploy/ORACLE_FREE_TIER.md`.
3. **Deploy app** — `deploy/README.md`, `stack.env` / `.env` compose, `npm run check:env`, `docker login ghcr.io` se GHCR privato.

## Comandi

`npm run test:ci` · `npm run lint` · `npm run build` · `npm run check:env` · `npm run e2e:smoke` (con servizi e opz. `E2E_*`)

## File utili

`docs/CHANGELOG.md` · `AI_LOG.md` · `deploy/README.md` · `deploy/ORACLE_FREE_TIER.md` · `deploy/provision-oci-arm-retry.sh` · `.github/workflows/publish-containers*.yml`


### Integrazione Soli Prof (RAG / webhook)

Questo monorepo è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof) (`lib/rag-service/config.ts`). Un webhook GitHub su **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare **re-ingest** (HMAC). I comandi `npm run test:ci` / `lint` / `build` **non** dipendono da quel canale. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

## Regole per l’agente

- Task su deploy/CI/Oracle: leggere **`docs/CHANGELOG.md`** (\[Non rilasciato\]) e questa checklist.
- Non committare segreti (`deploy/.env`, `stack.env` locali; in repo preferire `*.example`).
- Dopo cambi rilevanti a workflow/deploy: aggiornare **`docs/CHANGELOG.md`** e, se serve, la checklist qui sopra.
