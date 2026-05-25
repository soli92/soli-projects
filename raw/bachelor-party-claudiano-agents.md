# AGENTS.md — contesto per assistenti AI

Riassunto operativo per **bachelor-party-claudiano** (Vite + React, storage condiviso). Dettaglio setup: **`README.md`**. Stato working tree: **`git status`**. Memoria sviluppo AI-assisted: **`AI_LOG.md`**.

**Aggiornato:** 2026-04-29

---

## Stack

| Area | Tecnologia |
|------|------------|
| Build | **Vite 5** |
| UI | **React 18**, **Tailwind 3** |
| Design system | **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids) ^1.14.1** — tema default **`90s-party`** su `<html>` in `index.html`; **Google Fonts** (bundle SoliDS) in `index.html` |
| Branding FE | Logo header + loader da asset SoliDS esportati in `public/` (`soli-logo-4x3-with-text-gold.svg`, `soli-logo-1x1-symbol-only-gold.svg`) |
| Persistenza | `src/lib/storage.js`: `window.storage` (artifact) → **Supabase** (`bpc_state`, env `VITE_SUPABASE_*`) → `localStorage` |

---

## Stato progetto (refactor completato)

Monolite `bachelor-party-claudiano.jsx` **rimosso**. Entry: `src/main.jsx` → `src/App.jsx`.

### Layout cartelle `src/`

```
src/
├── App.jsx                 # Composizione schermate e tab
├── main.jsx
├── index.css               # Tailwind + import SoliDS
├── constants/
│   ├── storageKeys.js      # Chiavi bp:* (single source)
│   └── questBadges.js      # Soglie badge fine weekend
├── data/
│   ├── party-roster.json   # Lista partecipanti configurabile (festeggiato = primo)
│   ├── party.js            # Itinerario, `DAY_CALENDAR_DATE_ISO`, `VENUE_WEATHER`, `PARTY_QUEST_FINALE_AFTER_ISO`; MEMBERS da roster
│   └── navigation.js       # MAIN_TABS, isValidTabId, readTabFromSearch, replaceTabInUrl
├── domain/
│   ├── balances.js         # computeBalances, computeSettlements (regolazione bonifici)
│   ├── missions.js         # (legacy) helper su lista semplice
│   ├── questScoring.js     # punti per giorno, `leaderboardRowsDetailed`, badge, `questAppliesToMember`
│   ├── partyContent.js     # normalizeItinerary, normalizeQuests, migrazione mission→quest
│   └── places.js           # PLACE_TYPES, emojiForPlaceType, mapsLinkForPlace
├── hooks/
│   ├── usePartyApp.js      # Stato globale app, sync, azioni, derived state
│   └── useVenueWeather.js  # Meteo giornaliero per `activeDay` + `DAY_CALENDAR_DATE_ISO`
├── lib/
│   ├── resolvePartyRoster.js # validazione party-roster.json → MEMBERS / colori
│   ├── eventAuth.js        # P4: fetchMyMember, fetchAllMembers; rosterNamesFromEventMemberRows
│   ├── expenseExport.js    # buildExpensesCsv, buildExpensesReportText, download CSV
│   ├── storage.js          # createStorage, STORAGE_SQL, getSupabaseClient, usesSupabaseSharedStorage
│   ├── bpStateRealtime.js  # subscribe postgres_changes su public.bpc_state
│   ├── imageCompress.js    # immagini chat
│   ├── chatAttachmentLimits.js # tipo MIME + max size prima compress
│   ├── authEmailConfig.js # VITE_AUTH_EMAIL_CONFIRMATION (allineare a Supabase)
│   ├── authFlowMessages.js # errori Auth leggibili (rate limit email)
│   ├── weatherOpenMeteo.js # daily forecast/archive + mapping WMO → IT
│   └── formatTime.js       # orario messaggi (it-IT)
├── styles/
│   └── party-app.css       # Classi layout (.app, .hdr, .tabs, .chat-*, …)
└── components/organisms/
    ├── UserPickerScreen.jsx
    ├── PartyHeader.jsx
    ├── VenueWeatherStrip.jsx # Open-Meteo sotto titolo
    ├── PartyTabNav.jsx
    ├── SyncStatusBar.jsx
    ├── GlobalLoader.jsx    # bootstrap sessione + primo sync Supabase
    ├── AppToast.jsx
    ├── ItineraryTab.jsx
    ├── QuestTab.jsx
    ├── AdminQuestSection.jsx
    ├── ExpensesTab.jsx
    ├── PlacesTab.jsx
    ├── ChatTab.jsx
    └── AdminTab.jsx
```

