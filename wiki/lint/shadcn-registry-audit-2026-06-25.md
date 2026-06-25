---
type: audit-report
date: 2026-06-25
subject: "shadcn registry component usage per consumer"
---
# Audit componenti registry shadcn — 2026-06-25

## Componenti disponibili nel registry SoliDS

I seguenti componenti sono esposti dal registry SoliDS (`registry.json`, item `solids-ui`).
Oltre ai componenti UI sono presenti due registry lib (`solids-utils`, `solids-icons`) e un registry block aggregato (`solids-ui`).

### Registry items di tipo lib/block
- `solids-utils` — helper `cn()` (clsx + tailwind-merge)
- `solids-icons` — set icone SVG stroke allineate ai token `--sd-color-icon-*`
- `solids-ui` — block aggregato (tutti i componenti UI + hooks)

### Componenti UI (registry:ui) — 55 voci
- accordion
- alert
- alert-dialog
- aspect-ratio
- avatar
- badge
- breadcrumb
- button
- button-group
- calendar
- card
- carousel
- chart
- checkbox
- collapsible
- command
- context-menu
- dialog
- drawer
- dropdown-menu
- empty
- field
- form
- hover-card
- input
- input-group
- input-otp
- item
- kbd
- label
- menubar
- navigation-menu
- pagination
- popover
- progress
- radio-group
- resizable
- scroll-area
- select
- separator
- sheet
- sidebar
- skeleton
- slider
- sonner
- spinner
- switch
- table
- tabs
- textarea
- toast
- toaster
- toggle
- toggle-group
- tooltip

### Hooks (registry:hook)
- use-mobile
- use-toast

---

## Note metodologiche

I consumer possono consumare SoliDS in due modalita':

1. **Import diretto da pacchetto npm** (`import { X } from "@soli92/solids"` o subpath come `@soli92/solids/button`) — zero occorrenze trovate in tutti i consumer.
2. **Installazione locale via shadcn CLI** (i file del registry vengono copiati in `components/ui/` del consumer) — unico pattern riscontrato in soli-dm-fe.
3. **CSS + brand assets** — utilizzo di `@soli92/solids/css/index.css` e `@soli92/solids/brand-assets/...` senza import di componenti React — pattern adottato da tutti i consumer tranne soli-dm-fe.

Il pacchetto npm `@soli92/solids` v1.14.1 e' dichiarato come dependency in tutti i consumer analizzati, ma viene usato esclusivamente per CSS tokens/temi e brand assets (loghi, icone SVG/PNG). Nessun consumer importa componenti React direttamente dal pacchetto.

---

## Utilizzo per consumer

### soli-projects

**Percorso analizzato:** app/, components/, lib/

**Import da @soli92/solids:** solo CSS e brand assets — nessun componente React del registry.
- `app/layout.tsx` — `import "@soli92/solids/css/index.css"`
- `app/layout.tsx` — import brand icons (PNG)

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ❌ | — |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ❌ | — |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | — |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ❌ | — |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ❌ | — |
| textarea | ❌ | — |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

### soli-agent

**Percorso analizzato:** `/Users/simone.olivieri/Documents/Personal/Repos/soli-agent` — app/, lib/

**Import da @soli92/solids:** CSS e brand assets — nessun componente React del registry. Riferimenti a `@soli92/solids` presenti solo in commenti/docstring (ChatBubble, prompts, subagent) ma non come import ES module di componenti.
- `app/layout.tsx` — `import "@soli92/solids/css/index.css"`
- `app/layout.tsx`, `app/components/SoliLogo.tsx` — import brand icons (PNG)

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ❌ | — |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ❌ | — |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | — |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ❌ | — |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ❌ | — |
| textarea | ❌ | — |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

### soli-dome

**Percorso analizzato:** `/Users/simone.olivieri/Documents/Personal/Repos/soli-dome` — src/

**Import da @soli92/solids:** CSS e brand assets — nessun componente React del registry.
- `src/app/layout.tsx` — `@import "@soli92/solids/css/index.css"` (via globals.css)
- `src/components/SoliBrandLogo.tsx`, `src/components/SoliLogoLoader.tsx` — import brand icons (PNG)

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ❌ | — |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ❌ | — |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | — |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ❌ | — |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ❌ | — |
| textarea | ❌ | — |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

### soli-prof

**Percorso analizzato:** `/Users/simone.olivieri/Documents/Personal/Repos/soli-prof` — app/, components/, lib/

**Import da @soli92/solids:** CSS e brand assets — nessun componente React del registry.
- `app/layout.tsx` — `import "@soli92/solids/css/index.css"`
- `components/ui/logo-loader.tsx` — import brand icons SVG

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ❌ | — |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ❌ | — |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | — |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ❌ | — |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ❌ | — |
| textarea | ❌ | — |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

### soli-boy

**Percorso analizzato:** `/Users/simone.olivieri/Documents/Personal/Repos/soli-boy/packages/app/src`

**Import da @soli92/solids:** solo CSS — nessun componente React del registry.
- `src/main.tsx` — `import "@soli92/solids/css/index.css"`
- `src/components/ThemeSelector/useTheme.ts` — riferimento a `@soli92/solids` solo in commento (tema `cyberpunk`), nessun import ES module
- `src/components/Player/Player.tsx` — riferimento a `@soli92/solids` token solo in commenti CSS inline, nessun import ES module

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ❌ | — |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ❌ | — |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | — |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ❌ | — |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ❌ | — |
| textarea | ❌ | — |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

### soli-dm-fe

