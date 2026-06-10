---
type: source
created: 2026-06-10
updated: 2026-06-10
sources: [soli-boy-agents.md, soli-boy-readme.md]
status: draft
---
# Soli Boy

> Emulatore multipiattaforma (Game Boy/GBC, Game Boy Advance, arcade) distribuito come web app, desktop ed mobile.

## Summary

Soli Boy è un emulatore multipiattaforma per console handheld e arcade, distribuito come web app, desktop (Electron) e mobile (Android/iOS via Capacitor); l'utente carica le proprie ROM ed esegue i giochi, con salvataggi e dati che restano sul dispositivo [^src: raw/soli-boy-readme.md §Soli-boy]. Per vincolo legale non distribuisce né include ROM o BIOS protetti da copyright: l'esecuzione avviene solo su file forniti dall'utente [^src: raw/soli-boy-readme.md §Soli-boy]. Lo stato è "Core web MVP completo + emulazione reale GB/GBA", con WasmBoy (GB/GBC) e mGBA (GBA) verificati in e2e e arcade rinviato [^src: raw/soli-boy-readme.md §Soli-boy]. Oltre a essere l'app, il repo è gestito come Agentic Factory llm-wiki++ v2.19 governata da `PATTERN.md`, con adapter `.claude/` e `.cursor/` [^src: raw/soli-boy-agents.md §CLAUDE.md — soli-boy].

## Stack

| Layer | Tecnologia |
|-------|------------|
| Linguaggio | TypeScript |
| UI | React + design system **`@soli92/solids`** |
| Build | Vite |
| Emulazione | EmulatorJS (core Libretro WASM: Gambatte, mGBA, FBNeo/MAME); WasmBoy (GB/GBC), mGBA (GBA) |
| Storage | IndexedDB (idb) |
| Input | Gamepad API |
| Desktop | Electron |
| Mobile | Capacitor (Android/iOS) |

[^src: raw/soli-boy-readme.md §Stack]

## Key integrations

- **[[solids]]** — l'app è costruita sul design system `@soli92/solids`; i componenti UI (`Player`, `Library`, `FileLoader`, `Settings`, `TouchOverlay`, `PrivacyNotice`, `ThemeSelector`) sono realizzati su solids [^src: raw/soli-boy-readme.md §Applicazione (`packages/app/`)].

## Architettura applicazione

- Il codice vive in `packages/app/` (Vite + React + TypeScript, test con Vitest) [^src: raw/soli-boy-readme.md §Applicazione (`packages/app/`)].
- UI a navigazione a 4 tab (`Play` / `Libreria` / `Impostazioni` / `Info & Privacy`), home emulator-first con viewport di gioco 3:2; i controlli touch (`TouchOverlay`) si adattano a portrait/landscape/fullscreen [^src: raw/soli-boy-readme.md §Applicazione (`packages/app/`)].
- Moduli principali: `src/storage/` (adapter IndexedDB/filesystem + persistenza on-device), `src/core/` (wrapper engine WasmBoy/mGBA + lifecycle), `src/domain/` (riconoscimento piattaforma → core), `src/components/` (UI su solids) [^src: raw/soli-boy-readme.md §Applicazione (`packages/app/`)].

## Factory & layer

- Repo gestito come Agentic Factory llm-wiki++ v2.19; topologia `full-stack-agents` (be/fe/db/qa), code path L5 `./packages/app` (monorepo), VCS/kanban GitHub (`soli92/soli-boy`, push-only mirror) [^src: raw/soli-boy-agents.md §Configurazione].
- Pipeline di correttezza FE attiva: catena di gate opt-in `develop → visual-oracle → ux-ui-review/a11y → functional-oracle → code-review` (Visual Oracle v2.17, A11y + UX/UI v2.18, Functional Oracle EP-018 che esercita il flusso reale caricando una ROM di test) [^src: raw/soli-boy-readme.md §Gestione del progetto (Agentic Factory llm-wiki++ v2.19)].

## Commands

| Comando | Scopo |
|---------|-------|
| `npm install` | Installazione dipendenze (in `packages/app`) |
| `npm run dev` | Dev server |
| `npm test` | Unit/integration test (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Build di produzione |

[^src: raw/soli-boy-readme.md §Applicazione (`packages/app/`)]

## Connections

- Related: [[solids]] — design system `@soli92/solids` su cui è costruita la UI dell'app.

## Open questions

- I sorgenti soli-boy non menzionano integrazione con [[soli-prof]] / `CORPUS_REPOS` né webhook RAG: indicizzazione del repo nel corpus RAG non confermata.