### Test

- **`npm test`** = `vitest run` poi `node tests/app.test.js` (vedi **`README.md` → Test**).
- **`tests/app.test.js`** — Node (**20** casi): include **`parseOpenMeteoDailyDay`** (`weatherOpenMeteo.js`).
- **Vitest** (**9** casi): **`tests/usePartyApp.test.jsx`**, **`tests/ExpensesTab.test.jsx`**, **`tests/adminSharedQuadPersist.test.js`** + Testing Library + **happy-dom** (`vitest.config.js`; `VITE_SUPABASE_*` vuoti). Ricarica modulo con `vi.resetModules()` tra i casi sull’hook.

---

## Mappa funzionalità → codice

Usare questa tabella per modifiche mirate; il dettaglio comportamentale è in **`## Analisi funzionale (sintesi)`** sotto.

| Funzionalità | UI | Stato / azioni | Persistenza | Note |
|--------------|-----|----------------|-------------|------|
| Scelta utente | `UserPickerScreen` | `pickUser` (testo + validazione), `logout` | `bp:user` locale; **`bp:rosterMembers` shared** (lista nomi, festeggiato sempre primo) | Nome libero: se già presente (case-insensitive) si riusa; altrimenti si aggiunge. Colori extra: `buildMemberColors` in `partyRoster.js` |
| Navigazione tab | `PartyTabNav` | `tab`, `selectTab`, `unread` | — | Badge chat se tab ≠ chat e arrivano messaggi |
| Meteo | `VenueWeatherStrip` | `useVenueWeather(activeDay)` | — | Data da `DAY_CALENDAR_DATE_ISO[activeDay]`; Open-Meteo forecast vs archive; `VENUE_WEATHER` |
| Itinerario | `ItineraryTab` | `activeDay`, `doneTasks`, `toggleTask` | `doneTasks` **shared** | Dati statici: `DEFAULT_ITINERARY`, `DAYS` in `data/party.js` |
| Quest | `QuestTab` + `AdminQuestSection` | `quests`, `questCompletions`, `toggleQuest`, `addQuest` / `updateQuest` (audience + `assignee`), podio gruppo, badge; chip «Chi stai spuntando» solo se ≥2 nel roster | `bp:quests`, `bp:questCompletions` **shared** | Podio e chip sul roster effettivo; con P4 sync `bp:rosterMembers` ↔ `bpc_event_members` (`usePartyApp` + `visibilitychange`); `questScoring.js` + `PARTY_QUEST_FINALE_AFTER_ISO`; migrazione da `bp:missions` |
| Admin P4 | `AdminTab` | membri + quest (sopra) | RPC / `bpc_state` | Solo `EVENT_ROLES.admin` |
| Spese | `ExpensesTab` | `addExpense`, edit/delete, split, **Saldi** + **Chi deve a chi** (`settlements`) | `expenses` **shared** | `?tab=expenses`; `computeBalances` + `computeSettlements` |
| Luoghi | `PlacesTab` | `addPlace` (nuovo/modifica), `beginEditPlace`, `cancelEditPlace`, `deletePlace`, `movePlace`, `openAddPlaceForm`, link Maps | `places` **shared** | Campo opzionale `mapsUrl`; ordine array persistito |
| Chat | `ChatTab` | `messages`, `chatInput`, `chatImg`, `sendMessage`, `handleFile` | `messages` **shared** | Con Supabase+Realtime: push su `bpc_state`; altrimenti poll ~3.5s; compress in `lib/imageCompress.js` |

Tutto lo stato condiviso e le azioni che scrivono backend passano da **`usePartyApp`** e **`sset`/`sget`** in `usePartyApp.js`.

---

## Analisi funzionale (sintesi)