**Percorso analizzato:** `/Users/simone.olivieri/Documents/Personal/Repos/soli-dm-fe` — app/, components/, tests/

**Modalita' di consumo:** installazione locale via shadcn CLI — i file del registry sono stati copiati in `components/ui/`. Il pacchetto `@soli92/solids` viene usato per CSS tokens (via `app/globals.css`) e tailwind preset.

**Componenti installati localmente in `components/ui/`:**
`avatar`, `button`, `card`, `full-screen-loader` (custom, non nel registry), `input`, `tabs`, `textarea`

**Nota:** `card` e' installato ma non importato in nessun file applicativo. `full-screen-loader` e' un componente custom locale, non presente nel registry SoliDS.

| Componente | Usato | File di riferimento |
|---|---|---|
| accordion | ❌ | — |
| alert | ❌ | — |
| alert-dialog | ❌ | — |
| aspect-ratio | ❌ | — |
| avatar | ✅ | components/UserAvatar.tsx |
| badge | ❌ | — |
| breadcrumb | ❌ | — |
| button | ✅ | app/(dm)/campaigns/page.tsx, app/(dm)/characters/[id]/page.tsx, app/(dm)/characters/page.tsx, app/(dm)/dice-roller/page.tsx, app/(dm)/login/page.tsx, app/(dm)/register/page.tsx, components/character/CharacterTabsFields.tsx, components/navigation.tsx |
| button-group | ❌ | — |
| calendar | ❌ | — |
| card | ❌ | installato in components/ui/ ma mai importato |
| carousel | ❌ | — |
| chart | ❌ | — |
| checkbox | ❌ | — |
| collapsible | ❌ | — |
| command | ❌ | — |
| context-menu | ❌ | — |
| dialog | ❌ | — |
| drawer | ❌ | — |
| dropdown-menu | ❌ | — |
| empty | ❌ | — |
| field | ❌ | — |
| form | ❌ | — |
| hover-card | ❌ | — |
| input | ✅ | app/(dm)/campaigns/page.tsx, app/(dm)/characters/[id]/page.tsx, app/(dm)/characters/page.tsx, app/(dm)/dice-roller/page.tsx, app/(dm)/login/page.tsx, app/(dm)/register/page.tsx, components/character/CharacterIdentityPanel.tsx, components/character/CharacterTabsFields.tsx |
| input-group | ❌ | — |
| input-otp | ❌ | — |
| item | ❌ | — |
| kbd | ❌ | — |
| label | ❌ | — |
| menubar | ❌ | — |
| navigation-menu | ❌ | — |
| pagination | ❌ | — |
| popover | ❌ | — |
| progress | ❌ | — |
| radio-group | ❌ | — |
| resizable | ❌ | — |
| scroll-area | ❌ | — |
| select | ❌ | — |
| separator | ❌ | — |
| sheet | ❌ | — |
| sidebar | ❌ | — |
| skeleton | ❌ | — |
| slider | ❌ | — |
| sonner | ❌ | — |
| spinner | ❌ | — |
| switch | ❌ | — |
| table | ❌ | — |
| tabs | ✅ | components/character/CharacterTabsFields.tsx |
| textarea | ✅ | components/character/CharacterTabsFields.tsx |
| toast | ❌ | — |
| toaster | ❌ | — |
| toggle | ❌ | — |
| toggle-group | ❌ | — |
| tooltip | ❌ | — |
| use-mobile | ❌ | — |
| use-toast | ❌ | — |

---

## Summary

- **Totale componenti registry (UI + hooks):** 57 (55 componenti UI + 2 hooks)
- **Componenti usati in almeno un consumer:** 5 (avatar, button, input, tabs, textarea) — tutti esclusivamente in soli-dm-fe
- **Consumer che usa componenti React del registry:** 1 (soli-dm-fe, via installazione locale shadcn CLI)
- **Consumer che usa solo CSS/brand assets:** soli-projects, soli-agent, soli-dome, soli-prof, soli-boy

### Componenti mai usati (52 su 57)
accordion, alert, alert-dialog, aspect-ratio, badge, breadcrumb, button-group, calendar, card (installato ma non importato in soli-dm-fe), carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, toast, toaster, toggle, toggle-group, tooltip, use-mobile, use-toast

### Componenti usati ma non nel registry SoliDS (anomalie)
- `full-screen-loader` — componente custom in soli-dm-fe (`components/ui/full-screen-loader.tsx`), presente nella directory `components/ui/` ma assente dal registry SoliDS. Non e' un componente shadcn standard ne' un componente SoliDS esposto.

### Osservazioni strategiche
1. **Adozione quasi nulla del registry React:** 5 consumer su 6 non importano alcun componente React dal registry SoliDS. L'integrazione e' limitata a CSS tokens e brand assets.
2. **Unico consumer con adozione componenti:** soli-dm-fe usa 5 componenti (avatar, button, input, tabs, textarea) installati localmente. Il `components.json` di soli-dm-fe usa `style: "default"` invece di `style: "new-york"` come il registry SoliDS — potenziale disallineamento di stile.
3. **Gap tra registry e utilizzo:** il registry espone 57 voci ma l'88% non e' mai usato. Questo indica che il registry e' in stato "availability" ma non ancora in stato "adoption".
4. **Pattern di consumo misto in soli-dm-fe:** installa componenti localmente (shadcn CLI copy) senza importare dal pacchetto npm. Questo crea rischio di deriva rispetto al registry SoliDS in assenza di un processo di sync.
