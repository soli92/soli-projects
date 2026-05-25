---
type: concept
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, solids-agents.md, soli-dome-agents.md, soli-dm-fe-agents.md, bachelor-party-claudiano-agents.md, pippify-agents.md, casa-mia-fe-agents.md, soli-prof-agents.md, soli-agent-agents.md, soli-projects-agents.md]
status: draft
---
# Design System SoliDS

> Design system condiviso dell'ecosistema soli92: token CSS, preset Tailwind, Storybook e registry componenti shadcn, consumato da tutti i progetti frontend.

## Summary

`@soli92/solids` e il pacchetto npm che fornisce design token, fogli di stile CSS, un preset Tailwind e un registry di componenti shadcn a tutti i frontend soli92. Il range obbligatorio e `^1.14.1` [^src: raw/tech_stack.md §Vincoli inviolabili]. I temi sono selezionabili via attributo `data-theme` sull'elemento HTML e includono temi generici (`light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk`) e temi character-based [^src: raw/solids-agents.md §Repo].

## Key points

- Il pacchetto espone CSS + preset Tailwind; i componenti React seguono il pattern **registry** shadcn, non sono importati direttamente come moduli [^src: raw/soli-dm-fe-agents.md §Regole per l'agente]
- Font stack default: Inter, DM Sans, JetBrains Mono; temi tematici usano Source Serif 4 (fantasy) e Space Grotesk (cyberpunk) [^src: raw/solids-agents.md §Repo]
- Storybook (`npm run storybook`) fornisce documentazione interattiva, inclusa documentazione su accessibilita e motion (WCAG/MD3/HIG) [^src: raw/solids-agents.md §Repo]
- Brand assets centralizzati in `dist/brand-assets/`, esportati per i consumer [^src: raw/solids-agents.md §Repo]
- Release automatizzate con `semantic-release` / CI [^src: raw/solids-agents.md §Repo]
- Tutti i frontend includono un test di validazione del range di dipendenza (`solids-package.test`) [^src: raw/soli-dm-fe-agents.md §Checklist prima di una PR]

## Projects

| Progetto | Come usa SoliDS |
|----------|----------------|
| [[solids]] | Repository sorgente del design system |
| [[soli-agent]] | PWA Web Chat, layout.tsx, font stack [^src: raw/soli-agent-agents.md §Project] |
| [[soli-prof]] | Tailwind preset + brand assets, font stack in layout.tsx [^src: raw/soli-prof-agents.md §Stack tecnico] |
| [[soli-projects]] | Tailwind preset + CSS variables [^src: raw/soli-projects-agents.md §Stack] |
| [[soli-dome]] | Token dark/glass, branding PWA con asset SoliDS [^src: raw/soli-dome-agents.md §Repo] |
| [[soli-dm-fe]] | Tailwind + registry componenti UI (button, card, input, tabs, avatar), branding Soli [^src: raw/soli-dm-fe-agents.md §Struttura rilevante] |
| [[bachelor-party-claudiano]] | Tema `90s-party` su `<html>`, Google Fonts bundle SoliDS, logo da asset esportati [^src: raw/bachelor-party-claudiano-agents.md §Stack] |
| [[pippify]] | Frontend CRA con preset Tailwind, font in `frontend/public/index.html` [^src: raw/pippify-agents.md §Repo] |
| [[casa-mia-fe]] | CSS + Tailwind preset, temi solo `light` e `dark`, branding Soli [^src: raw/casa-mia-fe-agents.md §Progetto] |

## Connections

- Related: [[rag-pipeline]] — SoliDS e indicizzato nei CORPUS_REPOS di soli-prof per il RAG
- Related: [[cross-repo-webhooks]] — push su solids attiva re-ingest selettivo via webhook
- Related: [[vercel]] — i consumer frontend sono deployati su Vercel
- Related: [[supabase-integration]] — alcuni consumer SoliDS usano anche Supabase Auth
