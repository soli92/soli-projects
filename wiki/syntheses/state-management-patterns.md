---
type: synthesis
created: 2026-06-25
topic: state-management
sources: [wiki/sources/soli-prof.md, wiki/sources/soli-agent.md, wiki/sources/soli-projects.md, wiki/sources/soli-boy.md, wiki/sources/bachelor-party-claudiano.md, wiki/concepts/supabase-integration.md]
---
# State Management Patterns — Confronto Cross-Repo

## Overview

L'ecosistema soli92 non adotta una libreria di state management globale condivisa. Ogni progetto usa il meccanismo più adatto alla propria architettura: React state/hooks locali per i casi semplici, Redis per lo stato distribuito dei sub-agent in soli-agent, IndexedDB per la persistenza on-device in soli-boy, Supabase Realtime per lo stato condiviso multi-device in bachelor-party-claudiano, e localStorage come fallback universale. La scelta è guidata dall'unità di distribuzione (single-device vs multi-device) e dall'esigenza di persistenza.

## Confronto per repo

| Repo | Meccanismo principale | Persistenza | Note |
|---|---|---|---|
| **soli-agent** | Redis (sub-agent state) + React state (UI) | Redis (sessione agente) | Persistenza orchestrazione sub-agent con coda e timeout; `lib/anthropic-usage.ts` per metriche |
| **soli-prof** | React state locale + SSE buffer | In-memory (sessione) | Chat SSE con NDJSON parser in `components/chat-view.tsx`; sessioni admin in-memory |
| **soli-projects** | Server Components + Supabase (data layer) | Supabase (DB persistente) | Todos/Ideas/Kanban su Supabase; kanban strategico da file `.md`; nessun client state store |
| **bachelor-party-claudiano** | `usePartyApp.js` custom hook + Supabase Realtime | Supabase `bpc_state` → localStorage (fallback) | Ordine priorità: `window.storage` → Supabase → localStorage; sync multi-device; ultimo writer vince |
| **soli-boy** | React state locale + IndexedDB (`idb`) | IndexedDB on-device | ROM, salvataggi, preferenze tutti locali; `src/storage/` adapter IndexedDB/filesystem |
| **soli-dome** | Dati statici (`src/data/apps.ts`) | Nessuna | Catalogo app come configurazione statica; nessuno stato runtime |

[^src: wiki/sources/soli-agent.md §Summary — Redis per stato sub-agent, coda e timeout]
[^src: wiki/sources/soli-prof.md §Key files — `lib/admin-session.ts` sessioni in-memory; `components/chat-view.tsx` SSE buffer + NDJSON]
[^src: wiki/sources/soli-projects.md §Stack — Supabase data layer; §Key files — `lib/data/`, `lib/actions/`]
[^src: wiki/sources/bachelor-party-claudiano.md §Storage: priorità adapter — window.storage → Supabase → localStorage]
[^src: wiki/sources/soli-boy.md §Architettura — `src/storage/` adapter IndexedDB/filesystem + persistenza on-device]
[^src: wiki/sources/soli-dome.md §Key files — `src/data/apps.ts`]

## Pattern emergenti

### 1. React state locale per app a sessione singola
I progetti senza requisiti di persistenza cross-sessione o multi-device (soli-prof chat, soli-dome) usano React state/hooks nativo. Nessun Redux, Zustand o libreria dedicata. Questo è il default per app SSE/streaming dove lo stato è effimero per design.
[^src: wiki/sources/soli-prof.md §Key files — `components/chat-view.tsx` client chat con SSE buffer + NDJSON parser]

### 2. Redis per stato distribuito di agent runtime
soli-agent usa Redis per persistere lo stato dei sub-agent paralleli (ruoli, coda, timeout). È l'unico progetto con un backend stateful esplicito per l'orchestrazione. Questo pattern isola la logica di coordinamento dall'UI.
[^src: wiki/sources/soli-agent.md §Summary — sub-agent paralleli con ruoli specializzati, orchestrazione con coda e timeout, persistenza su Redis]

