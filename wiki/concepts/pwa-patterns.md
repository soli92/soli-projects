---
type: concept
created: 2026-05-25
updated: 2026-05-25
sources: [soli-agent-agents.md, soli-dome-agents.md, bachelor-party-claudiano-agents.md, soli-dm-fe-agents.md, casa-mia-fe-agents.md]
status: draft
---
# PWA Patterns

> Pattern Progressive Web App adottati nei progetti soli92: manifest, service worker, icone, branding Soli.

## Summary

Diversi progetti dell'ecosistema soli92 implementano funzionalita PWA con approcci variati ma elementi comuni: manifest JSON, icone in piu risoluzioni, branding Soli coerente e, dove supportato, service worker per offline. Il branding condiviso arriva dagli asset esportati da [[solids]] (`dist/brand-assets/`), usati per loghi, favicon e splash screen.

## Key points

- **soli-agent**: PWA con `app/manifest.ts`, asset SoliDS, componente `SoliLogo.tsx` [^src: raw/soli-agent-agents.md §Useful files]
- **soli-dome**: branding PWA con `SoliBrandLogo.tsx`, `SoliLogoLoader.tsx`, `src/app/manifest.ts`; gotcha nota: layout, manifest e path icone devono combaciare per evitare rotture installazione/offline [^src: raw/soli-dome-agents.md §Known edge cases]
- **bachelor-party-claudiano**: `vite-plugin-pwa` con `generateSW` e `autoUpdate`; icone via `npm run icons`, splash/screenshot via `npm run splash` per manifest `screenshots` e `apple-touch-startup-image`; `registerSW` in `main.jsx` [^src: raw/bachelor-party-claudiano-agents.md §P3]
- **soli-dm-fe**: `@ducanh2912/next-pwa` con SW disabilitato in development; `dynamicStartUrl: false` per evitare problemi con `_async_to_generator` nel SW; runtime cache cross-origin con esclusione delle basi API; script `scripts/generate-pwa-icons.mjs` per generazione icone [^src: raw/soli-dm-fe-agents.md §Struttura rilevante]
- **casa-mia-fe**: base PWA attiva con `app/manifest.js`, metadata icone in `app/layout.js`, asset in `public/icons/` [^src: raw/casa-mia-fe-agents.md §Progetto]
- **Branding coerente**: tutti i progetti PWA usano asset SoliDS (logo gold, symbol-only, favicon) esportati in `public/` o `public/brand/` [^src: raw/soli-dome-agents.md §Repo]

## Projects

| Progetto | Stack PWA | Note |
|----------|-----------|------|
| [[soli-agent]] | Next.js manifest | Web Chat PWA + Telegram Bot |
| [[soli-dome]] | Next.js manifest, loader Soli | Portale app, icone 192/512 |
| [[bachelor-party-claudiano]] | vite-plugin-pwa, generateSW | Splash screen, auto-update |
| [[soli-dm-fe]] | @ducanh2912/next-pwa | SW off in dev, cache cross-origin |
| [[casa-mia-fe]] | Next.js manifest | Base PWA |

## Connections

- Related: [[design-system-solids]] — brand assets per icone, loghi e splash
- Related: [[deployment-patterns]] — le PWA sono deployate su Vercel
- Related: [[vercel]] — hosting delle PWA frontend