1. **Onboarding / identità** — L’utente sceglie un nome tra `MEMBERS` (lista in `data/party-roster.json`, risolta in `party.js`). Salva su storage locale; imposta anche `expForm.paidBy` al pick. Logout cancella solo l’utente locale (non i dati gruppo).

2. **Itinerario** — Tre giorni, dati in `bp:itinerary` (default `DEFAULT_ITINERARY`); CRUD attività per giorno, riordino; toggle `doneTasks` su `bp:doneTasks`. Realtime/poll allineano itinerario e prune chiavi `done*` obsolete.

3. **Quest** — Lista in `bp:quests` (default `DEFAULT_QUESTS` in `party.js`: m1–m8 festeggiato per giorno + p1–p3 gruppo). Campi `audience` (`groom` | `all` | `member`) e, per `member`, `assignee` = nome roster esatto. Completamenti per membro in `bp:questCompletions` (giorno = colonna punteggio). Podio di gruppo da `leaderboardRowsDetailed` + badge migliore (`topBadgeTier`); dopo `PARTY_QUEST_FINALE_AFTER_ISO` l’UI usa titolo “Podio finale”. Con P4, il roster condiviso si allinea a `bpc_event_members` (`fetchAllMembers` + `rosterNamesFromEventMemberRows` in `eventAuth.js`) dopo il primo sync e al ritorno in tab. CRUD: `AdminQuestSection` (P4) o blocco in `QuestTab` se `!needsEventAuth`. Migrazione automatica da `bp:missions`/`doneMissions` se `bp:quests` vuoto. Rinomina roster: aggiornare manualmente `assignee` sulle quest `member` se serve.

4. **Spese** — Form (descrizione, importo, pagatore, chip “dividi con”). Aggiunta voce calcola `perPerson`. Lista voci; saldi netti da `computeBalances`; sotto, **Chi deve a chi** da `computeSettlements` (greedy, al massimo *n*−1 bonifici, stessi filtri sulle voci). **Export:** copia testo report, scarica CSV, opz. Web Share (`expenseExport.js`).

5. **Luoghi** — Lista posti (default + aggiunti). Form modale inline per nuovo posto (nome, tipo, zona, note); emoji da tipo.

6. **Chat** — Messaggi testo + immagine opzionale; scroll in fondo su tab attivo; allineamento `messages` da poll o da Realtime (`mergeMessagesFromServer`); messaggi nuovi mentre non sei su chat incrementano `unread` e badge.

7. **Sincronizzazione** — Con Supabase e tabella `bpc_state` in `supabase_realtime`, `subscribeBpStateRealtime` aggiorna le chiavi shared su evento; poll ~45 s come rete di sicurezza. Senza Realtime (o senza Supabase): `setInterval` ~3500 ms. Sovrascrive stato React con valori server (ultimo writer vince).

---

## Casi limite e comportamenti noti

Riferimento codice: `usePartyApp.js`, `lib/storage.js`, `domain/balances.js`.

### Storage e ambiente

- **Priorità adapter** (`createStorage`): se esiste `window.storage` con API get/set → si usa quello; altrimenti se `VITE_SUPABASE_*` è valorizzato → client Supabase (shared su tabella `bpc_state`, chiavi JSON come `bp:doneTasks`); altrimenti solo **localStorage** tramite `localAdapter` (chiavi prefissate `bp:local:` / `bp:shared:` + chiave completa).
- **Senza Supabase né artifact**: i dati “shared” restano sul **solo browser** (prefisso `shared` in localStorage), non tra dispositivi diversi.
- **Chiave utente**: con Supabase, `bp:user` resta **sempre** su `localAdapter` (non viene letto/scritto su Postgres); solo le altre chiavi condivise usano il backend quando configurato.
- **Errori in lettura**: `windowStorageAdapter` in catch ritorna ancora `null` (nessuna eccezione). **Supabase** `get` con `error` dalla query **propaga** l’eccezione → il poll marca sync non sana (`SyncStatusBar`). Il polling applica comunque `if (dt) setDoneTasks(dt)` solo su successo: un batch fallito non azzera lo stato locale.
- **Scrittura**: `set` su **localStorage** / **window.storage** / **Supabase** in caso di errore **propaga** l’eccezione (es. fallimento upsert Supabase, quota locale); `sendMessage` fa rollback ottimistico del messaggio se `set` fallisce.

