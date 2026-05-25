---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [pippify-agents.md]
status: draft
---
# Pippify

> Player YouTube personale con tre superfici: Next.js (API), CRA (frontend audio) ed Express (backend).

## Summary

Pippify è un'applicazione multi-superficie per uso personale legata a YouTube. Il progetto è composto da tre parti: la root **Next.js 16** che espone API YouTube e test Vitest, un frontend **CRA + Howler** con styling `@soli92/solids` ^1.14.1 per la riproduzione audio, e un backend **Express 5** con autenticazione JWT, persistenza Supabase e storage R2 per l'import YouTube [^src: raw/pippify-agents.md §Repo]. L'uso è strettamente personale e deve rispettare copyright e ToS YouTube [^src: raw/pippify-agents.md §Repo].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Runtime | Node **22+** |
| Root | Next.js **16** (API YouTube, Vitest) |
| Frontend (`frontend/`) | CRA, Howler (audio), `@soli92/solids` ^1.14.1 |
| Backend (`backend/`) | Express **5**, JWT, Supabase, Cloudflare R2 |
| Import | YouTube (cookie/limiti da env) |

[^src: raw/pippify-agents.md §Repo]

## Key integrations

- **[[solids]]** — il frontend CRA consuma `@soli92/solids` ^1.14.1 per font e styling [^src: raw/pippify-agents.md §Repo].
- **[[soli-prof]]** — il repo è in `CORPUS_REPOS`; webhook push per re-ingest HMAC [^src: raw/pippify-agents.md §Integrazione Soli Prof].

## Commands

| Comando | Scopo |
|---------|-------|
| `npm run dev` | Dev server root (Next.js) |
| `npm run lint` | Lint |
| `npm test` | Test |
| `npm run test:run` | Test run singolo |
| `npm run build` | Build |

[^src: raw/pippify-agents.md §Comandi]

## Key files

- `README.md`, `AI_LOG.md`
- `.env.example` — template variabili d'ambiente
- `backend/README.md` — documentazione backend
- `frontend/` — sorgente frontend CRA + Howler
- `backend/` — sorgente backend Express

[^src: raw/pippify-agents.md §File utili]

## Connections

- Related: [[solids]] — design system per il frontend CRA
- Related: [[soli-prof]] — indicizzato in CORPUS_REPOS per RAG; webhook push per re-ingest
- Related: [[soli-dome]] — navigabile come app dal portale
