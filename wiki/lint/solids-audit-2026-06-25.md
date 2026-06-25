---
type: audit-report
date: 2026-06-25
subject: "@soli92/solids version conformance"
target_version: "^1.14.1"
---
# Audit @soli92/solids — 2026-06-25

| Repo | Versione dichiarata | Stato | Note |
|------|---------------------|-------|------|
| soli-agent | `^1.14.1` | ✅ conforme | submodule inizializzato + locale |
| soli-dome | `^1.14.1` | ✅ conforme | submodule inizializzato + locale |
| soli-prof | `^1.14.1` | ✅ conforme | submodule inizializzato + locale |
| soli-boy | `^1.14.1` | ✅ conforme | packages/app/package.json |
| soli-dm-fe | `^1.14.1` | ✅ conforme | locale |
| casa-mia-fe | `^1.14.1` | ✅ conforme | locale |
| bachelor-party-claudiano | `^1.14.1` | ✅ conforme | locale |
| soli-platform | assente | ➖ assente | monorepo backend (workspaces: auth, notification, gateway, lib) — nessun pacchetto FE |
| pippify | assente | ➖ assente | app Next.js FE — non usa `@soli92/solids` |
| koollector | assente | ➖ assente | monorepo (api + mobile) — nessun consumer FE web con solids |
| agentic-value-investor-application | assente | ➖ assente | src/frontend (Next.js) presente ma non usa `@soli92/solids` |
| soli-os | assente | ⚠️ N/A | factory/infra repo — nessun package.json |
| soli-multi-agents-factory | assente | ⚠️ N/A | factory/infra repo — nessun package.json |
| solids | N/A | ⚠️ N/A | è la libreria stessa (`@soli92/solids`) |
| soli-dm-be | assente | ⚠️ N/A | backend puro (D&D campaign management API) |
| casa-mia-be | assente | ⚠️ N/A | backend puro (gestione domestica) |
| soli-boy (submodule in projects-repos) | submodule non inizializzato | ⚠️ N/A | directory vuota — usato dal locale |
| soli-os (submodule in projects-repos) | submodule non inizializzato | ⚠️ N/A | directory vuota |
| soli-multi-agents-factory (submodule in projects-repos) | submodule non inizializzato | ⚠️ N/A | directory vuota |
| agentic-value-investor-application (submodule in projects-repos) | submodule non inizializzato | ⚠️ N/A | directory vuota |

## Summary

Totale repo distinti scansionati: 16
Conformi: 7 (soli-agent, soli-dome, soli-prof, soli-boy, soli-dm-fe, casa-mia-fe, bachelor-party-claudiano)
Non conformi: 0
Assenti — FE candidati senza solids (da valutare): 4 (soli-platform, pippify, koollector, agentic-value-investor-application)
N/A (backend/factory/libreria stessa): 5 (soli-os, soli-multi-agents-factory, solids, soli-dm-be, casa-mia-be)

> Nessun repo risulta non conforme. Tutti i consumer FE attivi che usano `@soli92/solids` dichiarano il range `^1.14.1`. I repo FE assenti (pippify, koollector, agentic-value-investor-application) non integrano ancora la design library — da valutare come attività separata se si vuole estendere l'adozione.