### Spese (`addExpense`)

- **Validazione**: descrizione e importo **trimmati**; importo con `,` decimale accettato; richiesto numero **finito e > 0**; `splitWith` non vuoto.
- **Split**: l’ultimo chip selezionato non si può deselezionare (`toggleSplit` + UI disabilitata sul chip unico).
- **`computeBalances` / lista UI**: voci con importo non valido, split vuoto, `paidBy` non in `MEMBERS` o partecipanti allo split fuori lista vengono **ignorate** nei saldi; in lista spese importi non numerici mostrano **—**.

### Luoghi (`addPlace`)

- **Nome obbligatorio** (trim): vuoto → nessun effetto; area e note salvate trimmate.
- **ID**: `id: "c" + Date.now()` — collisione estremamente improbabile; stesso schema per messaggi/spese con `Date.now()`.

### Chat

- **Invio**: `sendLockRef` + `sending`; `flushSync` + `await sset` prima di svuotare input; doppio invio bloccato durante la persistenza; fallimento `set` → rimozione del messaggio ottimistico e input **non** svuotato.
- **Immagine**: `compressImage` rifiuta la promise su errore; `handleFile` in `catch` non imposta anteprima e resetta l’input file.
- **Unread**: se la lista messaggi dal server **si accorcia** mentre non sei sul tab chat, `unread` viene ridotto al massimo di `prev.length - ms.length` (non resta gonfiato dopo cancellazioni lato storage).

### Saldi (`computeBalances` / `computeSettlements`)

- Solo spese valide (importo > 0, split non vuoto, pagatore e partecipanti allo split in `members`); `perPerson` ricalcolato da `amount / split.length` se mancante o non finito.
- **`computeSettlements`**: dagli stessi saldi netti produce `{ from, to, amount }[]` con algoritmo greedy su debitori/creditori (ordinamento deterministico per importo e nome). Solo derivazione per UI in `ExpensesTab`.

### Roster P4 vs `bp:rosterMembers`

Dopo il primo sync condiviso, se i nomi da `bpc_event_members` (via `fetchAllMembers` + `rosterNamesFromEventMemberRows`) non coincidono con `bp:rosterMembers`, l’hook riscrive il roster shared e riconcilia spese/quest/completamenti. Stesso controllo su `visibilitychange` (ritorno in tab).

### Auth email (Supabase)

**`VITE_AUTH_EMAIL_CONFIRMATION=false`** in `.env` + **Confirm email** disattivato in Dashboard → Email: registrazione senza link in posta (`authEmailConfig.js`, `usePartyApp` → `signUp`). Con conferma attiva serve redirect URL e variabile `true` (o omessa).

Messaggio **«Email rate limit exceeded»**: limite invii email di conferma. Testo in `authFlowMessages.js`; **Confirm user** da Dashboard → Users. Vedi **README**.

### Concorrenza e polling

- Nessun merge: ogni sync sostituisce array/mappe intere. Due utenti che modificano la stessa risorsa in parallelo: vince l’ultima scrittura persistita al prossimo `get` o evento Realtime.
- **Strict Mode (dev)**: doppio mount degli effect in React 18 può avviare due interval di sync e subscribe/cleanup in rapida successione; in produzione un solo mount.

---

## Roadmap e priorità

Ordine consigliato: **P0 → P1 → P2 → P3** (incrementali), poi **P4** (cambiamento architetturale su identità e Supabase). Criteri: impatto sull’uso durante il weekend, sforzo, dipendenze (es. export e polish prima di introdurre auth).

### P0 — Da fare prima (friction quotidiana, basso/medio sforzo)

**Stato:** implementato (toast, errori form spese, barra sync, rollback + toast su scritture fallite; lettura Supabase in errore ora **lancia** così il poll può segnare sync non sana).

| # | Voce | Perché |
|---|------|--------|
| 1 | **Feedback esplicito su errori** — `AppToast` su chat, spese, luoghi, itinerario, missioni, profilo; immagine chat | Rollback visibile + messaggio azionabile. |
| 2 | **Feedback su spesa non valida** — `expenseFormError` sotto il form + clear su edit | Niente no-op silenzioso. |
| 3 | **Stato sync / rete** — `SyncStatusBar` (offline / errore poll / ok) + `online` da `navigator` | Allineamento atteso tra dispositivi. |

