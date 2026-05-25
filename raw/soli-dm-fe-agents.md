# AGENTS.md — Soli Dungeon Master Frontend

**Ultimo aggiornamento:** 2026-04-29

## Progetto

**Next.js 15** (App Router), **React 18**, **TypeScript**, **Tailwind** + **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids)** (^1.14.1). Autenticazione **Supabase** (email/password in UI; OAuth configurabile in dashboard). API REST verso **soli-dm-be** (`lib/api.ts`). Notifiche: **Sonner**. PWA: **@ducanh2912/next-pwa** (SW disabilitato in `development`).

**URL produzione:** https://soli-dm-fe.vercel.app (Vercel). Backend tipico: https://soli-dm-be.onrender.com

**Memoria sviluppo AI-assisted:** [`AI_LOG.md`](./AI_LOG.md)

## Checklist prima di una PR

1. `npm run lint` · `npm run type-check` · `npm test` (include **`lib/solids-package.test.ts`** per range **`@soli92/solids` ^1.14.1**) · `npm run build` (allineato a `.github/workflows/ci.yml`, Node **22** in CI).
2. Non committare `.env.local` né segreti; usare `.env.example` come riferimento.
3. Dopo cambi a **PWA / URL API**: verificare build e che `NEXT_PUBLIC_API_URL` sia coerente con Vercel.

## Struttura rilevante

| Area | Path |
|------|------|
| Pagine app | `app/(dm)/` — home, auth, campaigns, `characters` (+ `[id]` dettaglio), dice-roller, wiki (`wiki/*` static + `[name]` / `[category]`) |
| Layout DM | `app/(dm)/layout.tsx` — skip link (`focus:top-20` sotto app bar), `#main-content`, `appCanvas` |
| Nav / tema | `components/navigation.tsx` (drawer + backdrop su tutti i breakpoint, app bar sempre visibile), `components/theme-switcher.tsx` |
| Scheda personaggio | `components/character/CharacterIdentityPanel.tsx` (identità + multiclasse), `CharacterTabsFields.tsx` (tab stats con modificatori, armamenti, storia, …) |
| UI primitives (registry SoliDS) | `components/ui/` — `button` (cva + `@radix-ui/react-slot`), `card`, `input`, `textarea`, `tabs` (`@radix-ui/react-tabs`), `avatar` (`@radix-ui/react-avatar`), `full-screen-loader` (overlay `z-[100]` su lista/dettaglio personaggi) |
| Select nativo / form | `lib/solids-native-classes.ts` — `solidsNativeSelectTrigger`; `appSelectField` in `lib/ui-classes.ts` lo riusa |
| Classi layout copy | `lib/ui-classes.ts` — `appPageShell`, **`appPageShellCharacter`** (scheda XL), `appPanelStack`, **`appCanvas`** (`min-h-[calc(100dvh-3.5rem)]` sotto header h-14 su tutti i breakpoint), **`appSelectField` / `appFormControl`** (touch ~48px mobile, MD3), `appFieldLabel` / `appFieldHint`, `appMuted`, … |
| Scheda / numeri D&D | `lib/character-sheet.ts` — `stats`/`sheet_data`, `abilityModifierFromScore`, normalizzazione |
| Riferimento razza/classe (testo + bonus fissi SRD) | `lib/racial-class-reference.ts` — usato dalla UI statistiche |
| Util class names | `lib/utils.ts` — `cn` (clsx + tailwind-merge) |
| Errori auth IT | `lib/auth-errors.ts` — `formatAuthError()` usato in login/register |
| Client API | `lib/api.ts` — header opzionale `NEXT_PUBLIC_SOLI_DM_API_KEY` se il backend ha `SOLI_DM_API_KEY` |
| Tipologiche dominio | `lib/tipologiche/` — `dnd.ts` (classi/razze/allineamenti), **`subclasses.ts`** (sottoclassi SRD per `PLAYBOOK_CLASS_NAMES`), app, dadi, wiki (`index.ts` re-export) |
| PWA / Workbox | `next.config.ts` — `dynamicStartUrl: false` (evita `_async_to_generator` nel SW); runtime cache cross-origin con matcher che **esclude** le basi API (stringhe inlined nel SW) |
| Branding Soli | `components/brand/SoliBrandLogo.tsx`, `public/brand/soli-logo-gold.svg`, `public/brand/soli-symbol-gold.svg`, `public/brand/soli-favicon.svg`, script `scripts/generate-pwa-icons.mjs` |

## Test (Vitest)

- `npm test` / `npm run test:watch`
- File: `tests/auth-errors.test.ts`, `tests/utils.test.ts`, `tests/tipologiche.test.ts`, `tests/subclasses.test.ts`, `tests/solids-ui.test.ts`, `tests/client.test.ts`, `tests/character-sheet.test.ts`, `tests/characters-api.test.ts`, `tests/racial-class-reference.test.ts`, `tests/useCampaigns.test.tsx`
- Setup: `vitest.config.ts` → `vitest.setup.ts`; `@testing-library/react` dove serve

### Integrazione Soli Prof (RAG / webhook)

Questo repository è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof). I test Vitest (vedi sotto) **non** dipendono dal webhook `push` su Soli Prof. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `setup-webhooks.sh`.

## Variabili d’ambiente

Vedi **`.env.example`**. In sintesi:

- `NEXT_PUBLIC_API_URL` — backend (es. `http://localhost:5000` in locale)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SOLI_DM_API_KEY` — opzionale, solo se attiva la chiave sul backend

## Comandi

`npm run dev` · `npm run lint` · `npm run type-check` · `npm test` · `npm run build` · `npm start`

## Note storiche (build)

Problemi già risolti in passato: `react-leaflet@^4.2.3` (usare ^4.2.1), `@apply font-body` assente in Tailwind, `swcMinify` deprecato in `next.config`. Il **Button** SoliDS usa di nuovo `@radix-ui/react-slot` (pattern shadcn/registry).

## Link

- **README.md** — guida utente / setup
- **SETUP.md** — Vercel, Git, deploy
- **Backend:** [soli92/soli-dm-be](https://github.com/soli92/soli-dm-be)
- **Design system:** [soli92/solids](https://github.com/soli92/solids)

## Regole per l’agente

- **SoliDS:** il pacchetto npm espone CSS + preset; i componenti React seguono il **registry** solids (non importare `@soli92/solids` come componenti). Niente colori Tailwind grezzi (`gray-*`, `blue-*`) su form: solo token (`border-input`, `primary`, …).
- Non aggiungere librerie UI pesanti duplicate rispetto al pattern SoliDS + componenti locali.
- Messaggi utente e copy auth: **italiano**; errori Supabase mappati con `formatAuthError` dove appropriato.
- Coerenza **CORS**: configurazione sul backend; il FE non “sistema” CORS da solo.

## Known edge cases & gotchas

- **Pinning dipendenze in flussi shadcn**: nella history ci sono stati break dovuti a versioni non valide/instabili durante lo scaffolding shadcn; quando si rigenerano componenti o si riallineano dipendenze, verificare i pin usati nel progetto. Fix storici: `8a2a733`, `3c3c5eb`.

- **Tailwind content path per SoliDS**: una configurazione incompleta dei path di content può far sparire classi/stili SoliDS in build (pur con codice corretto). Riferimento fix: `4d660c3` (vedi AI_LOG “Problemi tecnici risolti”).

- **Creazione personaggi: campagna obbligatoria**: senza campagna selezionata si producono dati inconsistenti; il flusso UI è stato corretto imponendo il vincolo in creazione. Riferimento: `ea2b362`.
