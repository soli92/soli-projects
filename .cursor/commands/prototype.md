# /prototype — genera un prototipo grafico (EP-035, PATTERN §26 candidato)

Genera un prototipo grafico o funzionale a partire da uno dei seguenti input:

- **US-id** (`US-NNN`) — storia utente come sorgente di intent e spec
- **TSK-id** (`TSK-NNN`) — task kanban come sorgente di intent (risale alla US per contesto)
- **stringa libera** (es. `"form di login con stato errore e loading"`) — intent diretto

Il comando valida l'input, applica i flag opzionali e lancia l'agente
[prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) che esegue il
[prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) (5 fasi). Gated su
`prototyping.enabled`.

## Sintassi

```
/prototype <US-id|TSK-id|"intent"> [--backend=html|react|figma|penpot] [--fidelity=static|interactive|animated] [--dry-run]
```

| Argomento / Flag | Tipo | Default | Descrizione |
|---|---|---|---|
| `<input>` | obbligatorio | — | US-id, TSK-id o stringa libera di intent |
| `--backend=<b>` | opzionale | `auto` (da config) | Forza un backend per questa invocazione (override one-shot) |
| `--fidelity=<f>` | opzionale | `auto` (da config) | Forza un livello di fedeltà per questa invocazione (override one-shot) |
| `--dry-run` | flag | off | Invoca solo la Fase 0 ([backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md)) senza generare artefatti |

## Procedura

### Step 0 — Gate `prototyping.enabled` (precondizione assoluta)

Prima di qualsiasi altra azione, leggi `factory.config.yaml`:

```
SE factory.config.yaml.prototyping.enabled == false (default R.P3):
  STOP — non invocare l'agente, non generare artefatti, nessun side-effect.
  Emetti in chat:
    "[/prototype] Layer spento: prototyping.enabled: false (R.P3 default off).
     Per abilitare il Prototype Generation Layer:
       1. Aggiungi / aggiorna factory.config.yaml:
            prototyping:
              enabled: true
              backend: auto
              fallback_chain: [figma, penpot, react, html]
              degrade_policy: notify
       2. Esegui /prototype-status per verificare la disponibilità dei backend.
       3. Ri-lancia /prototype <input>."
```

Non emettere uno STOP silenzioso: l'errore deve essere esplicito e orientare l'azione. Se `true`, prosegui.

### Step 1 — Parse argomenti

Estrai: `raw_input` (primo argomento non-flag), `override_backend` (`--backend` o `null`),
`override_fidelity` (`--fidelity` o `null`), `dry_run` (`true` se `--dry-run`).

Validazione flag:
- `--backend` ∈ `{html, react, figma, penpot}`. Altrimenti STOP: «Valore --backend non valido: <v>. Valori ammessi: html, react, figma, penpot.»
- `--fidelity` ∈ `{static, interactive, animated}`. Altrimenti STOP: «Valore --fidelity non valido: <v>. Valori ammessi: static, interactive, animated.»

Se nessun argomento fornito (stringa vuota):

```
[/prototype] Input mancante.

Utilizzo: /prototype <US-id|TSK-id|"intent"> [--backend=html|react|figma|penpot] [--fidelity=static|interactive|animated] [--dry-run]

Esempi:
  /prototype US-122
  /prototype TSK-235
  /prototype "form di login con stato errore e loading"
  /prototype US-122 --backend=html --dry-run

Fornisci un US-id, un TSK-id o una descrizione dell'intent da prototipare.
```

### Step 2 — Validazione e risoluzione `raw_input`