### P1 — Alto valore per il gruppo (medio sforzo)

**Stato:** implementato — CRUD spese (modifica inline form + elimina con `confirm`), `?tab=` letto al boot e aggiornato con `replaceState` su cambio tab (`data/navigation.js`), sezione **Sicurezza Supabase** in `README.md`.

| # | Voce | Note |
|---|------|------|
| 4 | **Modifica ed eliminazione spese** | `beginEditExpense` / `cancelEditExpense` / `deleteExpense`; rollback + toast su errore `sset`. |
| 5 | **Deep link tab** | Valori: `itinerary` · `missions` · `expenses` · `places` · `chat`. |
| 6 | **Sicurezza deploy** | Documentazione RLS anon e mitigazioni in README. |

### P2 — Miglioramenti UX / produttività

**Stato:** **completata** (voci 7–11). Realtime: `bpStateRealtime.js` + effect in `usePartyApp`; replication su `public.bpc_state` (vedi `STORAGE_SQL` / README). Modello **`.env.example`** in root per le variabili Supabase.

| # | Voce | Note |
|---|------|------|
| 7 | **Luoghi: modifica, eliminazione, ordinamento** | `beginEditPlace`, `cancelEditPlace`, `deletePlace`, `movePlace` (↑↓); `openAddPlaceForm`. |
| 8 | **Link Maps** | `mapsLinkForPlace` in `domain/places.js`: URL opzionale `mapsUrl` sul posto, altrimenti ricerca Google (nome + zona + Barcellona). |
| 9 | **Sync Realtime (tutte le chiavi shared)** | `postgres_changes` su `public.bpc_state`; poll lento come fallback; senza replication su Supabase resta solo poll ~3,5s. |
| 10 | **Limite file chat** | `lib/chatAttachmentLimits.js` — solo `image/*`, max **8 MB** prima della compressione. |
| 11 | **Accessibilità tab** | `role="tablist"` / `tab`, `aria-selected`, `tabIndex` roving, frecce ←→; contenuto in `role="tabpanel"` con `aria-labelledby`. |

### P3 — Lungo termine / nice-to-have

**Prossimo passo consigliato (breve):** estendere Vitest (chat, luoghi, auth mock) o rifiniture UX mirate. **P4** in produzione: SQL + `party-roster` / `groom_display_name`.

#### Backlog (bassa priorità — “stack” dopo)

| Id | Voce | Note |
|----|------|------|
| B1 | **Label giorni / date** (`DAYS` in `party.js`) | Date o copy weekend da config / env senza toccare il codice. |
| B2 | **Refine brand / altri device** | **Splash:** `splash-*.svg` + `npm run splash` → manifest `screenshots` + `apple-splash-*.png` / link in `index.html`. Aggiungere risoluzioni in `scripts/rasterize-splash.mjs` se serve. |
| B3 | **Skeleton / lazy** liste molto lunghe | Chat o spese con centinaia di righe; oggi scroll pieno. |
| B4 | **Micro-interazioni extra** | Oltre a transizioni tab/card attuali (`party-app.css`). |

| # | Voce | Perché |
|---|------|--------|
| 12 | **Saldi: “chi deve a chi”** | **Fatto:** `computeSettlements` + sezione in `ExpensesTab`. |
| 13 | **Export spese** (CSV / condividi testo) | **Fatto:** `lib/expenseExport.js` + pulsanti in `ExpensesTab` (copia report, CSV, Web Share se disponibile). |
| 14 | **Itinerario e quest editabili da UI** | **Fatto:** `bp:itinerary` + `ItineraryTab`; **`bp:quests`** / **`bp:questCompletions`** + `QuestTab` / `AdminQuestSection`; audience `member` + `assignee`, podio gruppo (`leaderboardRowsDetailed`), `PARTY_QUEST_FINALE_AFTER_ISO`; scoring giornaliero e badge; migrazione da chiavi missioni legacy. |
| 15 | **PWA** (manifest, service worker, icon) | **Fatto:** `vite-plugin-pwa` (generateSW, autoUpdate), icone (`npm run icons`), splash/screenshot (`npm run splash` → manifest `screenshots`, `apple-touch-startup-image`), `registerSW` in `main.jsx`. |
| 16 | **Test React** (Vitest + Testing Library) su `usePartyApp` e form critici | **Base:** `usePartyApp.test.jsx` (pickUser, addExpense, split, tab) + `ExpensesTab.test.jsx` (anteprima split, errore form). |
| 17 | **Virtualizzazione lista chat** se i messaggi crescono molto | Performance; solo se necessario. |

