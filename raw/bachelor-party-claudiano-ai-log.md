---

# AI Log — bachelor-party-claudiano

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

App web (Vite + React) per organizzare un addio al celibato: spese, roster, missioni, meteo, chat/sync con Supabase, PWA. Stack: **Vite**, **React 18**, **@soli92/solids ^1.14.1** (font in `index.html`, test `tests/solids-package.test.js`), **Supabase** (Auth, Realtime, storage), **Vitest** + Testing Library.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: **Cursor** — presenti `.cursor/rules/agents-context.mdc` e `AGENTS.md` orientato agli assistenti; commit `664b55b` collega README e regola Cursor. Messaggi `feat(P0)`–`feat(P4)` e batch di feature allineano a sessioni assistite. `package.json` **non** include SDK LLM nel prodotto (solo workflow di sviluppo). *Modello LLM specifico non desumibile.*

**Periodo di sviluppo**: 2026-03-21 (root `f244e6e` Initial commit) → 2026-04-08 (`72a21fc` bump SoliDS).

**Numero di commit**: 44

---

## Aggiornamento 2026-04-27 — Soli Prof (RAG) / documentazione

- [soli-prof](https://github.com/soli92/soli-prof) indica questo repo in `CORPUS_REPOS` dove applicabile. Webhook `push` verso `https://soli-prof.vercel.app/api/webhooks/github` (HMAC) per re-ingest. Allineati `AGENTS.md` e riferimenti; i test del repo **non** dipendono.

---

## Aggiornamento 2026-04-29 — Migrazione branding FE Soli

- Branding UI allineato agli asset SoliDS: introdotti `public/soli-logo-4x3-with-text-gold.svg` (wordmark header) e `public/soli-logo-1x1-symbol-only-gold.svg` (loader).
- Nuovo componente `SoliLogoLoader` riusato in `EventSignInScreen`, `EventOnboardingScreen` e `AdminTab`; `GlobalLoader` passa dal vecchio app icon al simbolo Soli.
- Header aggiornato con logo `APP_LOGO_HEADER` e stili dedicati (`hdr-logo`, `soli-inline-loader*` in `party-app.css`).
- PWA/static asset aggiornati (`app-icon.svg`, png derivati, `vite.config.js` include/additional icon metadata, `index.html` con `manifest` esplicito + social image tags).
- Allineamento dipendenza/documentazione/test su **`@soli92/solids ^1.14.1`** (`package.json`, `tests/solids-package.test.js`, `README.md`, `AGENTS.md`, questo log).

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Bootstrap repository e toolchain

**Timeframe**: da `f244e6e` (2026-03-21) ai commit `d5eab6c`–`c30bcb9` (aggiunta Vite, entry, `.gitignore`).

**Cosa è stato fatto**: creazione repo con commit iniziale minimi sequenziali (config, HTML, main, gitignore).

**Evidenza di AI-assist** (inferita):

- Sequenza di micro-commit “chore: add X” tipica di scaffolding guidato o incrementale.
- Commit `466bc10 probe` e `01d6ea0 ..` suggeriscono esperimenti locali più che release note umane curate.

**Decisioni architetturali notevoli**:

- **Vite** come bundler/dev server (non CRA/Next).
- **ES modules** (`"type": "module"` oggi in `package.json`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Inizializza un repo Vite + React con Tailwind/SoliDS, entry `main.jsx` e `.gitignore` per Node."
> *Evidenza*: commit `d5eab6c`–`c30bcb9`, `f244e6e` Initial commit, struttura file minimale sequenziale.

> **Prompt [inferito]**: Nessun prompt specifico desumibile dai file del repo. La fase appare come **bootstrap standard** di Vite.

**Lezioni apprese**

- Micro-commit separati per config/HTML/entry riducono il rischio di un unico commit monolitico difficile da revertare (`d5eab6c`…`c30bcb9`).
- Commit esplorativi (`466bc10` probe, `01d6ea0 ..`) lasciano rumore in history: meglio squash o messaggi descrittivi prima del push.

### Fase 2 — Layer architetturali, documentazione agenti, roadmap P0–P3

**Timeframe**: `a6b4c5c` refactor layer + SoliDS → `d3830db` AGENTS roadmap P0–P3.

**Cosa è stato fatto**: ristrutturazione a layer, hardening UX/storage, documentazione operativa per assistenti (`docs(AGENTS)`), backlog prioritizzato.

**Evidenza di AI-assist** (inferita):

- Commit `664b55b chore: add AGENTS.md, README link, Cursor agents-context rule` lega esplicitamente il repo a **Cursor**.
- Messaggi `feat(P0)` … `feat(P4)` indicano lavoro a milestone numerate (comune in pair programming con AI o issue tracker).

**Decisioni architetturali notevoli**:

- Integrazione **SoliDS** come design system condiviso.
- Allineamento documentazione README/AGENTS alla suite test (`33d7540`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Refactor in layer (`domain/`, `hooks/`, `components/`) e integra SoliDS; aggiungi `AGENTS.md` e regola Cursor con roadmap P0–P3."
> *Evidenza*: `a6b4c5c` refactor layer + SoliDS, `664b55b` Cursor agents-context, `d3830db` roadmap AGENTS.

**Lezioni apprese**

- **Documentazione agent-first** (`AGENTS.md` + `.cursor/rules`) riduce ambiguità per sessioni successive (commit `664b55b`).
- Allineare README/AGENTS **dopo** l’introduzione di Vitest evita drift tra doc e comandi reali (`33d7540`).

### Fase 3 — Funzionalità core: auth Supabase, spese, sync, PWA, quest

**Timeframe**: da `a84e09f` Realtime + `.env.example` fino a `adacfb4` PWA splash/screenshot.

**Cosa è stato fatto**: autenticazione ruoli, spese e settlement, sync stato, luoghi/maps, itinerario/missioni, export CSV, PWA.

**Evidenza di AI-assist** (inferita):

- Batch di feature correlate (sync, RLS, UI) con messaggi convenzionali molto descrittivi.

**Decisioni architetturali notevoli**:

- **Supabase Realtime** su `bpc_state` con fallback polling (`a84e09f`).
- **PWA** (manifest, splash iOS, asset icon SVG) come obiettivo UX mobile.

**Prompt chiave usati**

> **Prompt [inferito]**: "Implementa Supabase Auth P4, spese con settlement, sync Realtime su `bpc_state` con fallback polling, PWA con manifest e splash iOS."
> *Evidenza*: `fd2b16d`, `a84e09f`, `adacfb4`, messaggi `feat(P3)`/`feat(P4)`.

**Lezioni apprese**

- **RLS Supabase ricorsivo sui membri** generava problemi operativi → policy riscritta senza self-reference (`02e66f4`).
- **Realtime + polling** come fallback aumenta resilienza su rete instabile (`a84e09f`).

### Fase 4 — Meteo, auth email, chat roster, dipendenze

**Timeframe**: `2faab6f` widget meteo Open-Meteo → `72a21fc` bump `@soli92/solids` ^1.5.0.

**Cosa è stato fatto**: Open-Meteo, variabili `VITE_AUTH_*`, fix rate limit Supabase, chat con colori roster, scroll/viewport, allineamento schema `bp:rosterMembers`.

**Evidenza di AI-assist** (inferita):

- Messaggi `fix(P4):` con riferimento schema/database suggeriscono debug assistito su integrazione dati.

**Decisioni architetturali notevoli**:

- Meteo basato su **Open-Meteo** (API senza key per uso party).

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi widget meteo Open-Meteo, variabili `VITE_AUTH_*` per conferma email, chat con colore roster mittente, fix scroll viewport."
> *Evidenza*: `2faab6f`, `1816d78`, `b54faca`, `988654d`.

**Lezioni apprese**

- **Rate limit email Supabase** richiede messaggio UX chiaro lato client (`ea6c5b4`).
- **Schema PostgREST** (`bp:rosterMembers` vs `bpc_event_members`) va tenuto allineato al DB o le query falliscono in silenzio (`51e0b7d`).
- **Scroll su mobile/desktop**: wrapper con `overflow: hidden` su troppi livelli rompe touchpad (`988654d`, commit scroll precedenti nella history).

### Fase 5 — Allineamento SoliDS e branding FE (2026-04-24 → 2026-04-29)

**Cosa è stato fatto**: evoluzione dipendenza fino a **`@soli92/solids` ^1.14.1**; font stack allineato a Storybook SoliDS in `index.html`; test dedicato **`tests/solids-package.test.js`**; migrazione branding FE con logo in header/loader e asset PWA aggiornati; README / AGENTS / AI_LOG riallineati.

**Lezioni**: il tema **90s-party** usa font display nei token — un bundle font unico riduce FOUC rispetto a caricamenti parziali.

---

## Pattern ricorrenti identificati

- **Conventional commits** diffusi: `feat(scope):`, `fix(scope):`, `chore(deps):`, `docs:`.
- **Prefissi milestone** `P0`–`P4` su feature/fix legati al product backlog.
- **Documentazione come contratto per agenti**: `AGENTS.md` + `.cursor/rules/agents-context.mdc`.
- **Test**: introduzione Vitest + Testing Library (`3044f2a`) e checklist/manual test (`8433c95`).
- **Allineamento design system**: commit ricorrenti su SoliDS e bump versione pacchetto.

---

## Tecnologie e scelte di stack

- **Framework**: Vite + React 18
- **Styling**: SoliDS (`@soli92/solids`) + CSS dell’app
- **State / data**: Supabase client, Realtime, storage; stato party condiviso
- **Deploy**: documentato verso produzione su `main` (`fd3f132`)
- **LLM integration**: nessuna nel codice applicativo (solo workflow di sviluppo con AI)

## Problemi tecnici risolti (inferiti)

1. **RLS ricorsivo sui membri**: messaggio `02e66f4 fix: RLS membri senza ricorsione e UI mobile`.
2. **Allineamento dati roster / schema PostgREST**: `51e0b7d fix(P4): allinea bp:rosterMembers…`, `de70b0e fix(roster): solo partecipanti reali…`.
3. **Rate limit email Supabase**: `ea6c5b4 fix(auth): messaggio chiaro per email rate limit`.
4. **Scroll viewport / meteo tab**: `988654d fix(ui): viewport scroll…`, `80eb8ab feat(meteo): previsione per giorno tab`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

Estratto parziale in ordine cronologico inverso (HEAD → passato); utile per audit senza rieseguire `git log`.

- `72a21fc` chore(deps): bump @soli92/solids to ^1.5.0
- `b54faca` feat(chat): bolle altrui tinteggiate dal colore roster del mittente
- `988654d` fix(ui): viewport scroll in app, scrollbar sottile, animazione meteo
- `80eb8ab` feat(meteo): previsione per giorno tab (activeDay)
- `1816d78` feat(auth): VITE_AUTH_EMAIL_CONFIRMATION per skip conferma email
- `ea6c5b4` fix(auth): messaggio chiaro per email rate limit Supabase
- `2faab6f` feat: widget meteo Barcellona (Open-Meteo) sotto header
- `51e0b7d` fix(P4): allinea bp:rosterMembers a bpc_event_members; test e doc
- `de70b0e` fix(roster): solo partecipanti reali e allineamento dati condivisi
- `5acf78e` feat(quest): partecipante singolo, podio di gruppo e data fine evento
- `02e66f4` fix: RLS membri senza ricorsione e UI mobile
- `2dd44d9` feat(auth): conferma email con VITE_AUTH_REDIRECT_URL e script reset DB
- `fd3f132` docs: deploy automatico su main verso produzione
- `c936588` feat(roster): nome libero, sync admin atomica e recovery
- `33d7540` docs: allinea README e AGENTS a quest e suite test (Vitest + 14 Node)
- `4905f91` feat(quest): scoring giornaliero, badge, gruppo + admin CRUD
- `adacfb4` feat(pwa): splash iOS + screenshots manifest
- `d0b0e71` feat(assets): icona master SVG, apple-touch 180, script npm run icons
- `3044f2a` test: Vitest + Testing Library (usePartyApp, ExpensesTab)
- `92f83a9` feat(P3): itinerario e missioni editabili + PWA
- `27d2046` feat(expenses): export CSV, report testo e Web Share (P3 #13)
- `fd2b16d` feat(auth): P4 Supabase Auth, ruoli, tab Admin, STORAGE_SQL_P4
- `a6b4c5c` refactor: struttura a layer, SoliDS e hardening UX/storage
- `664b55b` chore: add AGENTS.md, README link, Cursor agents-context rule
- `d3830db` docs(AGENTS): roadmap prioritizzata P0–P3 e voci escluse
- `f244e6e` Initial commit

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** su `src/` (esclusi artifact): **nessun match** rilevante nel codice applicativo al momento dell’analisi.
- **File `*_draft*`, `*_old*`, `*_deprecated*`**: nessuno trovato per nome in root progetto.
- **Roadmap oltre P4**: ancora descrittiva in `AGENTS.md` / issue tracker, non codificata in sorgente (da aggiornare quando le milestone cambiano).
- **Debito tecnico inferito**: test Vitest concentrati su subset (`3044f2a`); altri flussi (chat, meteo, admin) potrebbero mancare di copertura analoga.
- **Debito tecnico inferito**: dipendenza forte da convenzioni storage `bp:*` e schema Supabase — ogni migrazione richiede checklist manuale oltre ai test.
- **Debito tecnico inferito**: PWA + iOS splash/manifest richiedono asset multi-risoluzione (`d0b0e71`); manutenzione costosa se cambia branding.

---

> **Nota metodologica**: la prima stesura è stata generata retroattivamente da `git log`. Le sezioni *[inferito]* sotto sono state completate automaticamente il 2026-04-22 integrando anche `AGENTS.md`, `.cursor/rules/`, `package.json` e grep sui sorgenti; valida i punti dubbi a mano.

---

## Metodologia compilazione automatica

Questo `AI_LOG.md` è stato completato in modalità autonoma il **22 aprile 2026** analizzando:

- **44** commit di git history (riferimento `main` al momento dell’aggiornamento)
- **~8** file/config di contesto (`package.json`, `vite.config.*`, `tailwind.config.*`, `AGENTS.md`, `.cursor/rules/agents-context.mdc`, `vitest`/`tests`, `README.md`)
- **0** occorrenze `TODO|FIXME|HACK|XXX` in `src/` (pattern di codice osservabili)

Le sezioni marcate con *[inferito]* sono deduzioni dal repository, non memoria diretta del developer.

**Punti di minore confidenza (verifica prioritaria):**

- Prompt testuali fase 1–4: ricostruiti solo da commit e struttura cartelle, senza transcript di sessione.
- Attribuzione “Cursor” vs altri IDE: basata su file e messaggi commit, non su telemetria.
- Completezza grep TODO: limitata ai path workspace accessibili dall’analisi.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.
