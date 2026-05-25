---

# AI Log — soli-dm-fe

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Frontend **Next.js 15→16** (evoluzione in corso nei commit) per **Soli Dungeon Master**: shell UI con **@soli92/solids ^1.7.0** (font in `app/layout.tsx`, test `lib/solids-package.test.ts`), componenti primitivi, wiki, mappa, PWA, **Vitest** e **GitHub Actions** (lint, typecheck, test, build). Partenza con **shadcn/ui** poi rimozione Radix a favore di Tailwind+Solids.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: assistenza **IDE/LLM probabile** (serie `fix: create simple …`). `AGENTS.md` esplicito (`cd52603`). Pattern `.cursor/rules` ecosistema soli92. Nessun SDK LLM nel frontend DM. Messaggi commit lunghi multi-scope (`6a4d4cd`, `73c4d40`).

**Periodo di sviluppo**: 2026-04-02 (`9be38af` Initial commit) → 2026-04-09 (`ea2b362` fix characters UX).

**Numero di commit**: 53

---

## Aggiornamento 2026-04-27 — Soli Prof (RAG) / documentazione

- [soli-prof](https://github.com/soli92/soli-prof) indica questo repo in `CORPUS_REPOS` dove applicabile. Webhook `push` verso `https://soli-prof.vercel.app/api/webhooks/github` (HMAC) per re-ingest. Allineati `AGENTS.md` e riferimenti; i test del repo **non** dipendono.

---

## Aggiornamento 2026-04-29 — Branding Soli + bump SoliDS

- Migrazione branding completata: home (`app/(dm)/page.tsx`), navigazione (`components/navigation.tsx`) e loader fullscreen (`components/ui/full-screen-loader.tsx`) usano `SoliBrandLogo` al posto di `D20Icon`.
- Metadati PWA/SEO aggiornati (`app/layout.tsx`, `app/manifest.ts`): favicon SVG Soli, `manifest.webmanifest` esplicito, icona touch `180x180`, Open Graph/Twitter image su logo Soli.
- Pipeline icone allineata (`scripts/generate-pwa-icons.mjs`) con sorgente `public/brand/soli-symbol-gold.svg`; rigenerate `public/icons/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.
- Dipendenza e test allineati a **`@soli92/solids` ^1.14.1** (`package.json`, lockfile, `lib/solids-package.test.ts`, docs repo).

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Scaffold Next + shadcn + Solids preset

**Timeframe**: `9be38af` → `5baf006` (global styles with solids).

**Cosa è stato fatto**: dipendenze Next 15 + solids + shadcn, config TS/Next/Tailwind/PostCSS, layout, provider tema/toast, home hero, componenti Button/Input/Card, fix React 18, `components.json` shadcn.

**Evidenza di AI-assist** (inferita):

- Commit ripetuti `feat: add Button component` / `fix: add missing dependencies` — tipico scaffolding shadcn/Next assistito.

**Decisioni architetturali notevoli**:

- **Tailwind** con preset **solids** (`ae9e2d0`).
- Uso iniziale **shadcn/ui** e Radix.

**Prompt chiave usati**

> **Prompt [inferito]**: "Scaffold Next 15 + Tailwind preset Solids + shadcn, layout, provider tema, home hero, componenti Button/Input/Card."
> *Evidenza*: `58ff7c0`–`5baf006`, messaggi `feat: add …`.

**Lezioni apprese**

- **shadcn** richiede pinning dipendenze (`8a2a733`, `3c3c5eb`) per evitare versioni inesistenti.

### Fase 2 — Rimozione Radix, componenti “simple”, API client, SETUP

**Timeframe**: `d28fe12` remove radix → `0fe1d23` shadcn config (coesistenza transitoria) fino a `4eed4c6` utilities.

**Cosa è stato fatto**: sostituzione progressiva con componenti Tailwind-only, fix versioni `react-leaflet`, helper `cn`, hook `useAuth`, SETUP.md, script `setup.sh`, docs README.

**Evidenza di AI-assist** (inferita):

- Sequenza `fix: create simple Button/Input/Card/...` molto uniforme — forte segnale di generazione assistita o copia template.

**Decisioni architetturali notevoli**:

- **Riduzione dipendenze** Radix (`d28fe12`) per allineamento al design system Solids.

**Prompt chiave usati**

> **Prompt [inferito]**: "Rimuovi @radix-ui, crea componenti Tailwind-only minimali, aggiungi `cn`, `useAuth`, SETUP.md e script setup."
> *Evidenza*: `d28fe12`, sequenza `fix: create simple …`, `32bcc57`.

**Lezioni apprese**

- **Rimozione Radix** riduce bundle e allinea al preset Solids, ma richiede riscrivere primitive (`d28fe12`).

### Fase 3 — Route group (dm), CI GitHub Actions, PWA, shell MD-inspired

**Timeframe**: `6a4d4cd` → `2cc2c08` shell SoliDS MD-inspired.

**Cosa è stato fatto**: ristrutturazione route, tema fantasy, API modulare, wiki, test Vitest; CI; fix PWA cache; branding D20; bump SoliDS `273f9a7`.

**Evidenza di AI-assist** (inferita):

- Commit `6a4d4cd` aggrega molte aree (route, tema, API, wiki, test) — possibile batch assistito.

**Decisioni architetturali notevoli**:

- **Route group** `(dm)` per namespacing app (`6a4d4cd`).
- **PWA** con manifest e fix cache API (`2cc2c08`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Introduci route group (dm), tema fantasy, CI GitHub Actions, fix PWA workbox, branding D20, bump SoliDS."
> *Evidenza*: `6a4d4cd`, `605a11f`, `fcbc4d8`, `273f9a7`.

**Lezioni apprese**

- **Workbox / next-pwa**: matcher cache deve **escludere** basi API inlined nello SW (`AGENTS.md` nota PWA).

### Fase 4 — Wiki accessibile, tipologiche, sidebar, allineamento primitive SoliDS

**Timeframe**: `517c08b` → `ea2b362`.

**Cosa è stato fatto**: UI wiki strutturata, tipi divinità, tipologiche D&D per form, sidebar con avatar/tema/logout, allineamento primitive a registry SoliDS, fix creazione personaggi con campagna obbligatoria.

**Evidenza di AI-assist** (inferita):

- Messaggi lunghi e multi-scope (`73c4d40`, `ea2b362`) coerenti con sessioni di pair programming.

**Decisioni architetturali notevoli**:

- **Registry** componenti SoliDS come fonte di verità UI (`73c4d40`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Rendi wiki accessibile, aggiungi tipologiche D&D in `lib/tipologiche`, sidebar con avatar, allinea primitive a registry SoliDS; campagna obbligatoria su creazione personaggio."
> *Evidenza*: `517c08b`, `2d217d7`, `dffe6c9`, `73c4d40`, `ea2b362`.

**Lezioni apprese**

- **Form personaggi** senza campagna selezionata crea dati inconsistenti → obbligo campagna in UI (`ea2b362`).

### Fase 5 — Bump @soli92/solids 1.7.0, font stack, test dipendenza (2026-04-24)

**Cosa è stato fatto**: dipendenza **`@soli92/solids` ^1.7.0**; link **Google Fonts** in `app/layout.tsx`; **`lib/solids-package.test.ts`** in Vitest; README / AGENTS / AI_LOG aggiornati.

**Lezioni**: il tema **fantasy** usa heading serif da token — caricare le famiglie display evita mismatch con Storybook SoliDS.

---

## Pattern ricorrenti identificati

- **Transizione shadcn → Solids-only** documentata nella history (meno dipendenze).
- **CI** introdotta a metà vita (`605a11f`).
- **Commit emoji** 📝 per documentazione AGENTS.
- **Fix** granulari su classi Tailwind (`a97f35f`, `4d660c3`).

---

## Tecnologie e scelte di stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind + SoliDS preset; temi fantasy
- **Mappe**: react-leaflet (versioni pin in fix)
- **Auth**: Supabase (env in docs)
- **Deploy**: Vercel (preview menzionate nel backend CORS)
- **LLM integration**: nessuna nel client DM oltre allo sviluppo assistito

## Problemi tecnici risolti (inferiti)

1. **swcMinify deprecato**: `1c87bb0`.
2. **react-leaflet version**: `3c3c5eb`.
3. **font-body class undefined**: `a97f35f`.
4. **Solids content path Tailwind**: `4d660c3`.
5. **Flusso creazione personaggi / campagna**: `ea2b362`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `ea2b362` fix(characters): campagna obbligatoria in creazione e UX elenco
- `73c4d40` feat(ui): allinea primitive a registry SoliDS, docs e test
- `605a11f` ci: GitHub Actions (lint, typecheck, test, build) + ESLint config
- `6a4d4cd` feat: route group (dm), SoliDS fantasy, API modulare, wiki e test Vitest
- `d28fe12` fix: remove @radix-ui dependency, use Tailwind + Solids only
- `8693d0f` feat: add Button component from shadcn/ui
- `58ff7c0` feat: add Next.js 15 + solids + shadcn/ui dependencies
- `9be38af` Initial commit

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `app/`, `components/`, `lib/`: nessun match prioritario in questa passata.
- **Next 15 vs 16**: `AI_LOG` menziona evoluzione — verificare `package.json` e messaggi CI per versione effettiva su `main`.
- **Debito tecnico inferito**: wiki accessibilità (`517c08b`) va rivalidato con axe/Playwright non citati nel log.
- **Debito tecnico inferito**: i18n assente — tutta l’UI presumibilmente IT/EN misto come da commit.
- **Debito tecnico inferito**: dipendenze Radix residue su alcune primitive (`AGENTS.md` elenca `@radix-ui/react-tabs` ecc.) — verificare coerenza con narrativa “Solids-only”.

---

> **Nota metodologica**: completamento 2026-04-22; incrociare con `.github/workflows/ci.yml` per gate reali.

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **53** commit (stima da prima stesura; verificare `git rev-list --count HEAD`)
- **~9** file (`package.json`, `next.config.ts`, `AGENTS.md`, `vitest.config.ts`, `.github/workflows/ci.yml`, `lib/tipologiche/`, `components/ui/`)
- **0** TODO/FIXME rilevanti dal grep workspace

**Punti di minore confidenza:**

- Numero commit se `main` remoto avanzato oltre `ea2b362`.
- Stato effettivo dipendenze Radix vs messaggio “remove radix”.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.