### P4 — Identità evento: registrazione blanda e ruoli

**Stato implementazione (codice):** flusso **email + password** (Supabase Auth), onboarding ruolo + nome da lista `MEMBERS`, tab **Admin** per modificare membri, badge header per organizzatore/festeggiato. SQL: **`STORAGE_SQL_P4`** in `src/lib/storage.js` (da eseguire dopo `STORAGE_SQL` se si vuole P4). Senza P4 su DB, con `.env` Supabase l’app richiede comunque login ma le query falliscono finché non ci sono tabella/RPC/policy — in quel caso o esegui P4 o rimuovi temporaneamente `.env` per usare solo localStorage.

**Obiettivo:** ogni partecipante accede con **proprie credenziali** (registrazione **blanda** / a basso attrito: oggi **email + password**; magic link / inviti restano miglioramenti futuri), senza restare sul solo picker anonimo quando Supabase è attivo e P4 è migrato.

**Ruoli in fase di registrazione (e permessi):**

| Ruolo | Scopo | UI / prodotto |
|-------|--------|----------------|
| **Admin** | Gestione emergenze e anagrafica | Schermata o sezione **amministrazione**: modificare dati profilo partecipanti, sblocchi, (opz.) riassegnazioni; azioni chiaramente separate dal flusso “giornaliero” weekend. |
| **Claudiano** | Festeggiato | Profilo distinto (badge, copy, eventuali permessi mirati es. evidenza in header/chat) rispetto al partecipante standard. |
| **Partecipante** | Membro del gruppo | Accesso ai dati condivisi del weekend (itinerario, spese, chat, …) con permessi **non** admin. |

**Implicazioni tecniche (da definire in fase di implementazione):**

- **Supabase Auth** (`authenticated`) + tabella (o metadati) **membership evento** con campo `role` ∈ `{ admin, groom, participant }` (nomi interni inglesi ok in DB; label UI in italiano).
- **RLS** che **sostituisce o affianca** le policy `anon` attuali su `bpc_state`: niente scrittura anonima illimitata in produzione una volta attivato P4; **service role solo server-side**, mai nel bundle Vite.
- Flusso **onboarding**: collegare utente auth a un “partecipante evento” (display name, avatar opzionale, mapping da invito o da lista pre-caricata admin).
- Coerenza con **Realtime** e chiavi `bp:*` (chi legge/scrive cosa in base al ruolo).

| # | Voce | Note |
|---|------|------|
| 18 | **Registrazione / login blando** | **Fatto (base):** `EventSignInScreen` + sessione Supabase; conferma email configurabile in dashboard. |
| 19 | **Modello dati ruoli + membership** | **Fatto:** `bpc_event_members` + RPC `bpc_join_event` (un solo groom, admin con segreto DB). |
| 20 | **UI Admin** | **Fatto (base):** tab `Admin` (`AdminTab.jsx`), RPC `bpc_admin_set_member`. |
| 21 | **UI Claudiano vs Partecipante** | **Parziale:** badge 👑 / “Organizzatore” in header; permessi funzionali da estendere se serve. |
| 22 | **Migrazione sicurezza** | **Manuale:** eseguire `STORAGE_SQL_P4`; dati preesistenti con anon richiedono re-login membri. |

### Cosa non priorizziamo (per ora)

- **OAuth enterprise / 2FA obbligatorio** — fuori scope per un evento chiuso; **P4** copre auth **leggera**; rivalutare se l’app diventa molto pubblica.
- **Prove quest** (foto obbligate): cambia il modello prodotto; dopo stabilizzazione P3–P4.

