---
type: concept
created: 2026-05-25
updated: 2026-06-25
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

## Registry — Mapping componenti per consumer

> Dati aggiornati al 2026-06-25. Fonte: `wiki/lint/shadcn-registry-audit-2026-06-25.md` (TSK-004/TSK-006).

### Riepilogo pattern di consumo

Il pacchetto `@soli92/solids` v1.14.1 è usato da tutti i consumer, ma con modalità differenti:

| Consumer | CSS/tokens | Brand assets npm import | Brand assets unpkg CDN | Componenti React registry |
|---|---|---|---|---|
| soli-agent | ✅ `@soli92/solids/css/index.css` | ✅ PNG import ES | — | ❌ |
| soli-dome | ✅ via globals.css | ✅ PNG import ES | — | ❌ |
| soli-prof | ✅ `@soli92/solids/css/index.css` | — | ✅ unpkg CDN | ❌ |
| soli-boy | ✅ `@soli92/solids/css/index.css` | ❌ | — | ❌ |
| soli-dm-fe | ✅ via globals.css | ❌ | — | ✅ (shadcn CLI copy) |
| casa-mia-fe | ✅ via globals.css | ❌ | — | ❌ |
| bachelor-party-claudiano | ✅ via index.css | ❌ | — | ❌ |
| soli-projects | ✅ `@soli92/solids/css/index.css` | — | ✅ unpkg CDN | ❌ |

### Mapping componenti registry per consumer

Il registry SoliDS espone 57 voci (55 componenti UI + 2 hooks). L'unico consumer che usa componenti React del registry è **soli-dm-fe** (via installazione locale shadcn CLI).

| Componente | Nel registry SoliDS | Consumer che lo usano | Note |
|---|---|---|---|
| accordion | ✅ | — | Non usato |
| alert | ✅ | — | Non usato |
| alert-dialog | ✅ | — | Non usato |
| aspect-ratio | ✅ | — | Non usato |
| avatar | ✅ | soli-dm-fe | `components/UserAvatar.tsx` |
| badge | ✅ | — | Non usato |
| breadcrumb | ✅ | — | Non usato |
| button | ✅ | soli-dm-fe | 8+ file pagine e componenti |
| button-group | ✅ | — | Non usato |
| calendar | ✅ | — | Non usato |
| card | ✅ | — | Installato in soli-dm-fe ma mai importato |
| carousel | ✅ | — | Non usato |
| chart | ✅ | — | Non usato |
| checkbox | ✅ | — | Non usato |
| collapsible | ✅ | — | Non usato |
| command | ✅ | — | Non usato |
| context-menu | ✅ | — | Non usato |
| dialog | ✅ | — | Non usato |
| drawer | ✅ | — | Non usato |
| dropdown-menu | ✅ | — | Non usato |
| empty | ✅ | — | Non usato |
| field | ✅ | — | Non usato |
| form | ✅ | — | Non usato |
| hover-card | ✅ | — | Non usato |
| input | ✅ | soli-dm-fe | 8+ file pagine e componenti |
| input-group | ✅ | — | Non usato |
| input-otp | ✅ | — | Non usato |
| item | ✅ | — | Non usato |
| kbd | ✅ | — | Non usato |
| label | ✅ | — | Non usato |
| menubar | ✅ | — | Non usato |
| navigation-menu | ✅ | — | Non usato |
| pagination | ✅ | — | Non usato |
| popover | ✅ | — | Non usato |
| progress | ✅ | — | Non usato |
| radio-group | ✅ | — | Non usato |
| resizable | ✅ | — | Non usato |
| scroll-area | ✅ | — | Non usato |
| select | ✅ | — | Non usato |
| separator | ✅ | — | Non usato |
| sheet | ✅ | — | Non usato |
| sidebar | ✅ | — | Non usato |
| skeleton | ✅ | — | Non usato |
| slider | ✅ | — | Non usato |
| sonner | ✅ | — | Toaster usato direttamente da sonner in soli-dm-fe, non dal registry |
| spinner | ✅ | — | Non usato |
| switch | ✅ | — | Non usato |
| table | ✅ | — | Non usato |
| tabs | ✅ | soli-dm-fe | `components/character/CharacterTabsFields.tsx` |
| textarea | ✅ | soli-dm-fe | `components/character/CharacterTabsFields.tsx` |
| toast | ✅ | — | Non usato |
| toaster | ✅ | — | Non usato |
| toggle | ✅ | — | Non usato |
| toggle-group | ✅ | — | Non usato |
| tooltip | ✅ | — | Non usato |
| use-mobile | ✅ | — | Hook — non usato |
| use-toast | ✅ | — | Hook — non usato |
| full-screen-loader | ❌ | soli-dm-fe | Componente custom locale, assente dal registry SoliDS — anomalia |

### Anomalie e osservazioni

1. **Gap adozione React registry:** 7 consumer su 8 non importano alcun componente React. Il registry è in stato "availability" ma non "adoption".
2. **soli-dm-fe — stile divergente:** `components.json` usa `style: "default"` invece di `style: "new-york"` come il registry SoliDS — rischio drift visivo.
3. **card installato ma inutilizzato:** `card` è presente in `components/ui/` di soli-dm-fe ma mai importato in pagine/componenti applicativi.
4. **full-screen-loader custom:** componente custom locale in soli-dm-fe, non nel registry — da valutare se aggiungere al registry SoliDS.

## Connections

- Related: [[rag-pipeline]] — SoliDS e indicizzato nei CORPUS_REPOS di soli-prof per il RAG
- Related: [[cross-repo-webhooks]] — push su solids attiva re-ingest selettivo via webhook
- Related: [[vercel]] — i consumer frontend sono deployati su Vercel
- Related: [[supabase-integration]] — alcuni consumer SoliDS usano anche Supabase Auth
