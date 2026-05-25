---
type: source
created: 2026-05-25
updated: 2026-05-25
sources: [bachelor-party-claudiano-agents.md]
status: draft
---
# Bachelor Party Claudiano

> App collaborativa per un addio al celibato: itinerario, quest, spese condivise, chat e luoghi — sincronizzata in tempo reale via Supabase.

## Summary

Applicazione Vite + React 18 pensata per gestire un weekend tra amici (addio al celibato). Offre itinerario a tre giorni, sistema quest con punteggio e podio, gestione spese con saldi e regolazione debiti, chat con immagini, e mappa luoghi. Lo stato condiviso è persistito su Supabase (`bpc_state`) con Realtime, con fallback su localStorage [^src: raw/bachelor-party-claudiano-agents.md §Stack].

## Stack

| Area | Tecnologia |
|------|------------|
| Build | Vite 5 |
| UI | React 18, Tailwind 3 |
| Design system | [[solids]] `@soli92/solids` ^1.14.1 — tema `90s-party` |
| Persistenza | Supabase (`bpc_state`) → localStorage (fallback) |
| Auth (P4) | Supabase Auth (email + password) |
| PWA | `vite-plugin-pwa` (generateSW, autoUpdate) |
| Test | Vitest + Testing Library (happy-dom), Node test |

[^src: raw/bachelor-party-claudiano-agents.md §Stack]

## Funzionalità principali

- **Itinerario** — tre giorni, CRUD attività, toggle completamento, sync Realtime [^src: raw/bachelor-party-claudiano-agents.md §Analisi funzionale]
- **Quest** — sistema punti per giorno, audience (`groom` / `all` / `member`), podio gruppo, badge finale [^src: raw/bachelor-party-claudiano-agents.md §Analisi funzionale]
- **Spese** — form con split, saldi netti (`computeBalances`), regolazione debiti (`computeSettlements`), export CSV e Web Share [^src: raw/bachelor-party-claudiano-agents.md §Analisi funzionale]
- **Chat** — messaggi testo + immagine, compressione, Realtime o poll ~3.5s [^src: raw/bachelor-party-claudiano-agents.md §Analisi funzionale]
- **Luoghi** — lista posti con CRUD, link Google Maps, emoji per tipo [^src: raw/bachelor-party-claudiano-agents.md §Analisi funzionale]
- **Meteo** — Open-Meteo forecast/archive giornaliero [^src: raw/bachelor-party-claudiano-agents.md §Mappa funzionalità]

## Key integrations

- [[solids]] — design system, tema `90s-party`, font Google Fonts dal bundle SoliDS, branding Soli (logo gold) [^src: raw/bachelor-party-claudiano-agents.md §Stack]
- [[soli-prof]] — repository in `CORPUS_REPOS`; webhook `push` per re-ingest RAG [^src: raw/bachelor-party-claudiano-agents.md §Integrazione Soli Prof]
- **Supabase** — tabella `bpc_state`, Realtime (`postgres_changes`), Auth (P4) con RPC `bpc_join_event` e `bpc_admin_set_member` [^src: raw/bachelor-party-claudiano-agents.md §Checklist operativa]

## Storage: priorità adapter

L'ordine di priorità è: `window.storage` (artifact) → Supabase → localStorage. La chiave `bp:user` resta sempre locale; le altre chiavi shared usano Supabase quando configurato. Nessun merge: ogni sync sostituisce intero (ultimo writer vince) [^src: raw/bachelor-party-claudiano-agents.md §Casi limite e comportamenti noti].

## Roadmap

- **P0–P2**: completati (feedback errori, CRUD spese, deep link tab, Realtime, accessibilità) [^src: raw/bachelor-party-claudiano-agents.md §Roadmap e priorità]
- **P3**: backlog (virtualizzazione chat, label giorni, branding) [^src: raw/bachelor-party-claudiano-agents.md §Roadmap e priorità]
- **P4**: identità evento con ruoli (admin, groom, partecipante) — codice base implementato, SQL da eseguire manualmente [^src: raw/bachelor-party-claudiano-agents.md §P4]

## Commands

`npm run dev` · `npm run build` · `npm run preview` · `npm test` · `npm run test:watch`

## Key files

- `src/App.jsx` — composizione schermate e tab
- `src/hooks/usePartyApp.js` — stato globale, sync, azioni
- `src/lib/storage.js` — adapter storage + `STORAGE_SQL`
- `src/lib/bpStateRealtime.js` — subscribe Realtime Supabase
- `src/domain/balances.js` — `computeBalances`, `computeSettlements`
- `src/domain/questScoring.js` — punteggio, podio, badge
- `src/components/organisms/*Tab.jsx` — UI per ogni tab

## Known edge cases

- RLS su `bpc_event_members`: policy auto-referenziante causa ricorsione [^src: raw/bachelor-party-claudiano-agents.md §Known edge cases]
- Schema roster/PostgREST: mismatch tra `bp:rosterMembers` e `bpc_event_members` causa errori silenziosi [^src: raw/bachelor-party-claudiano-agents.md §Known edge cases]
- Scroll: troppi wrapper `overflow: hidden` rompono touchpad desktop [^src: raw/bachelor-party-claudiano-agents.md §Known edge cases]

## Connections

- Related: [[solids]] — design system e tema `90s-party`
- Related: [[soli-prof]] — indicizzato nel RAG multi-corpus
- Related: [[casa-mia-fe]] — pattern simile (Supabase + WebSocket/Realtime per stato condiviso familiare)
