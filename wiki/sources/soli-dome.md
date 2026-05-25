---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-dome-agents.md]
status: draft
---
# Soli Dome

> Portale / home links dell'ecosistema soli92 — hub di navigazione tra le app.

## Summary

Soli Dome è un'applicazione Next.js 16 con React 19 che funge da portale centralizzato per navigare tra tutte le app dell'ecosistema soli92. Usa Tailwind con il preset **`@soli92/solids` ^1.14.1** per lo styling e Lucide per le icone [^src: raw/soli-dome-agents.md §Repo]. L'app include supporto PWA (manifest, icone, loader), branding tramite componenti dedicati (`SoliBrandLogo`, `SoliLogoLoader`) e un catalogo di app configurabile in `src/data/apps.ts` [^src: raw/soli-dome-agents.md §Repo]. Lo stack è volutamente snello, con test Vitest e opzionalmente Playwright per E2E [^src: raw/soli-dome-agents.md §Comandi].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Framework | Next.js **16**, React **19** |
| Runtime | Node **22+** |
| Styling | Tailwind + `@soli92/solids` ^1.14.1 |
| Icone | Lucide |
| Test | Vitest, Playwright (E2E) |
| PWA | Manifest + icone (192/512) |

[^src: raw/soli-dome-agents.md §Repo]

## Key integrations

- **[[solids]]** — consumer diretto di `@soli92/solids` ^1.14.1 per token CSS, preset Tailwind, font stack e brand assets [^src: raw/soli-dome-agents.md §Repo].
- **[[soli-prof]]** — il repo è in `CORPUS_REPOS`; webhook push per re-ingest HMAC [^src: raw/soli-dome-agents.md §Integrazione Soli Prof].

## Commands

| Comando | Scopo |
|---------|-------|
| `npm run dev` | Dev server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run test:watch` | Vitest in watch |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:all` | Tutti i test |
| `npm run build` | Build produzione |

[^src: raw/soli-dome-agents.md §Comandi]

## Key files

- `README.md`, `AI_LOG.md`
- `src/data/apps.ts` — catalogo app (incluso Health, Wand and Fire)
- `src/solids-package.test.ts` — validazione range `@soli92/solids`
- `src/app/manifest.ts` — manifest PWA
- `src/components/SoliBrandLogo.tsx`, `src/components/SoliLogoLoader.tsx` — branding/loader
- `playwright.config.ts` — configurazione E2E

[^src: raw/soli-dome-agents.md §File utili]

## Known edge cases

- Export `apps`/`categories` devono restare strettamente coerenti per evitare bug runtime silenziosi [^src: raw/soli-dome-agents.md §Known edge cases].
- `overflow: hidden` su wrapper intermedi rompe scroll desktop/touchpad; lo scroll deve restare su `html/body` [^src: raw/soli-dome-agents.md §Known edge cases].
- PWA: layout, manifest e path icone devono combaciare — mismatch rompe installazione/offline [^src: raw/soli-dome-agents.md §Known edge cases].
- Prop contrattuali (`categories`, `index`) non devono andare perse durante refactor [^src: raw/soli-dome-agents.md §Known edge cases].

## Connections

- Related: [[solids]] — design system: token, font, preset Tailwind, brand assets
- Related: [[soli-prof]] — indicizzato in CORPUS_REPOS per RAG; webhook push per re-ingest
- Related: [[soli-agent]] — una delle app navigabili dal portale
- Related: [[pippify]] — una delle app navigabili dal portale