**Caso A — US-id** (pattern `US-\d+`):
1. Cerca con `Glob management/kanban/**/US-<NNN>*/US-<NNN>.md`.
2. 0 match → STOP «US-<NNN> non trovata. Verifica che il file esista in management/kanban/**.»
3. > 1 match → STOP «US-<NNN> trovata in più path — ambiguità. Specifica il path completo o risolvi l'ambiguità.»
4. 1 match → `input_ref = "US-NNN"`, `input_type = "us_id"`, `input_file = <path>`. Segnala `[/prototype] Trovata: <path>`.

**Caso B — TSK-id** (pattern `TSK-\d+`):
1. Cerca con `Glob management/kanban/**/TSK-<NNN>.md`.
2. 0 match → STOP «TSK-<NNN> non trovato. Verifica che il file esista in management/kanban/**.»
3. > 1 match → STOP «TSK-<NNN> trovato in più path — ambiguità.»
4. 1 match → `input_ref = "TSK-NNN"`, `input_type = "tsk_id"`, `input_file = <path>`. Segnala `[/prototype] Trovato: <path>`.

**Caso C — Stringa libera** (nessun pattern US/TSK): `input_ref = <raw_input>`, `input_type = "free_intent"`, `input_file = null`. Nessuna ricerca su filesystem; la stringa è passata come intent diretto.

### Step 3 — Applicazione override one-shot

Se `override_backend` o `override_fidelity` valorizzati, costruisci:

```yaml
prototyping_override:
  backend: <override_backend | null>    # null = usa config factory
  fidelity: <override_fidelity | null>  # null = usa config factory
```

Gli override sono **one-shot per questa invocazione**: non modificano `factory.config.yaml`.
Segnala `[/prototype] Override one-shot: backend=<b> fidelity=<f>`.

### Step 4 — Modalità `--dry-run`

Se `dry_run: true`:
1. Leggi il blocco `prototyping:` (inclusa `fallback_chain` e `degrade_policy`).
2. Se `override_backend` valorizzato, consideralo come preferito (ASSE 1 del resolver).
3. Invoca [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) in modalità dry-run: `intent` derivato da
   `input_ref` (US/TSK: usa il titolo; intent libero: la stringa); `prototyping_config` = blocco config + eventuale override.
4. Mostra il risultato **senza generare artefatti**:

```
[/prototype --dry-run] Risoluzione backend per: <input_ref>
============================================================
Backend configurato: <prototyping.backend>
Fallback chain:      <fallback_chain>
Degrade policy:      <degrade_policy>

RISOLUZIONE DRY-RUN (nessun artefatto generato)
<BACKEND_RESOLVED | BACKEND_DEGRADED | BACKEND_UNAVAILABLE_STRICT>: <dettaglio>
Backend che verrebbe selezionato: <selected_backend>

Per generare il prototipo: /prototype <input_ref> [stessi flag senza --dry-run]
Per lo snapshot globale del layer: /prototype-status
```

5. Termina — nessuna invocazione dell'agente, nessun side-effect.

### Step 5 — Invocazione `prototype-generator`

Se non è dry-run, lancia [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) passando:

```yaml
input_ref: <input_ref>          # US-NNN | TSK-NNN | "stringa libera"
input_type: <us_id|tsk_id|free_intent>
prototyping_override:           # null se nessun override one-shot
  backend: <override_backend | null>
  fidelity: <override_fidelity | null>
```

L'agente legge autonomamente da `factory.config.yaml` i blocchi `prototyping:` e
`design_intelligence:` ed esegue il [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) (5 fasi):

| Fase | Nome | Azione |
|---|---|---|
| 0 | Backend Resolve | Invoca [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) → `BACKEND_RESOLVED` / `BACKEND_DEGRADED` / `BACKEND_UNAVAILABLE_STRICT` |
| 1 | Intent & Source | Leggi US/TSK/intent + cerca `design-spec.md` + risolvi art-director DSL (EP-019) |
| 2 | Generate | Invoca `<selected_backend>-mapping` col brief |
| 3 | Self-contain check | Verifica invarianti meccaniche (INV-6 per html; stati coperti; no dipendenze rotte) |
| 4 | Handoff | Append `wiki/log.md`; suggerimenti oracle/reviewer downstream |

### Step 6 — Output finale

**Esito positivo**:

```
/prototype <input_ref> — completato
=====================================
Fase 0 — Backend:    <BACKEND_RESOLVED | BACKEND_DEGRADED>: <selected_backend>
Fase 1 — Source:     <spec_source | "intent only"> / art-director: <on|off>
Fase 2 — Generate:   <backend>-mapping invocata → <marker-mapping>
Fase 3 — Check:      PROTOTYPE_GENERATED: <output_ref>
Fase 4 — Handoff:    log entry scritto · suggerimenti: <N>

