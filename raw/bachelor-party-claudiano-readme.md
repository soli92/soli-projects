# bachelor-party-claudiano

Web app **React** per coordinare l’addio al celibato di Claudiano (weekend **Barcellona, 27–29 marzo**): itinerario condiviso, **quest** (festeggiato, gruppo o **partecipante singolo**), punteggi per giorno, **classifica di gruppo con badge** e podio post-evento configurabile, spese e saldi, luoghi, chat con testo e immagini. L’interfaccia e i messaggi di sistema sono in **italiano**.

Per convenzioni da assistenti AI, roadmap e casi limite vedi anche **[`AGENTS.md`](./AGENTS.md)**. Il progetto è in [**Soli Prof** RAG `CORPUS_REPOS`](https://github.com/soli92/soli-prof); l’ingest può seguire un push via webhook (dettagli in Soli Prof `AGENTS.md`). I test in repo restano l’esito di `npm test` locale/CI, non del webhook.

---

## Requisiti

- **Node.js** 18+ (consigliato LTS)
- **npm** (il repo usa `package-lock.json`)

---

## Avvio rapido

```bash
git clone https://github.com/soli92/bachelor-party-claudiano.git
cd bachelor-party-claudiano
npm install
```

Opzionale — sync multi-dispositivo con **Supabase**:

1. Copia **`/.env.example`** in **`.env`** nella root (`cp .env.example .env`) e incolla URL e **anon key** del progetto (vedi anche **Variabili d’ambiente** sotto).
2. Esegui lo SQL della costante **`STORAGE_SQL`** in `src/lib/storage.js` sullo **stesso** progetto Supabase (tabella **`bpc_state`**, prefisso `bpc_` per convivere con altre app sullo stesso DB).

```bash
npm run dev
```

L’app è servita da Vite (di default **http://localhost:5173**).

---

## Deploy

Un **push su `main`** sul repository GitHub collegato innesca il **deploy automatico in produzione** (hosting/CI configurato sul progetto remoto: es. Vercel, Netlify, Cloudflare Pages — non c’è workflow GitHub Actions in questo repo). Dopo ogni merge, controlla lo stato del build sull’host e, se usi PWA, che la nuova versione sia visibile dopo eventuale aggiornamento del service worker.

---

## Script npm

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo Vite |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Anteprima locale della build |
| `npm test` | **Vitest** (hook, form spese, **`adminSharedQuadPersist`**, **`solids-package`**) poi **Node** (`tests/app.test.js`: dominio, `questScoring`, auth, meteo giornaliero, …) |
| `npm run test:watch` | Vitest in watch (solo test React) |
| `npm run icons` | Rigenera PNG in `public/` da `public/app-icon.svg` (richiede **sharp**) |
| `npm run splash` | Screenshot manifest + splash Apple da `splash-portrait.svg` / `splash-landscape.svg`; aggiorna `index.html` tra `APPLE_SPLASH_*` |
| `npm run assets` | `icons` poi `splash` |

---

## Stack tecnico

| Area | Tecnologia |
|------|------------|
| Build | **Vite 5** + **vite-plugin-pwa** (manifest, service worker, precache) |
| UI | **React 18** |
| Styling | **Tailwind CSS 3** + classi dedicate in `src/styles/party-app.css` |
| Design system | **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids)** (`^1.14.1`) — tema **`90s-party`** su `<html>` in `index.html` |
| Branding FE | Logo SoliDS nel titolo (`PartyHeader`) + loader inline (`SoliLogoLoader`) con asset SVG locali |
| Backend opzionale | **Supabase** (`@supabase/supabase-js`) — tabella **`bpc_state`** (chiave testo + `jsonb`) |
| Test UI | **Vitest** + **@testing-library/react** + **happy-dom** (`vitest.config.js`; env Supabase vuoto nei test) |
| Persistenza locale | Adapter in `src/lib/storage.js` (vedi priorità sotto) |

File di configurazione principali: `vite.config.js`, `tailwind.config.cjs`, `postcss.config.js`.

---

## Struttura del codice (`src/`)

L’app è organizzata per **layer** (dati statici, dominio, hook, UI).

```
src/
├── main.jsx                 # Mount React
├── App.jsx                  # Router leggero: picker utente → layout tab + toast/sync
├── index.css                # Tailwind + import CSS SoliDS
├── constants/
│   ├── storageKeys.js       # Chiavi persistenza (prefisso bp:)
│   ├── appIcon.js           # Percorsi favicon / PWA (allineati a index + vite manifest)
│   ├── eventRoles.js
│   └── questBadges.js       # Soglie badge fine weekend
├── data/
│   ├── party-roster.json    # Lista partecipanti, festeggiato (primo), nickname, colori
│   ├── party.js             # Itinerario, `DAYS` + `DAY_CALENDAR_DATE_ISO`, `VENUE_WEATHER`, `PARTY_QUEST_FINALE_AFTER_ISO`; MEMBERS dal roster
│   └── navigation.js        # Tab principali + helper deep link (?tab=)
├── domain/
│   ├── balances.js          # Saldi netti + `computeSettlements` (chi deve a chi)
│   ├── missions.js          # (legacy) helper punti su lista semplice
│   ├── questScoring.js      # Punti per giorno, `leaderboardRowsDetailed`, badge, `questAppliesToMember`
│   ├── partyContent.js      # Normalizza itinerary, missioni legacy, **quest** e completions
│   └── places.js            # Tipi luogo, emoji, mapsLinkForPlace
├── hooks/
│   ├── usePartyApp.js       # Stato globale, sync (Realtime + poll), azioni, toast
│   └── useVenueWeather.js   # Meteo giornaliero per `activeDay` (cache per data ~10 min)
├── lib/
│   ├── resolvePartyRoster.js # Valida party-roster.json, colori di default
│   ├── eventAuth.js         # fetchMyMember, fetchAllMembers, joinEvent; `rosterNamesFromEventMemberRows` (P4)
│   ├── expenseExport.js     # CSV + testo report spese (export tab Spese)
│   ├── storage.js           # createStorage(), STORAGE_SQL per Supabase
│   ├── bpStateRealtime.js   # subscribe postgres_changes su bpc_state (Supabase)
│   ├── imageCompress.js     # JPEG ridimensionato per allegati chat
│   ├── chatAttachmentLimits.js # Tipo MIME e dimensione max prima della compressione
│   ├── authEmailConfig.js   # VITE_AUTH_EMAIL_CONFIRMATION → conferma email attesa
│   ├── authFlowMessages.js  # Messaggi utente per errori Supabase Auth (es. rate limit email)
│   ├── weatherOpenMeteo.js  # Open-Meteo: giorno su `DAY_CALENDAR_DATE_ISO` (forecast / archive)
│   └── formatTime.js        # Orario messaggi (locale it-IT)
├── styles/
│   └── party-app.css        # Layout app, tab, chat, toast, sync bar, form spese
└── components/organisms/
    ├── UserPickerScreen.jsx
    ├── PartyHeader.jsx      # Titolo weekend + meteo per `activeDay`
    ├── VenueWeatherStrip.jsx # Min/max e condizione per il giorno tab Piano/Quest
    ├── PartyTabNav.jsx
    ├── SyncStatusBar.jsx    # Online / errore sync / sincronizzato
    ├── GlobalLoader.jsx     # Sessione P4 + primo sync dati Supabase
    ├── AppToast.jsx         # Feedback errori e messaggi brevi
    ├── ItineraryTab.jsx
    ├── QuestTab.jsx         # Quest, podio, chip «Chi stai spuntando» (solo se ≥2 nel roster), CRUD locale
    ├── AdminQuestSection.jsx # CRUD quest (tab Admin P4); audience + assignee roster
    ├── ExpensesTab.jsx      # Nuova / modifica / elimina spesa
    ├── PlacesTab.jsx        # CRUD luoghi, Maps, riordino
    ├── ChatTab.jsx
    └── AdminTab.jsx         # Membri P4 + sezione quest (organizzatore)
```

Panorama test: vedi sezione **[Test](#test)** in fondo. In sintesi: Vitest + **`vitest.config.js`** (happy-dom); suite Node su dati, saldi, export, **`partyContent`** (inclusi **`normalizeQuests`** con audience **`member`**) e **`domain/questScoring.js`** (podio / badge).

### Lista partecipanti

Modifica **`src/data/party-roster.json`** e rilancia `npm run dev` / `npm run build`:

| Campo | Contenuto |
|-------|-----------|
| `groomNickname` | Nome breve per i titoli (es. schermata login). |
| `members` | In build: tipicamente **solo il festeggiato**; il roster condiviso (`bp:rosterMembers`) si popola con chi entra (picker locale o iscritti P4). Il **primo** elemento è sempre il festeggiato. |
| `colors` | Opzionale: oggetto `{ "Nome esatto": "#RRGGBB" }`. Per i nomi senza entry si usa una palette fissa in ordine. |

Nomi duplicati (ignorando maiuscole/minuscole) fanno fallire il build. Con **P4 / Supabase**, aggiorna anche `groom_display_name` in `bpc_app_config` affinché coincida col primo elemento di `members`, altrimenti l’iscrizione come festeggiato viene rifiutata.

---

## Funzionalità (versione attuale)

### Identità

- Schermata iniziale: scelta del nome tra i partecipanti definiti in `party-roster.json` (esportati da `data/party.js`).
- Il profilo scelto è salvato in storage **locale** (non condiviso tra dispositivi come le altre chiavi).
- Logout dall’header: rimuove solo il profilo locale; i dati di gruppo restano sullo storage condiviso.

### Tab principali

| Tab | Contenuto | Persistenza condivisa |
|-----|-----------|------------------------|
| **Piano** | Itinerario su 3 giorni (testi **editabili** da tutto il gruppo), attività spuntabili | `bp:itinerary` + `bp:doneTasks` |
| **Quest** | Come sopra; **podio** e chip «Chi stai spuntando» usano il **roster effettivo** (con P4 allineato a **`bpc_event_members`**). Se c’è una sola persona, la sezione chip non compare. Dopo **`PARTY_QUEST_FINALE_AFTER_ISO`** titolo “Podio finale”; CRUD da **Admin** (P4) o in tab (solo locale) | `bp:quests` + `bp:questCompletions` |
| **Spese** | Nuova spesa, **modifica** ed **eliminazione** (con conferma), split, lista, saldi, **export** (copia testo, CSV, Condividi se supportato) | `bp:expenses` |
| **Luoghi** | Elenco, **nuovo / modifica / elimina**, **riordino** (↑↓), link **Apri in Maps** (URL opzionale o ricerca automatica) | `bp:places` |
| **Chat** | Messaggi testo e immagine (compressa), badge non letti; allegati solo **immagine**, max **8 MB** prima della compressione | `bp:messages` |

### Spese (dettaglio)

- Validazione con messaggi sotto il form (descrizione, importo > 0, almeno una persona nello split).
- **Modifica**: pulsante su ogni riga → form in modalità “Salva modifiche”; **Annulla** per uscire.
- **Elimina**: conferma browser prima di rimuovere la voce dalla lista condivisa.
- Salvataggio ottimistico con **rollback** e **toast** se la scrittura fallisce.
- **Saldi**: saldo netto per persona (come prima). Sotto, se serve regolare i conti, sezione **“Chi deve a chi”**: piano di bonifici con il minor numero di trasferimenti, calcolato da `computeSettlements` in `domain/balances.js` (stesse regole di `computeBalances` sulle voci valide).
- **Export**: sulla lista spese, **Copia testo** (report con voci + “chi deve a chi” + data), **Scarica CSV** (apri in Excel / Fogli), **Condividi** dove il browser espone la Web Share API (spesso su mobile).

### Piano e quest (dettaglio)

- **Piano**: ogni giorno (ven / sab / dom) ha attività con orario, titolo, descrizione, emoji. **+ Attività**, **Modifica**, **Elimina** (con conferma), riordino **↑↓**. Tap sulla riga spunta come completata (`bp:doneTasks`). I contenuti vivono in **`bp:itinerary`**; all’avvio, se assenti, si usano i default in `data/party.js`. Rimuovere un’attività elimina i relativi flag “fatto” in sync.
- **Quest**: lista in **`bp:quests`**. Ogni voce ha `day` (fisso o `null` = “weekend”, cioè collegato al giorno selezionato nel Piano) e `audience`: **`groom`** (solo festeggiato), **`all`** (tutti), **`member`** + campo **`assignee`** (stringa uguale al nome sul roster). Completamenti in **`bp:questCompletions`**: `{ [nomeMembro]: { [questId]: "friday"|"saturday"|"sunday" } }`. Punteggio in **`domain/questScoring.js`** (`leaderboardRowsDetailed` per il podio con badge migliore per persona); soglie in **`constants/questBadges.js`**. In **`data/party.js`**, **`PARTY_QUEST_FINALE_AFTER_ISO`** (ISO 8601) fa passare l’UI del podio in modalità “weekend chiuso” dopo quell’istante — aggiornalo alla fine reale dell’evento. Migrazione automatica da `bp:missions` / `bp:doneMissions` se `bp:quests` è vuoto. Se rinomini un membro, le quest con `assignee` al vecchio nome vanno aggiornate a mano.
- **P4 — roster vs elenco iscritti:** dopo il primo sync condiviso, l’app confronta **`bp:rosterMembers`** con le righe di **`bpc_event_members`** (`fetchAllMembers` + `rosterNamesFromEventMemberRows` in **`lib/eventAuth.js`**). Se differiscono, aggiorna `bp:rosterMembers`, riconcilia spese/quest/completamenti e ripersiste (così podio, spese e chip mostrano solo chi è **registrato**). La stessa sincronizzazione parte al **ritorno in tab** (`visibilitychange`).

### PWA (installazione)

- Dopo **`npm run build`**, la cartella **`dist/`** include **`manifest.webmanifest`**, **service worker** e precache Workbox. In **HTTPS** (o **localhost**), il browser può proporre **Aggiungi a schermata Home**.
- **Icone:** sorgente **`public/app-icon.svg`**; **`npm run icons`** → `favicon-32.png`, **`apple-touch-icon.png`**, **`pwa-192.png`**, **`pwa-512.png`**. Percorsi in **`src/constants/appIcon.js`** (loader).
- **Splash / installazione:** **`public/splash-portrait.svg`** e **`splash-landscape.svg`**; **`npm run splash`** produce **`pwa-screenshot-narrow.png`** / **`pwa-screenshot-wide.png`** (campo `screenshots` nel manifest per Chrome) e PNG **`apple-splash-*.png`** con `link rel="apple-touch-startup-image"` + `media` in **`index.html`** (tra `APPLE_SPLASH_START` / `END`). Meta **`apple-mobile-web-app-capable`** e titolo breve per iOS. Rigenerando splash **non** modificare manualmente quel blocco di link. Comando unico: **`npm run assets`** (icone + splash).
- In sviluppo (`npm run dev`) lo SW non è equivalente alla build di produzione: verifica installazione sul sito pubblicato.

### Esperienza d’uso (fluidità)

- **`GlobalLoader`**: schermata piena durante verifica sessione (P4) e durante il **primo** caricamento dati condivisi da Supabase (`sharedHydrated` in `usePartyApp`).
- Transizione tra tab (`.tab-swap`), animazione contenuti (`.fade`), ombre sulle card al passaggio mouse, feedback `active` su pulsanti e giorni; **`prefers-reduced-motion`** disattiva le animazioni invasive (`party-app.css`).
- Backlog idee a **bassa priorità** (date nei tab, skeleton liste, altre taglie splash): vedi **`AGENTS.md`** sezione *Backlog*.

### Luoghi (dettaglio)

- Ogni posto può avere un campo opzionale **`mapsUrl`** (link `https://…`); se assente, **Apri in Maps** usa una ricerca Google su nome + zona + “Barcellona” (`mapsLinkForPlace` in `domain/places.js`).
- **Modifica** / **Elimina** (con conferma) e **sposta su/giù** per l’ordine nella lista; l’ordine è persistito nell’array salvato in `bp:places`.

### Chat

- Invio con `await` sullo storage; in caso di errore il messaggio viene rimosso dalla UI e compare un toast.
- Prima della compressione: controllo **tipo** (`image/*`) e **dimensione** (vedi `src/lib/chatAttachmentLimits.js`).
- Caricamento immagine: errori di lettura/compressione mostrano un toast.

### Navigazione e accessibilità

- Barra tab: **`role="tablist"`**, ogni voce **`role="tab"`** con **`aria-selected`** e **`tabIndex`** sul tab attivo; **frecce sinistra/destra** spostano il focus e cambiano sezione.
- Il contenuto del tab attivo è avvolto in un **`role="tabpanel"`** con **`aria-labelledby`** verso il tab corrispondente (`App.jsx`).

### Sincronizzazione e rete

- Con **Supabase** e Realtime abilitato sulla tabella `bpc_state`, gli aggiornamenti arrivano via **WebSocket** (`postgres_changes`); resta un **poll di riserva** circa ogni **45 s** per recuperare incoerenze o errori di canale.
- Senza Realtime o con solo **localStorage** / **artifact**, il **polling** resta circa ogni **3,5 s** sulle **sette** chiavi condivise (allineamento tra dispositivi; ultima scrittura vince sullo stesso blob).
- **SyncStatusBar**: stato “Sincronizzato”, avviso se l’ultimo poll fallisce (es. errore rete/Supabase), oppure “Offline” se il browser segnala assenza di connessione.
- In lettura, **Supabase** propaga errori di query (per far emergere problemi di sync); `window.storage` in artifact continua a gestire errori in modo silenzioso lato `get`.

### Deep link

- All’avvio il tab attivo può essere letto dalla query string: **`?tab=`** con uno tra: `itinerary`, `missions`, `expenses`, `places`, `chat`.
- Cambiando tab, l’URL viene aggiornato con **`history.replaceState`** (nessun ricaricamento pagina), così si può condividere o aggiornare la pagina restando sulla stessa sezione.

La logica è in `src/data/navigation.js` (`readTabFromSearch`, `replaceTabInUrl`, `isValidTabId`).

---

## Variabili d’ambiente

Le variabili **`VITE_*`** configurano Supabase e il redirect post-conferma email; Vite le espone al client (`import.meta.env`).

| Variabile | Obbligo | Ruolo |
|-----------|---------|--------|
| `VITE_SUPABASE_URL` | Se vuoi Postgres | URL del progetto (es. `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Se vuoi Postgres | Chiave **anon** pubblica (Settings → API) |
| `VITE_AUTH_EMAIL_CONFIRMATION` | No | `false` (consigliato per l’evento): nessuna conferma email; in Supabase disattiva **Confirm email** sul provider Email. `true` o omesso: conferma classica (evita rate limit solo se gli utenti non riprovano a raffica). |
| `VITE_AUTH_REDIRECT_URL` | Sì se conferma email attiva | URL base dopo il link di conferma; stesso valore in Supabase → **Redirect URLs**. Con `VITE_AUTH_EMAIL_CONFIRMATION=false` l’app non lo richiede per `signUp`, ma conviene impostarlo comunque per **Site URL** / redirect generici. |

Nel repo è presente **`.env.example`** (senza segreti) come modello. Crea **`.env`** in locale (è in **`.gitignore`**, non va committato):

```bash
cp .env.example .env
```

Poi sostituisci i placeholder con i valori reali e riavvia `npm run dev`.

Se mancano o sono vuote, l’app usa solo **localStorage** (dati “condivisi” limitati al singolo browser, prefisso dedicato negli adapter).

---

## Storage condiviso (multi-dispositivo)

Priorità dell’adapter (`createStorage` in `src/lib/storage.js`):

1. **`window.storage`** — presente in alcuni ambienti tipo artifact; ha priorità se espone `get` / `set`.
2. **Supabase** — se `VITE_SUPABASE_*` sono definite; i valori condivisi stanno nella tabella `bpc_state` creata da `STORAGE_SQL`.
3. **`localStorage`** — fallback; chiavi prefissate per distinguere locale vs condiviso.

### Chiavi logiche

Definite in `src/constants/storageKeys.js`:

| Chiave | Ambito | Contenuto tipico |
|--------|--------|-------------------|
| `bp:user` | **Locale** | Nome utente scelto al picker |
| `bp:doneTasks` | Condiviso | Oggetto `{ [idAttività]: boolean }` |
| `bp:quests` | Condiviso | Array quest (`id`, `title`, `points`, `emoji`, `day`, `audience`) |
| `bp:questCompletions` | Condiviso | `{ [membro]: { [questId]: "friday"|"saturday"|"sunday" } }` |
| `bp:doneMissions` | Condiviso | *(legacy)* migrato verso quest se `bp:quests` assente |
| `bp:itinerary` | Condiviso | Oggetto `{ friday, saturday, sunday }` → array di attività (`id`, `time`, `title`, `desc`, `emoji`) |
| `bp:missions` | Condiviso | *(legacy)* migrato verso `bp:quests` |
| `bp:expenses` | Condiviso | Array di voci spesa |
| `bp:places` | Condiviso | Array di luoghi (`id`, `name`, `type`, `area`, `note`, `emoji`, opz. `mapsUrl`) |
| `bp:messages` | Condiviso | Array di messaggi chat |

Con Supabase, la chiave **`bp:user`** resta gestita in locale dall’adapter (non passa dalla tabella condivisa).

### Configurazione Supabase

1. Crea un progetto su [Supabase](https://supabase.com).
2. Esegui in SQL Editor lo script nella costante **`STORAGE_SQL`** in `src/lib/storage.js` (tabella **`bpc_state`**, prefisso progetto `bpc_`; RLS e policy per `anon`).
3. Imposta **`.env`** come sopra e riavvia `npm run dev`.
4. **Auth evento (P4)** — dopo lo schema base, esegui anche **`STORAGE_SQL_P4`** in `src/lib/storage.js` (membri, RPC `bpc_join_event` / `bpc_admin_set_member`, RLS solo `authenticated` su `bpc_state`). Imposta il segreto organizzatore in SQL su `bpc_app_config.organizer_secret`. Il valore **`groom_display_name`** in `bpc_app_config` deve essere **identico** al **primo** elemento di **`src/data/party-roster.json`** (festeggiato), altrimenti l’iscrizione come festeggiato fallisce. **Conferma email:** in **Authentication → Providers → Email** disattiva **Confirm email** per accesso immediato dopo «Registrati» (adatto a un evento chiuso). Allinea **`.env`**: **`VITE_AUTH_EMAIL_CONFIRMATION=false`** (vedi **`.env.example`**). Se lasci la conferma attiva, imposta **`VITE_AUTH_EMAIL_CONFIRMATION=true`** (o ometti), **`VITE_AUTH_REDIRECT_URL`** e in **Authentication → URL Configuration** allinea **Site URL** e **Redirect URLs** con l’URL pubblico dell’app.
   - **«Email rate limit exceeded»:** è un limite di **Supabase** sulle email inviate (stesso indirizzo o progetto sul piano gratuito). Chi si registra non deve premere più volte «Registrati»; dopo circa **un’ora** il limite si resetta. Come organizzatore: **Authentication → Users** → utente → **⋯** → **Confirm user** per sbloccare senza nuova email. In alternativa, aumentare i limiti passando a un piano a pagamento o usando un **SMTP custom** con quota più alta (Dashboard → Project Settings → Auth).
5. **Realtime (consigliato per sync rapida)** — una tantum:
   - **Dashboard:** Database → **Replication** → abilita la tabella **`bpc_state`** per Realtime, **oppure**
   - **SQL Editor:** esegui l’ultima istruzione già inclusa in fondo a `STORAGE_SQL`:  
     `alter publication supabase_realtime add table public.bpc_state;`  
     (se la tabella è già nella publication, Postgres restituisce errore: va ignorato.)
   - Assicurati che firewall / rete consentano **WebSocket** verso il progetto Supabase.

Senza il passo 5 l’app funziona comunque: resta solo il polling ogni ~3,5 s.

**Nota P4:** con Supabase configurato e **`STORAGE_SQL_P4`** applicato, l’accesso anonimo a `bpc_state` non è più consentito: serve **login** e iscrizione come membro evento. Senza P4 (solo `STORAGE_SQL` classico) resta il flusso precedente con picker nomi e policy `anon`.

**Bootstrap efficiente:** se `bpc_event_members` è **vuota**, il **primo** utente può iscriversi come **Organizzatore** **senza** codice (campo segreto lasciato vuoto). Subito dopo, imposta un vero `organizer_secret` con `update bpc_app_config …`: dal **secondo** organizzatore in poi il codice in app deve coincidere. Se hai già eseguito P4 in passato, rilancia in SQL Editor solo `create or replace function public.bpc_join_event …` dalla costante **`STORAGE_SQL_P4`** nel repo (blocco funzione aggiornato).

**Errore RLS «infinite recursion» su `bpc_event_members`:** esegui lo script **`docs/sql/p4-fix-members-rls-recursion.sql`** (oppure riesegui l’intera costante **`STORAGE_SQL_P4`** aggiornata): le policy non devono fare subquery sulla stessa tabella; si usano funzioni `SECURITY DEFINER` `bpc_current_user_is_member` / `bpc_current_user_is_admin`.

### Sicurezza Supabase (deploy pubblico)

- **Solo `STORAGE_SQL` (pre-P4):** le policy **`anon`** su `bpc_state` permettono lettura/scrittura a chiunque abbia URL e anon key (tipico di un’app statica). Accettabile solo se consapevoli del rischio.
- **Con `STORAGE_SQL_P4`:** i dati condivisi richiedono **Supabase Auth** + riga in **`bpc_event_members`**; il segreto organizzatore resta in **`bpc_app_config`** (non nel client). Riduce molto l’accesso casuale.
- Per esigenze ancora più stringenti: **Edge Function**, **service role** solo server (**mai** in bundle Vite).

Dettagli aggiuntivi e roadmap: **`AGENTS.md`**.

---

## UI e tema (SoliDS)

- Tema **`90s-party`** impostato su `<html>` in `index.html` (`data-theme`).
- **`src/index.css`**: import `@soli92/solids/css/index.css`, poi Tailwind.
- Font display (es. Russo One, VT323) da Google Fonts in `index.html`.
- Migrazione branding FE: `PartyHeader` usa `APP_LOGO_HEADER` (`/soli-logo-4x3-with-text-gold.svg`), mentre i loader usano `APP_LOGO_LOADER` (`/soli-logo-1x1-symbol-only-gold.svg`) tramite `SoliLogoLoader`.
- Temi aggiuntivi supportati da SoliDS 1.12: `ichigo`, `vegeta`, `zoro`, `captain-america`, `sasuke`, `inuyasha` (impostabili via `data-theme` su `<html>`).

---

## Test

```bash
npm test
```

Esegue in sequenza:

1. **Vitest** (`vitest run`) — file in **`vitest.config.js`**: **`usePartyApp`**, **`ExpensesTab`**, **`adminSharedQuadPersist`**, **`solids-package`** (range **`@soli92/solids` ^1.14.1**). Ambiente **happy-dom**; `VITE_SUPABASE_*` vuoti per usare solo localStorage.
2. **Node** (`node tests/app.test.js`) — **20** controlli senza bundler (vedi `tests/app.test.js`).

Il widget meteo in header segue il **giorno selezionato** nei tab Piano e Quest (`activeDay` → **`DAY_CALENDAR_DATE_ISO`** in `src/data/party.js`, allineato alle etichette **`DAYS`**). **Open-Meteo**: previsione giornaliera (`api.open-meteo.com`) per oggi e date future nel range; **`archive-api.open-meteo.com`** per date già passate nel fuso `VENUE_WEATHER.timezone`. Cache in `sessionStorage` ~10 minuti **per data**. Coordinate in **`VENUE_WEATHER`**.

`npm run test:watch` lancia solo Vitest in watch.

Non sono inclusi test **E2E** browser; la logica React resta concentrata in **`usePartyApp.js`** (regressioni parziali via Vitest).

---

## Build e anteprima

```bash
npm run build
npm run preview
```

Output statico in **`dist/`**, adatto a hosting su Netlify, Vercel, S3, ecc. Imposta nel pannello del provider le stesse **`VITE_SUPABASE_URL`** e **`VITE_SUPABASE_ANON_KEY`** usate in locale, poi rilancia la **build**: i valori sono incorporati al momento della compilazione, non a runtime.

---

## Repository e licenza

- **`private: true`** in `package.json` — adatta licenza e visibilità del repo alle tue esigenze.
- Non includere **`.env`** con chiavi reali nel controllo versione; usa **`.env.example`** come riferimento condiviso.

---

## Riferimenti rapidi

| Argomento | Dove approfondire |
|-----------|-------------------|
| Mappa funzionalità → file | [`AGENTS.md`](./AGENTS.md) |
| SQL e adapter storage | `src/lib/storage.js` |
| Dati statici weekend | `src/data/party.js` + roster in `src/data/party-roster.json` |
| Quest, punteggi, badge | `src/domain/questScoring.js`, `src/constants/questBadges.js`, tab **Quest** |
| Roadmap (P3 nice-to-have; **P4** identità e ruoli) | [`AGENTS.md`](./AGENTS.md) sezione Roadmap |