### 3. IndexedDB per app on-device
soli-boy centralizza tutta la persistenza su IndexedDB (libreria `idb`): ROM caricate dall'utente, salvataggi di gioco, preferenze. Nessun server coinvolto — vincolo progettuale per rispettare copyright ROM. Questo pattern è ideale per app offline-first.
[^src: wiki/sources/soli-boy.md §Architettura — `src/storage/` adapter IndexedDB/filesystem + persistenza on-device]
[^src: wiki/sources/soli-boy.md §Stack — Storage: IndexedDB (idb)]

### 4. Supabase Realtime per stato condiviso multi-device
bachelor-party-claudiano usa la tabella `bpc_state` con Realtime (`postgres_changes`) per sincronizzare lo stato tra i dispositivi degli utenti. LocalStorage è il fallback quando Supabase non è configurato. La semantica è "ultimo writer vince" senza merge. La chiave `bp:user` è sempre locale.
[^src: wiki/sources/bachelor-party-claudiano.md §Storage: priorità adapter — nessun merge: ogni sync sostituisce intero (ultimo writer vince)]
[^src: wiki/concepts/supabase-integration.md §Key points — Realtime: bachelor-party-claudiano attiva postgres_changes su bpc_state per sync multi-device; poll lento come fallback]

### 5. Server Components + data layer per app Next.js complesse
soli-projects sfrutta i Server Components di Next.js (App Router) come meccanismo principale: lo stato UI è minimale, i dati vengono letti direttamente da Supabase in fase di rendering server-side. Le mutazioni passano da Server Actions. Nessun client state store globale (no Zustand/Redux).
[^src: wiki/sources/soli-projects.md §Key files — `lib/data/` Supabase data layer; `lib/actions/` Server actions]

### 6. Stato kanban da filesystem (soli-projects)
I task strategici in soli-projects sono letti dal filesystem (`management/kanban/` `.md` files) tramite `lib/kanban/reader.ts`. Le mutazioni avvengono via Server Actions che scrivono file. Questo rende il kanban versionabile via git.
[^src: wiki/sources/soli-projects.md §Key files — `lib/kanban/reader.ts` Kanban file parser (EP/US/TSK); `lib/actions/kanban.ts` Server actions for kanban CRUD]

## Raccomandazione

- **App single-page senza requisiti di persistenza cross-sessione**: React state locale (hook). Zero overhead, zero dipendenze aggiuntive.
- **App con persistenza on-device e vincoli di privacy/offline**: IndexedDB (`idb`). Pattern di soli-boy valido per qualsiasi app che non deve inviare dati a un server.
- **App multi-utente con stato condiviso in tempo reale**: Supabase Realtime (`postgres_changes`). Attenzione alla semantica "ultimo writer vince" — non adatta a strutture dati concorrenti complesse.
- **App Next.js con data layer complesso**: Server Components + Server Actions + Supabase. Evitare client state store globali finché non strettamente necessario.
- **Orchestrazione agenti distribuiti**: Redis per coda, ruoli e timeout. Unico pattern che scala per concorrenza reale.

> ℹ️ Informazione non disponibile nelle sorgenti attuali — da aggiungere al prossimo ingest: pattern di state management di casa-mia-fe/be, koollector (GraphQL + Expo), soli-platform (monorepo servizi).

## Riferimenti

- [[supabase-integration]] — Realtime postgres_changes, shared project, bpc_state
- [[rag-pipeline]] — pipeline stateless (query/ingest senza stato persistente lato client)
- [[soli-agent]] — Redis per orchestrazione sub-agent
- [[bachelor-party-claudiano]] — usePartyApp hook + Supabase Realtime + localStorage fallback
- [[soli-boy]] — IndexedDB adapter on-device
