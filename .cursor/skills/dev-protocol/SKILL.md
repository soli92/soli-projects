# Skill: Dev Protocol

> Adapter Cursor della skill `dev-protocol` definita in PATTERN.md §3 — single source of truth per il Develop (L4 → L5).

Procedura condivisa fra [be-dev](mdc:.cursor/rules/be-dev.mdc), [fe-dev](mdc:.cursor/rules/fe-dev.mdc), [db-dev](mdc:.cursor/rules/db-dev.mdc), [qa-dev](mdc:.cursor/rules/qa-dev.mdc). La specializzazione per layer vive nell'agente; questa skill è la spina dorsale comune. Monorepo: `code_path: "."`.

## Fase 0 — Gate preliminare

Prima di qualsiasi scrittura:

1. Leggi (@-mention) `factory.config.yaml` (root del repo).
2. Verifica:
   - `topology` ammette il tuo layer (con `full-stack-agents` tutti i layer be/fe/db/qa sono ammessi).
   - `routing.<tuo-layer> == agent` (oppure override esplicito via `/dev`).
   - `code_path: "."` valorizzato e accessibile (il monorepo stesso).
3. Leggi il TSK: deve avere `layer: <tuo>`, `consumer: agent`, `status: todo`, dipendenze chiuse. Se manca anche un solo campo o gate, **STOP** e segnala in chat (mai "modalità best-effort").

## Fase 1 — Preparazione contesto

1. Leggi la US riferita dal TSK (path: `EP-XXX-*/US-YYY-*/US-YYY.md`).
2. Leggi l'ADR / sezione di `design_&_architecture/` citato.
3. Apri le pagine `wiki/` citate transitivamente dalla US. Non citarle nel codice — citazione cascade: il codice cita TSK/ADR.
4. Leggi `raw/tech_stack.md` per i vincoli (versioni, standards).
5. Esplora gli artefatti del tuo layer per capire il layout esistente:
   - be-dev → `lib/**`, `app/api/**`, `middleware.ts`, server actions
   - fe-dev → `app/**/*.tsx`, `components/**`
   - db-dev → `sql/**`, schema Supabase `pm_*`
   - qa-dev → `*.test.ts`, `e2e/**`

## Fase 2 — Handoff iniziale

1. Edit del TSK: `status: in-progress`, aggiungi `updated: YYYY-MM-DD HH:MM`.
2. Non toccare il corpo del TSK.

## Fase 3 — Implementazione

1. Implementa secondo: Implementation Steps del TSK (ordine indicativo), Technical Specs del TSK, standards verbatim citati nei raw (PATTERN §11).
2. Atomicità: tutto il cambiamento per **un singolo TSK** è coerente (un commit logico).
3. Se il TSK è **sotto-specificato**:
   - Gap di knowledge base → append `wiki/gaps.md` (vedi [wiki-gap-protocol](mdc:.cursor/skills/wiki-gap-protocol/SKILL.md)).
   - Decisione architetturale mancante → STOP e segnala in chat (`tpm`/`lead-architect` la prenderanno; non improvvisare design).
   - Bug pre-esistente fuori scope → segnala in chat (il TPM aprirà un TSK separato), non fixare opportunisticamente (PATTERN §7 r.8).

## Fase 4 — Definition of Done

Verifica la DoD del TSK punto per punto, usando i comandi reali del progetto:

- [ ] `npm run type-check` verde (TypeScript)
- [ ] `npm run lint` verde
- [ ] `npm test` verde (Vitest, unit/integration relativi)
- [ ] (Se applicabile) `npm run test:e2e` verde (Playwright)
- [ ] Documentazione inline minima dove richiesta
- [ ] Niente file fuori scope toccati (rispetta lo scope di scrittura del tuo ruolo)

Se anche un solo punto fallisce e non è risolvibile nel TSK corrente: rollback delle modifiche (preferibile) o segnala lo stato parziale in chat; Edit `status: in-progress` (NON `done`) e descrivi il blocker.

## Fase 5 — Handoff finale (Develop completato)

1. Edit del TSK: `status: done`, `updated: YYYY-MM-DD HH:MM`.
2. Invoca [dev-handoff](mdc:.cursor/skills/dev-handoff/SKILL.md) per scrivere l'entry su `wiki/log.md`.
3. Invoca [vcs-handoff](mdc:.cursor/skills/vcs-handoff/SKILL.md) per coordinare il commit. VCS del progetto: monorepo, single-committer su main, commit per-task. **Gate umano obbligatorio per ogni `git commit`** (PATTERN §7 r.14); mai push automatici.

## Vincoli inviolabili

- **Mai editare il corpo del TSK** (solo `status:` e `updated:`).
- **Mai scrivere su `wiki/**`** se non append a `wiki/log.md` e `wiki/gaps.md`.
- **Mai scrivere su `design_&_architecture/`** (proprietà di Arch).
- **Mai scrivere su `management/kanban/**`** fuori dal proprio TSK (la generazione TSK è del TPM).
- **Mai inventare** endpoint/server action, tabelle `pm_*`, componenti non specificati nel design.
- **Standards verbatim** (PATTERN §11): se SAML/OIDC/FHIR citati, implementa esattamente quelli.
- **Scope di scrittura chiuso per ruolo** (PATTERN §7): ogni dev-agent scrive solo nei propri artefatti. L1 (raw/) è read-only per tutti i dev-agent.