Artefatto: <output_ref>
```

**Esito con degrado backend** (marker `BACKEND_DEGRADED`): riepilogo positivo + nota di degrado:

```
Nota: backend degradato <preferito>→<selezionato> (<motivo>).
      Per ripristinare <preferito>: <remediation da backend-resolver>.
```

**Esito con STOP** (gate umano o errore):

```
/prototype <input_ref> — STOP
==============================
Fase <N> — <motivo del blocco>
Azione richiesta: <descrizione azione umana>
```

## Suggerimenti handoff (post-generazione)

Emessi dall'agente in Fase 4, dipendono dal backend risolto e dai flag abilitati in
`factory.config.yaml`. Soppressi silenziosamente se il comando corrispondente non è installato o il
flag è `false`:

| Backend | Suggerimenti candidati |
|---|---|
| `html` | `/visual-oracle` · `/functional-oracle` (se stati interattivi) · `/ux-ui-review` · `/a11y` |
| `react` | `/visual-oracle` · `/functional-oracle` · `/review` (CQRL se abilitato) · `/a11y` |
| `figma` | `/ux-ui-review` · round-trip `/figma-sync` · revisione manuale nel file Figma |
| `penpot` | `/ux-ui-review` · revisione manuale nel file Penpot |

## Esempi d'uso

```bash
# Genera un prototipo dalla storia US-122 (backend auto, fidelity da config)
/prototype US-122

# Genera da un TSK specifico con backend HTML esplicito
/prototype TSK-235 --backend=html

# Genera da intent libero (stringa descrittiva diretta)
/prototype "dashboard widget con grafici e stato empty/loading/error"

# Genera con fidelity statica (solo screenshot/wireframe senza interazione JS)
/prototype US-122 --fidelity=static

# Dry-run: mostra quale backend verrebbe selezionato per US-122, senza generare
/prototype US-122 --dry-run

# Dry-run con override backend esplicito: controlla se figma è disponibile
/prototype "form di checkout" --backend=figma --dry-run
```

## Vincoli

- **Gate `prototyping.enabled`** (Step 0): il comando non procede e non è silenzioso a flag spento — emette un errore esplicito con le istruzioni di attivazione (mai STOP silenzioso, INV-5 + R.P3).
- **Override one-shot** (Step 3): `--backend` e `--fidelity` non modificano `factory.config.yaml`. Per cambiare la config in modo persistente, edita direttamente il file.
- **Read-only verso spec sorgente** (INV-3): comando e agente non modificano `design-spec.md`, file TSK, file US.
- **No auto-eval** (INV-4): nessun giudizio qualitativo sull'artefatto generato. La valutazione è delegata a oracle/reviewer downstream.
- **Input mancante**: non indovina l'intent — chiede esplicitamente (Step 1).
- **Ambiguità US/TSK**: se glob trova più di un match per lo stesso id, STOP con errore — non seleziona arbitrariamente.

## Prerequisiti

- `factory.config.yaml.prototyping.enabled: true` (gate principale, Step 0).
- Blocco `prototyping:` completo in `factory.config.yaml` (schema in [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) §Input attesi).
- [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) presente (invocato in Step 5).
- [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) presente (eseguita dall'agente).
- Backend `html`: nessun prerequisito aggiuntivo (sempre disponibile, INV-1).
- Backend `react`: stack FE rilevato da `stack-detector` in almeno un `code_path`.
- Backend `figma`/`penpot`: MCP server corrispondente autenticato e raggiungibile.

Usa `/prototype-status` per verificare la disponibilità dei backend prima di lanciare la generazione.

## Cross-link

- **Agente invocato**: [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) (US-122).
- **Skill eseguita**: [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) (US-122).
- **Skill Fase 0**: [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) (US-120).
- **Skill Fase 2 (html)**: [html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) (US-121).
- **Snapshot layer**: `/prototype-status` — dry-run globale, nessun input.
- **Config gate**: `factory.config.yaml` blocco `prototyping:` (INV-5, R.P3).
- **PATTERN §26** (candidato) — Prototype Generation Layer (EP-035).
- **Analogia strutturale**: `/dev` (v2.7) — input identificativo → esecuzione protocollo → output artefatto; `/review` (v2.12) — gate config + invocazione agente + report finale; `/kanban-publish` (v2.10) — gated, provider-agnostic, one-shot override.
