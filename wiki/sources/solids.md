---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [solids-agents.md]
status: draft
---
# SoliDS

> Design system condiviso dell'ecosistema soli92: token CSS, Storybook, registry shadcn.

## Summary

SoliDS è il pacchetto npm **`@soli92/solids`** che fornisce design token, CSS, documentazione interattiva Storybook e un registry di componenti shadcn per tutti i progetti soli92. Supporta numerosi temi (`light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk` e temi character-based) selezionabili via attributo `data-theme` [^src: raw/solids-agents.md §Repo]. Include documentazione su accessibilità e motion (WCAG/MD3/HIG) e brand assets centralizzati esportati in `dist/brand-assets/` [^src: raw/solids-agents.md §Repo].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Runtime | Node **22+** |
| Build output | `dist/` |
| Documentazione | **Storybook** (`npm run storybook`) |
| Font default | Inter, DM Sans, JetBrains Mono |
| Font tematici | Source Serif 4 (fantasy), Space Grotesk (cyberpunk) |
| Registry componenti | shadcn (`docs/shadcn-integration.md`, `docs/registry-model-1.md`) |
| Release | `semantic-release` / CI |

[^src: raw/solids-agents.md §Repo]

## Key integrations

- **[[soli-prof]]** — il repo è in `CORPUS_REPOS` su Soli Prof; un webhook GitHub su `push` attiva re-ingest selettivo via HMAC [^src: raw/solids-agents.md §Integrazione Soli Prof].
- **Tutti i progetti frontend soli92** — consumano `@soli92/solids` come dipendenza npm per token, CSS e preset Tailwind (es. [[soli-dome]], [[pippify]], [[soli-dm-fe]], [[casa-mia-fe]], [[bachelor-party-claudiano]]).

## Commands

| Comando | Scopo |
|---------|-------|
| `npm run build` | Build del pacchetto |
| `npm run test:tokens` | Sanity check token |
| `npm test` | Build + sanity token + build-storybook |
| `npm run storybook` | Dev server Storybook |
| `npm run build-storybook` | Build statico Storybook |
| `npm run registry:sync` | Sync registry shadcn |
| `npm run registry:build` | Build registry shadcn |

[^src: raw/solids-agents.md §Comandi]

## Key files

- `README.md`, `CHANGELOG.md`, `AI_LOG.md`
- `docs/foundations/accessibility-and-motion.mdx` — documentazione WCAG/MD3/HIG
- `docs/shadcn-integration.md`, `docs/registry-model-1.md` — integrazione shadcn
- `scripts/tokens-sanity.mjs` — script di validazione token
- `registry/` — registry componenti shadcn

[^src: raw/solids-agents.md §File utili]

## Connections

- Related: [[soli-prof]] — indicizzato in CORPUS_REPOS per RAG; webhook push per re-ingest
- Related: [[soli-dome]] — consumer diretto di `@soli92/solids` ^1.14.1 con tema dark/glass
- Related: [[pippify]] — consumer di `@soli92/solids` ^1.14.1 nel frontend CRA
- Related: [[koollector]] — potenziale consumer (monorepo mobile + API)
