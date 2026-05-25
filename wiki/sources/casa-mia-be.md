---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [casa-mia-be-agents.md]
status: draft
---
# Casa Mia Backend

> Backend Express (ESM) con Prisma + PostgreSQL, JWT, WebSocket e storage S3-compatibile per la gestione domestica.

## Summary

API backend per il progetto Casa Mia, costruita con Express in ESM e Prisma come ORM su PostgreSQL. Gestisce autenticazione JWT (access + refresh token), documenti famiglia con upload/download su storage S3-compatibile (presigned URL), notifiche push per scadenze (VAPID), e comunicazione real-time via WebSocket (`ws`) sul path `/ws`. Tutti i dati sono filtrati per `familyId` [^src: raw/casa-mia-be-agents.md §Progetto].

## Stack

| Area | Tecnologia |
|------|------------|
| Framework | Express (ESM) |
| ORM / DB | Prisma + PostgreSQL |
| Auth | JWT access/refresh (`src/utils/jwt.js`) |
| Storage | S3-compatibile (presigned PUT/GET) |
| Realtime | WebSocket `ws` su path `/ws` |
| Push | VAPID web-push per scadenze |
| Test | Vitest (JWT, auth, health, documents, push mockate) |
| Deploy | Render (vedi `render.yaml`) |

[^src: raw/casa-mia-be-agents.md §Progetto]

## Funzionalità principali

- **Auth** — JWT access + refresh token; `authenticateToken` middleware; login/register includono `family` [^src: raw/casa-mia-be-agents.md §Regole]
- **Documenti famiglia** — cartelle (`DocumentFolder`), file su S3 (`FamilyDocument.storageKey`), presigned PUT (upload) e GET (lettura), `S3_PUBLIC_URL` opzionale [^src: raw/casa-mia-be-agents.md §Progetto]
- **Push scadenze** — `deadlinePushDigest.js`, chiavi VAPID, cron in `src/index.js` [^src: raw/casa-mia-be-agents.md §Checklist]
- **WebSocket** — real-time su `/ws`, protocollo allineato al frontend [^src: raw/casa-mia-be-agents.md §Progetto]
- **Multi-tenancy** — filtro per `req.user.familyId` su tutte le risorse (PostIt, documenti, shopping, pantry) [^src: raw/casa-mia-be-agents.md §Regole]

## Key integrations

- [[casa-mia-fe]] — frontend Next.js 14; REST API + WebSocket; payload auth `accessToken` / `refreshToken` [^src: raw/casa-mia-be-agents.md §Regole]
- [[soli-prof]] — repository in `CORPUS_REPOS` per re-ingest RAG via webhook [^src: raw/casa-mia-be-agents.md §Integrazione Soli Prof]

## Commands

`npm run dev` · `npm test` · `npm run test:watch` · `npm start` · `npm run build`

## Key files

- `src/app.js` — `createApp()` (testabile con supertest)
- `src/index.js` — avvio server + cron + WebSocket
- `src/utils/jwt.js` — secret da `process.env` a ogni uso
- `src/routes/documents.js` — cartelle CRUD, presign, access-url, delete
- `src/utils/documentStorage.js` — presign PUT/GET, HEAD, delete
- `src/routes/push.js` + `src/services/deadlinePushDigest.js` — notifiche scadenze
- `prisma/schema.prisma` — schema database
- `DATABASE_SETUP.md` — setup PostgreSQL

## Known edge cases

- Pooler Supabase: distinguere endpoint session vs transaction, altrimenti connessione fallisce in modo oscuro [^src: raw/casa-mia-be-agents.md §Known edge cases]
- Prisma migrate su DB legacy (P3005): richiede baseline esplicita su database già popolati [^src: raw/casa-mia-be-agents.md §Known edge cases]
- CORS multi-origine: deve considerare più origini per evitare rottura auth in ambienti non principali [^src: raw/casa-mia-be-agents.md §Known edge cases]
- Post-merge da branch Cursor: ordinamento route e allineamento schema richiedono verifica dedicata [^src: raw/casa-mia-be-agents.md §Known edge cases]

## Connections

- Related: [[casa-mia-fe]] — frontend diretto (REST + WebSocket)
- Related: [[soli-prof]] — indicizzato nel RAG multi-corpus
- Related: [[soli-dm-be]] — pattern simile (Express + Supabase, API key middleware, CORS config)