---

## Checklist operativa

1. **Supabase** — SQL in costante `STORAGE_SQL` in `src/lib/storage.js` (tabella **`bpc_state`**). **`.env`** da **`.env.example`**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, **`VITE_AUTH_REDIRECT_URL`** (redirect conferma email; vedi README). Realtime: abilita **`bpc_state`** in Replication oppure `alter publication supabase_realtime add table public.bpc_state;`.
2. **Dev** — `npm install`, `npm run dev`.
3. **Test** — `npm test` (Vitest 9 casi + Node 20 casi; vedi README sezione Test).
4. **Build** — `npm run build`, `npm run preview`.
5. **Deploy** — push su **`main`** → deploy automatico in **produzione** (hosting collegato al repo GitHub; vedi README sezione Deploy). Controllare esito sul provider dopo il push.

## Comandi

`npm run dev` · `npm run build` · `npm run preview` · `npm test` · `npm run test:watch`

### Integrazione Soli Prof (RAG / webhook)

Questo repository è in **`CORPUS_REPOS`** su [soli-prof](https://github.com/soli92/soli-prof) (`lib/rag-service/config.ts`). Un webhook GitHub su **`push`** verso `https://soli-prof.vercel.app/api/webhooks/github` può attivare **re-ingest** (HMAC; segreto solo lato Soli Prof / GitHub). I test e i comandi locali del repo **non** dipendono da quel canale. Dettagli: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

## Regole per l’agente

- Non committare `.env` con chiavi reali; mantenere **`.env.example`** allineato a `VITE_SUPABASE_*` e `VITE_AUTH_REDIRECT_URL`.
- Tabella Postgres condivisa: **`bpc_state`** (costante in `storage.js` + `STORAGE_SQL` + `bpStateRealtime.js`).
- Non rompere la priorità storage (artifact → Supabase → localStorage).
- Modifiche UI per tab: preferire `components/organisms/*Tab.jsx`; logica condivisa e I/O storage in `usePartyApp.js` o `lib/storage.js`.
- Chiavi quest: **`bp:quests`** e **`bp:questCompletions`** in `STORAGE_KEYS`; realtime/poll in `usePartyApp` devono restare allineati a `bpStateRealtime.js` (stesso meccanismo delle altre chiavi `bp:*` su `bpc_state`).
- Roster: **`bp:rosterMembers`** (shared) + login/onboarding; **admin rename**: `persistSharedQuadState` (`lib/adminSharedQuadPersist.js`) legge snapshot dei 4 key, salva con retry e ripristina tutto lo snapshot se un tentativo fallisce; se dopo i tentativi resta fallito → **rollback** `adminSetMember` al nome/ruolo precedenti; se anche il rollback fallisce → **`pendingAdminSharedSync`** in `localStorage` + banner **Riprova sync** in `AdminTab`. Migrazione nomi: `domain/memberDisplayRename.js`.
- Lavori su **P4 (auth / ruoli)**: aggiornare `STORAGE_SQL`, RLS e documentazione sicurezza in blocco; non mischiare policy `anon` aperte e utenti autenticati senza piano esplicito.

## Known edge cases & gotchas

- **RLS membri: evitare self-reference ricorsiva**: una policy RLS su `bpc_event_members` che si auto-referenzia può innescare comportamento ricorsivo e bloccare flussi operativi. La fix documentata riscrive la policy senza self-reference (fix `02e66f4`; vedi AI_LOG Fase 3).
- **Schema roster/PostgREST da tenere allineato**: mismatch tra chiavi/aspettative su `bp:rosterMembers` e righe `bpc_event_members` può portare a query che falliscono senza segnali evidenti lato UX. Mantieni in sync schema DB, query e normalizzazione roster (fix `51e0b7d`, `de70b0e`; vedi AI_LOG Fase 4).
- **Scroll app: troppi wrapper con `overflow: hidden` rompono input touchpad**: su mobile/desktop il layering di container scrollabili può spezzare lo scroll naturale se si applica `overflow: hidden` a più livelli. In caso di regressioni viewport/scrollbar, ricontrolla questa catena prima di toccare la logica tab (fix `988654d`; vedi AI_LOG Fase 4).
