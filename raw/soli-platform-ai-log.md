---

# AI Log — soli-platform

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

**soli-platform**: monorepo iniziale con servizi **soli-auth**, **soli-notification**, **soli-lib**, poi estensione a **soli-gateway**, provider di notifica, **CI/CD** (GitHub Actions, immagini **GHCR**), **Docker Compose** per produzione su VPS, documentazione **Oracle Free Tier** + **Caddy**, database **Neon** / schemi **Supabase** dedicati.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: **nessun** riferimento “Cursor” nei messaggi commit analizzati; presenza `AGENTS.md` e `docs/ARCHITECTURE.md` (`f0e5534`) compatibile con authoring assistito. Commit `1c5a13c` menziona “agente” (ambiguo). Nessun SDK LLM nel runtime piattaforma.

**Periodo di sviluppo**: 2026-03-25 (`cae7058` initial monorepo) → 2026-03-26 (`3d4c0e3` multi-arch GHCR + script OCI ARM).

**Numero di commit**: 16

---

## Aggiornamento 2026-04-27 — Soli Prof (RAG) e documentazione incrociata

- Allineati `AGENTS.md`, `README` e (qui) al legame con [soli-prof](https://github.com/soli92/soli-prof) (`CORPUS_REPOS`, ingresso `push` / webhook `/api/webhooks/github`). I test `npm run test:ci` restano indipendenti.

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Monorepo iniziale e fondamenta dati

**Timeframe**: `cae7058` → `f5e548d` (schemi Supabase dedicati).

**Cosa è stato fatto**: struttura monorepo soli-auth / soli-notification / soli-lib; CI iniziale + Dockerfiles + GHCR; migrazioni DB con schemi dedicati; switch documentazione verso Neon.

**Evidenza di AI-assist** (inferita):

- Commit `f0e5534 docs: centralize soli-platform architecture in docs/ARCHITECTURE.md` — tipico output di sessione di design documentato con assistenza.

**Decisioni architetturali notevoli**:

- **Schemi separati** su Postgres per auth e notification (`f5e548d`).
- Uso **Neon** documentato come default Postgres (`e8b44c8`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Inizializza monorepo soli-auth/soli-notification/soli-lib con CI, Docker GHCR, migrazioni Postgres a schemi dedicati e doc Neon vs Supabase."
> *Evidenza*: `cae7058`, `50a0e20`, `f5e548d`, `e8b44c8`, `f0e5534`.

**Lezioni apprese**

- **Schemi dedicati** riduono collisioni tra servizi sullo stesso Postgres (`f5e548d`).

### Fase 2 — Gateway, notification providers, release flow

**Timeframe**: `f0d0517` → `258c21c`.

**Cosa è stato fatto**: soli-gateway, provider notifiche, documentazione su trigger GitHub Release per immagini `:latest`, guida `gh`/`GH_TOKEN` per rilasci da agente.

**Evidenza di AI-assist** (inferita):

- `1c5a13c docs(ci): guida gh/GH_TOKEN per rilasci da agente` — parola **agente** nel messaggio (ambiguo: human agent vs AI agent).

**Decisioni architetturali notevoli**:

- **GHCR** come registry immagini post-CI.

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi soli-gateway, provider notifica, documentazione release GitHub (`:latest`) e guida gh/GH_TOKEN per rilasci da agente."
> *Evidenza*: `f0d0517`, `258c21c`, `1c5a13c`.

**Lezioni apprese**

- Immagini **`:latest`** dipendono da evento **Release published** — documentare il trigger evita falsi negativi (`258c21c`).

### Fase 3 — Deploy compose, Oracle + Caddy, SSH dopo publish

**Timeframe**: `f749252` → `3d4c0e3`.

**Cosa è stato fatto**: compose produzione, guida VPS, socket env loopback, validazione compose in CI, deploy SSH automatico post-publish, immagini **multi-arch** amd64/arm64 e script provision ARM su OCI.

**Evidenza di AI-assist** (inferita):

- Ampiezza documentazione infra in 48h di wall-clock (25→26 marzo) con commit atomici — possibile accelerazione assistita.

**Decisioni architetturali notevoli**:

- **Multi-arch** container per ARM su Oracle Free Tier (`3d4c0e3`).
- **Caddy** per TLS in produzione (`93e842d`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi Docker Compose prod (GHCR), guide Oracle Free Tier + Caddy, validazione compose in CI, deploy SSH post-publish, immagini multi-arch e script provision ARM OCI."
> *Evidenza*: `f749252`, `93e842d`, `3348453`, `cc92489`, `3d4c0e3`.

**Lezioni apprese**

- **Multi-arch** (amd64/arm64) è necessario se il VPS ARM non può eseguire immagini amd-only (`3d4c0e3`).
- Validare **compose in CI** prima del deploy evita errori solo in produzione (`3348453`).

---

## Pattern ricorrenti identificati

- **Docs-first** per ogni salto infra (CI, deploy, DB).
- **Conventional commits** con scope `ci`, `docs`, `feat`, `db`.
- **Accoppiamento CI + release**: gate su compose, publish GHCR, deploy.

---

## Tecnologie e scelte di stack

- **Framework**: Node.js servizi multipli (monorepo)
- **Container**: Docker, GHCR, Docker Compose
- **DB**: Neon, Supabase-scoped schemas (documentato)
- **Deploy**: VPS + Caddy; Oracle Free Tier citato
- **LLM integration**: nessuna nel runtime piattaforma

## Problemi tecnici risolti (inferiti)

Nessun bugfix classico nei messaggi (predominanza `feat/docs/ci`). Dettagli operativi da ricostruire da issue/PR se esistono.

1. **Validazione compose in CI**: `3348453 ci: valida deploy compose in CI…`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `3d4c0e3` ci: multi-arch GHCR (amd64/arm64); OCI ARM provision script
- `cc92489` ci: deploy automatico SSH dopo publish + workflow Deploy manuale
- `3348453` ci: valida deploy compose in CI; CI_CD completo fino al deploy
- `f749252` feat(deploy): Docker Compose prod (GHCR) e guida VPS
- `f0d0517` feat: soli-gateway, notification providers, CI/CD e docs
- `f5e548d` db: Supabase-dedicated schemas (B) — soli_auth + soli_notification migrations
- `cae7058` chore: initial soli-platform monorepo (soli-auth, soli-notification, soli-lib)

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `packages/` / `services/` / `deploy/`: nessun match prioritario in questa passata (limitazione: tree non completamente espanso).
- **Secret rotation / monitoring**: menzionati solo a livello documentale (`deploy/README.md`, `docs/CHANGELOG.md` — verificare implementazione effettiva).
- **Debito tecnico inferito**: 16 commit in 2 giorni — rischio di doc più avanti del codice nei servizi meno toccati.
- **Debito tecnico inferito**: script `provision-oci-arm-retry.sh` richiede ambiente OCI reale per test end-to-end non automatizzati qui.
- **Debito tecnico inferito**: dipendenza da **GitHub Release** come gate — failure semantic-release fuori repo impatta immagini.

---

> **Nota metodologica**: completamento 2026-04-22; incrociare con `docs/CHANGELOG.md` [Non rilasciato].

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **16** commit
- **~8** file (`AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md`, `deploy/*.md`, workflow `publish-containers*.yml`, `docker-compose` paths citati in AGENTS)
- **0** TODO/FIXME rilevanti dal grep workspace limitato

**Punti di minore confidenza:**

- Attribuzione “LLM” senza artefatto Cursor: confidenza bassa.
- Struttura cartelle servizi non enumerata file-per-file.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.
