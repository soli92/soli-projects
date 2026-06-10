# Skill: Tech Scout

> Adapter Cursor della skill `tech-scout` definita in PATTERN.md §14 — proposta automatica di stack tecnologico (`stack_mode: auto`).

Invocata quando `factory.config.yaml` ha `stack_mode: auto`, o on-demand quando si vuole ri-valutare lo stack a metà progetto.

**Output**: `raw/tech_stack.md.proposal` (effimero, gate umano per promote).
**MAI** scrive direttamente `raw/tech_stack.md` (PATTERN §7 r.1 + §7 r.10).

## Fase 0 — Pre-condizioni

1. `factory.config.yaml.stack_mode == auto`, oppure richiamo esplicito dell'utente.
2. `wiki/` contiene almeno un'epica con requisiti business chiari, o concept/synthesis che descrivono dominio + vincoli.
3. Standards normativi già presenti in `wiki/` o `raw/`: **trattati verbatim** (PATTERN §11). La proposta li adotta; non li sostituisce.

## Fase 1 — Estrazione vincoli

1. Leggi (@-mention) `wiki/syntheses/`, `wiki/concepts/`, `wiki/entities/` per: dominio, scala attesa, compliance/standards (GDPR, FHIR, OIDC, SPID, eIDAS, ISO 27001, …), geografia (data residency), vincoli organizzativi.
2. Leggi `management/kanban/EP-*/` per i requisiti non-funzionali.
3. Compila una shortlist di vincoli internamente (non scrivere).

> Nota progetto: lo stack corrente è Next.js 16 + React 19 + TypeScript, Supabase (Postgres `pm_*`), Vitest + Playwright, Tailwind + @soli92/solids, deploy Vercel. Una proposta deve giustificare ogni divergenza da questo stack già in uso.

## Fase 2 — Ricerca

1. Per ciascun layer (`backend`, `frontend`, `database`, `qa`, `infra`) formula 1-2 query web focalizzate.
2. Usa WebSearch / WebFetch per fonti datate **2026** (preferibilmente ultimo trimestre). Scarta fonti senza data o pre-2025.
3. Per ogni candidato raccogli: versione corrente (LTS/stable), maturità/adoption 2026, compatibilità con i vincoli normativi, trade-off principali (un pro, un contro).

## Fase 3 — Scrittura proposta

**File**: `raw/tech_stack.md.proposal`

```markdown
---
type: tech-stack-proposal
created: YYYY-MM-DD
stack_mode: auto
generator: tech-scout skill (PATTERN §14)
status: proposal  # umano deve promuovere a tech_stack.md
---
# Tech stack proposal — YYYY-MM-DD

> Generata automaticamente da `tech-scout` su base `wiki/` + fonti web 2026.
> **NON sovrascrive `raw/tech_stack.md`.** Gate umano per applicare.

## Vincoli rilevati (da wiki/ + raw/)
- <vincolo> [^src: wiki/concepts/<page>.md §X]
- Standards verbatim: <lista — SAML, OIDC, FHIR, ...>

## Stack proposto
### Backend
**Scelta:** <es. Next.js route handlers / server actions>
**Razionale:** <1-2 righe>
**Fonti:** [^web: <url> §<sezione>] (accessed YYYY-MM-DD)
**Alternative considerate:** <X, Y> (pro/contro brevi)
### Frontend / Database / QA / Infra
... (stessa struttura)

## Trade-off complessivi
<3-5 righe: punti forti, punti deboli, assunzioni>

## Non scelto verbatim da raw/
<divergenze dichiarate esplicitamente. Standards normativi PATTERN §11 NON devono mai divergere.>
```

## Fase 4 — Handoff

1. Append a `wiki/log.md`:
   ```markdown
   ## YYYY-MM-DD HH:MM — tech-scout proposal
   **Generata:** raw/tech_stack.md.proposal
   **Fonti web:** <count>
   **Standards verbatim adottati:** <lista o "nessuno">
   **Next:** gate umano per promuovere a tech_stack.md
   ```
2. Segnala in chat: "Proposta scritta in `raw/tech_stack.md.proposal`. Reviewala e, se ok, rinominala in `raw/tech_stack.md`. MAI applicare automaticamente."

## Vincoli inviolabili

- **MAI scrivere `raw/tech_stack.md`** direttamente. Solo `.proposal`.
- **MAI sostituire standards normativi** già citati in raw/wiki.
- **Citazione obbligatoria** su ogni scelta: almeno una fonte web datata 2026.
- **Trasparenza sulle alternative**: l'utente vede cosa è scartato e perché.
- **Non promuovere `.proposal`** autonomamente — il file resta sul filesystem finché l'umano decide.
