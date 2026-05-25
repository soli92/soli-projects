---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-platform-agents.md]
status: draft
---
# Soli Platform

> Monorepo di servizi infrastrutturali (auth, notification, gateway, lib condivisa) con deploy containerizzato su Oracle Cloud Free Tier via GHCR.

## Summary

Soli Platform è un **monorepo Node 22+** che contiene quattro pacchetti: **soli-auth** (servizio autenticazione), **soli-notification** (notifiche + worker), **soli-gateway** (API gateway) e **soli-lib** (libreria condivisa) [^src: raw/soli-platform-agents.md §Repo]. Le immagini container sono pubblicate su **GitHub Container Registry** (GHCR) tramite GitHub Actions con build multi-arch [^src: raw/soli-platform-agents.md §Repo]. Il deploy target è **Oracle Cloud Free Tier** (ARM), con provisioning automatizzato tramite OCI CLI [^src: raw/soli-platform-agents.md §Cosa fare dopo].

## Stack

| Layer | Tech |
|-------|------|
| **Runtime** | Node 22+ |
| **Architettura** | Monorepo (4 pacchetti: auth, notification, gateway, lib) |
| **Container** | Docker, GHCR (GitHub Container Registry) |
| **CI/CD** | GitHub Actions (`publish-containers*.yml`) |
| **Deploy** | Oracle Cloud Free Tier (ARM), Docker Compose |
| **Provisioning** | OCI CLI + `deploy/provision-oci-arm-retry.sh` |

[^src: raw/soli-platform-agents.md §Repo] [^src: raw/soli-platform-agents.md §Cosa fare dopo]

## Key integrations

- **[[soli-prof]]** — il monorepo è in `CORPUS_REPOS` di Soli Prof; un webhook `push` attiva re-ingest automatico (HMAC) [^src: raw/soli-platform-agents.md §Integrazione Soli Prof].
- **Oracle Cloud** — target di deploy su free tier ARM; documentazione in `deploy/ORACLE_FREE_TIER.md` [^src: raw/soli-platform-agents.md §Cosa fare dopo].
- **GHCR** — registry per le immagini container; `docker login ghcr.io` necessario se privato [^src: raw/soli-platform-agents.md §Cosa fare dopo].

## Commands

`npm run test:ci` · `npm run lint` · `npm run build` · `npm run check:env` · `npm run e2e:smoke` [^src: raw/soli-platform-agents.md §Comandi]

## Key files

- `docs/CHANGELOG.md` — storico delle modifiche
- `docs/ARCHITECTURE.md` — architettura del monorepo
- `docs/THIRD_PARTY_SETUP.md` — configurazione servizi terzi
- `AI_LOG.md` — memoria sviluppo AI-assisted
- `deploy/README.md` — guida deploy
- `deploy/ORACLE_FREE_TIER.md` — documentazione Oracle free tier
- `deploy/provision-oci-arm-retry.sh` — script provisioning OCI
- `.github/workflows/publish-containers*.yml` — CI/CD per container

[^src: raw/soli-platform-agents.md §File utili]

## Connections

- Related: [[soli-prof]] — indicizzato nella knowledge base RAG
- Related: [[soli-agent]] — potenziale consumer dei servizi auth/notification (da verificare)
- Related: [[soli-projects]] — indicizzato nella KB centralizzata
