---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [casa-mia-fe-agents.md]
status: draft
---
# Casa Mia Frontend

> Frontend Next.js 14 per la gestione domestica: documenti, dispensa con OCR/barcode, temi light/dark e sincronizzazione WebSocket in tempo reale.

## Summary

Applicazione Next.js 14 (App Router) per la gestione della casa, frontend del progetto Casa Mia. Include gestione documenti famiglia (cartelle, viewer PDF/immagini con URL temporanei), dispensa con scanner barcode e OCR (Tesseract), sistema di temi light/dark con token SoliDS, e sincronizzazione in tempo reale via WebSocket nativo. Autenticazione JWT con refresh token [^src: raw/casa-mia-fe-agents.md §Progetto].

## Stack

| Area | Tecnologia |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Design system | [[solids]] `@soli92/solids` ^1.14.1 (CSS + Tailwind preset) |
| HTTP client | Axios |
| Realtime | WebSocket nativo verso `/ws` |
| Barcode/OCR | `html5-qrcode`, Tesseract.js |
| PWA | Base attiva (`app/manifest.js`) |
| Test | Vitest (`apiUrl`, `api.documents`, `openFoodFacts`, `pantryOcr`, `pantryScanHistory`, `solids-package`) |

[^src: raw/casa-mia-fe-agents.md §Progetto]

## Funzionalità principali

- **Documenti famiglia** — cartelle, viewer PDF/immagini, link temporanei (TTL backend), upload presigned [^src: raw/casa-mia-fe-agents.md §File utili]
- **Dispensa** — scanner barcode (`PantryBarcodeModal`), OCR (`PantryOcrModal`), integrazione Open Food Facts [^src: raw/casa-mia-fe-agents.md §File utili]
- **Temi** — solo `light` e `dark` (token SoliDS standard); `ThemeProvider` + script anti-flash [^src: raw/casa-mia-fe-agents.md §Note integrazione]
- **Sessione** — JWT access/refresh, `SessionContext` con `GET /auth/me`, persistenza locale [^src: raw/casa-mia-fe-agents.md §Checklist]
- **WebSocket** — toast, `sendFamilyUpdate`, evento `casa-mia:data-update` per sync documenti/cartelle [^src: raw/casa-mia-fe-agents.md §File utili]

## Key integrations

- [[casa-mia-be]] — backend Express + Prisma; comunicazione via REST API (`NEXT_PUBLIC_API_URL`) e WebSocket (`ws`/`wss`); payload auth `accessToken` / `refreshToken` [^src: raw/casa-mia-fe-agents.md §Note integrazione]
- [[solids]] — design system (CSS + Tailwind preset), temi light/dark, branding Soli (`SoliLogo.jsx`, `LogoLoader.jsx`) [^src: raw/casa-mia-fe-agents.md §Progetto]
- [[soli-prof]] — repository in `CORPUS_REPOS` per re-ingest RAG via webhook [^src: raw/casa-mia-fe-agents.md §Integrazione Soli Prof]

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run build`

## Key files

- `app/layout.js` — script anti-flash tema + `data-theme`
- `components/ThemeProvider.jsx` — stato tema + sync DOM
- `contexts/SessionContext.jsx` — `user` / `family`, auth
- `contexts/CasaMiaWebSocketContext.jsx` — WebSocket, toast, sync
- `app/documenti/page.js` — cartelle, viewer PDF/immagini
- `app/pantry/page.js` — dispensa con barcode/OCR
- `lib/api.js` — client API (documenti, presign, commit)
- `lib/apiUrl.js` — `resolveWebSocketUrl`
- `hooks/useDataUpdateRefresh.js` — refetch su data-update

## Connections

- Related: [[casa-mia-be]] — backend diretto (REST + WebSocket)
- Related: [[solids]] — design system e branding
- Related: [[soli-prof]] — indicizzato nel RAG multi-corpus
- Related: [[bachelor-party-claudiano]] — pattern simile (app collaborativa con stato condiviso e Realtime)
