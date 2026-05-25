---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [soli-dm-fe-agents.md]
status: draft
---
# Soli Dungeon Master Frontend

> Frontend Next.js 15 per un Dungeon Master digitale: campagne, personaggi D&D con scheda completa, dice roller e wiki SRD.

## Summary

Applicazione Next.js 15 (App Router) con React 18 e TypeScript per la gestione di campagne D&D. Include creazione e gestione personaggi con scheda dettagliata (identità, multiclasse, statistiche, armamenti, storia), dice roller, e wiki SRD (classi, razze, sottoclassi, regole). Autenticazione tramite Supabase (email/password). Comunicazione REST verso il backend `soli-dm-be`. PWA con `@ducanh2912/next-pwa` [^src: raw/soli-dm-fe-agents.md §Progetto].

## Stack

| Area | Tecnologia |
|------|------------|
| Framework | Next.js 15 (App Router), React 18, TypeScript |
| Design system | [[solids]] `@soli92/solids` ^1.14.1 + Tailwind |
| Auth | Supabase (email/password; OAuth configurabile) |
| UI primitives | Registry SoliDS (button, card, input, textarea, tabs, avatar) via Radix UI |
| Notifiche | Sonner |
| PWA | `@ducanh2912/next-pwa` |
| Test | Vitest + Testing Library |
| Deploy | Vercel (`soli-dm-fe.vercel.app`) |

[^src: raw/soli-dm-fe-agents.md §Progetto]

## Struttura app

| Area | Path |
|------|------|
| Pagine | `app/(dm)/` — home, auth, campaigns, characters (`[id]`), dice-roller, wiki |
| Layout DM | `app/(dm)/layout.tsx` — skip link, `#main-content`, `appCanvas` |
| Navigazione | `components/navigation.tsx` — drawer + backdrop, app bar |
| Scheda personaggio | `CharacterIdentityPanel.tsx` (identità + multiclasse), `CharacterTabsFields.tsx` (stats, armamenti, storia) |
| Tipologiche D&D | `lib/tipologiche/` — classi, razze, allineamenti, sottoclassi SRD, dadi |

[^src: raw/soli-dm-fe-agents.md §Struttura rilevante]

## Key integrations

- [[soli-dm-be]] — backend API REST; header opzionale `NEXT_PUBLIC_SOLI_DM_API_KEY`; client in `lib/api.ts` [^src: raw/soli-dm-fe-agents.md §Progetto]
- [[solids]] — design system CSS + Tailwind preset; componenti React dal registry SoliDS (`components/ui/`); solo token semantici, mai colori Tailwind grezzi [^src: raw/soli-dm-fe-agents.md §Regole per l'agente]
- [[soli-prof]] — repository in `CORPUS_REPOS` per re-ingest RAG via webhook [^src: raw/soli-dm-fe-agents.md §Integrazione Soli Prof]
- **Supabase** — autenticazione; errori mappati in italiano da `formatAuthError` [^src: raw/soli-dm-fe-agents.md §Regole per l'agente]

## Commands

`npm run dev` · `npm run lint` · `npm run type-check` · `npm test` · `npm run build` · `npm start`

## Key files

- `lib/api.ts` — client REST verso soli-dm-be
- `lib/character-sheet.ts` — stats/sheet_data, `abilityModifierFromScore`
- `lib/tipologiche/` — dnd.ts, subclasses.ts, dadi, wiki
- `lib/ui-classes.ts` — classi layout condivise (`appPageShell`, `appCanvas`, `appFormControl`)
- `lib/auth-errors.ts` — `formatAuthError()` per errori Supabase in italiano
- `components/character/` — `CharacterIdentityPanel.tsx`, `CharacterTabsFields.tsx`
- `components/ui/` — button, card, input, tabs (registry SoliDS)
- `components/brand/SoliBrandLogo.tsx` — branding Soli

## Known edge cases

- Pinning dipendenze shadcn: versioni non valide durante scaffolding hanno causato break storici [^src: raw/soli-dm-fe-agents.md §Known edge cases]
- Tailwind content path per SoliDS: path incompleti fanno sparire stili in build [^src: raw/soli-dm-fe-agents.md §Known edge cases]
- Creazione personaggi: campagna obbligatoria, altrimenti dati inconsistenti [^src: raw/soli-dm-fe-agents.md §Known edge cases]

## Connections

- Related: [[soli-dm-be]] — backend diretto (REST API)
- Related: [[solids]] — design system, registry componenti, token
- Related: [[soli-prof]] — indicizzato nel RAG multi-corpus
- Related: [[casa-mia-fe]] — pattern simile (Next.js + SoliDS + Supabase auth)
