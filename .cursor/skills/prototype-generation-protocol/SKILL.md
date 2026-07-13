# Skill: Prototype Generation Protocol

> Adapter Cursor della skill `prototype-generation-protocol` definita in PATTERN.md §26 (candidato, Prototype Generation Layer, EP-035 US-122).

Protocollo provider-agnostic a **5 fasi** per la generazione di prototipi grafici: resolve →
intent+source → generate → self-contain check → handoff. Delega la logica backend-specifica
alla skill `<backend>-mapping` corrispondente. Analogia strutturale con `publisher-protocol`
(v2.10): protocollo agnostico + skill provider-specific ([html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) /
[react-mapping](mdc:.cursor/skills/react-mapping/SKILL.md) / figma-mapping / penpot-mapping). Single source
of truth per il layer di prototipazione. Invocata da [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc)
e dal comando `/prototype`.

Ogni fase ha criteri di uscita espliciti; nessun fallimento silenzioso. Sub-skill invocate:
[backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) (Fase 0), `<backend>-mapping` (Fase 2).

## Precondizione assoluta — Guard `prototyping.enabled` (INV-5)

In testa a qualsiasi esecuzione, prima della Fase 0:

```
SE factory.config.yaml.prototyping.enabled == false (default R.P3):
  STOP — emetti nessun output, nessun side-effect.
  Il caller mostra:
    "[prototype-generation-protocol] Skipped: prototyping.enabled: false (R.P3 default off)
     Per abilitare: imposta prototyping.enabled: true in factory.config.yaml
     e verifica /prototype-status."
```

A flag spento la factory è identica alla versione precedente (backward compat totale, INV-5).

## Input del protocollo

Il caller ([prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) o `/prototype`) passa:

```yaml
input_ref: <US-NNN | TSK-NNN | "stringa libera di intent">
prototyping_config:      # blocco prototyping: di factory.config.yaml (letto dal caller)
  enabled: true
  backend: auto | html | react | figma | penpot
  fallback_chain: [...]
  degrade_policy: notify | strict
  fidelity: interactive | static | animated
  design_source: auto | <spec-path> | none
  art_director: inherit | on | off
  output_path: "output/prototypes"
  oracle_handoff: true | false
  backends:
    html:  { css_strategy: tailwind-cdn | inline | vanilla, single_file: true }
    react: { component_lib: shadcn, storybook: true, target: "" }
    figma: { mcp_server: "figma", file_key: "" }
    penpot:{ mcp_server: "penpot", instance_url: "" }
design_intelligence_config:    # da factory.config.yaml.design_intelligence (EP-019)
  art_director: true | false   # se true: leggi DSL art-director in Fase 1
```

## Fase 0 — Backend Resolve

**Scopo**: determinare quale backend usare. Delegato interamente a
[backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) — nessuna logica di risoluzione duplicata nel core.

1. Invoca [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) con:
   - `intent` — derivato da `input_ref`: stringa libera → passala direttamente; `US-id`/`TSK-id`
     → leggi il file per estrarre l'intent (`title`, `role`, o body), passa `"auto"` se non
     univocamente mappabile.
   - `prototyping_config` — blocco ricevuto in input.
2. Il resolver ritorna: `selected_backend`, `marker`, `preferred_backend`, `degraded_from`,
   `reason`, `asse1_match`, `asse2_probes`.
3. Gestione marker:

   **`BACKEND_RESOLVED: <backend>`** — procedi con `selected_backend`; emetti `[Fase 0] BACKEND_RESOLVED: <backend>`.

   **`BACKEND_DEGRADED: <preferito>→<selezionato> (<motivo>)`** — procedi con `selected_backend`
   (il resolver ha già scelto il fallback); emetti il marker di degrado + motivo; se
   `oracle_handoff: true`, annota in Fase 4 di suggerire la remediation.

   **`BACKEND_UNAVAILABLE_STRICT: <preferito> (<motivo>)`** — **STOP con gate umano** (INV-2 +
   `degrade_policy: strict`). Emetti:
   ```
   [Fase 0] BACKEND_UNAVAILABLE_STRICT: <preferito> (<motivo>)
   Azione richiesta: scegli una delle opzioni:
     (a) Autentica / configura il backend <preferito> e rilancia /prototype
     (b) Abbassa degrade_policy: notify in factory.config.yaml
     (c) Cambia backend: <altro> in factory.config.yaml
   ```
   Non procedere alle fasi successive.

**Criteri di uscita**: marker emesso; `selected_backend` valorizzato (o STOP). Il marker è
propagato come `resolved_marker` (presente in ogni log entry e nell'output finale).

## Fase 1 — Intent & Source

**Scopo**: costruire il brief di generazione — descrizione artefatto, stati UI richiesti, spec
sorgente (se presente), token art-director (se abilitati).

### Step 1.1 — Lettura input_ref

**Caso A — US-id (`US-NNN`)**: leggi il file US (`management/kanban/**/US-NNN*/US-NNN.md`,
read-only INV-3); estrai `title`, `role`, sezione `## Descrizione`, riferimenti a wireframe/spec;
cerca `design-spec.md` (Step 1.2); costruisci `intent_text` da titolo + descrizione.

**Caso B — TSK-id (`TSK-NNN`)**: leggi il file TSK (read-only); estrai `title`, `us_id`, corpo;
risali alla US per contesto; cerca `design-spec.md`; costruisci `intent_text` dal titolo TSK.

**Caso C — Stringa libera**: usa la stringa come `intent_text`; `us_id: null`, `tsk_id: null`;
cerca `design-spec.md` solo se `design_source` è un path esplicito.

In tutti i casi determina:

```yaml
intent_text: <stringa descrittiva>
us_id: <US-NNN | null>
tsk_id: <TSK-NNN | null>
slug: <slug per il path di output>   # es. "login-form", "dashboard-widget"
```

Lo `slug` deriva da `us_id` (`us-122`) → `tsk_id` (`tsk-233`) → slug kebab-case della stringa
libera (max 40 char, lowercase, trattini). Se ambiguo, preferisci `<data>-<slug>`.

### Step 1.2 — Ricerca design-spec.md (INV-3 read-only)

1. Se `design_source` è un path esplicito (non `auto`/`none`): usalo; se assente → warning + procedi senza spec.
2. Se `design_source: auto` (default): cerca `design-spec.md` in dir del TSK → dir della US →
   `output/design-specs/<slug>.md` → `output/design-specs/` (glob per slug simile). Primo trovato
   vince; logga il path. Se non trovato: `spec_source: null` — usa `intent_text`.
3. Se `design_source: none`: `spec_source: null`; procedi con `intent_text`.

**INV-3**: il file `design-spec.md` è SOLO in lettura — mai modificato, rinominato o cancellato.

### Step 1.3 — Art-director DSL (opt-in EP-019)

Gate: `prototyping.art_director` × `design_intelligence.art_director`.

| `prototyping.art_director` | `design_intelligence.art_director` | Risultato |
|---|---|---|
| `inherit` (default) | `true` | art-director ATTIVO |
| `inherit` | `false` | art-director SPENTO |
| `on` | qualsiasi | art-director ATTIVO |
| `off` | qualsiasi | art-director SPENTO |

Se ATTIVO, leggi il DSL art-director dalla config o dalla sezione `## Art Director Tokens` di
`design-spec.md` ed estrai:

```yaml
art_director_tokens:
  palette: [...]
  font_family: "..."
  spacing_unit: "..."
  border_radius: "..."
  shadow: "..."
```

Se SPENTO: `art_director_active: false`, `art_director_tokens: null`.

### Step 1.4 — Composizione brief

```yaml
brief:
  intent_text: <stringa>
  us_id: <US-NNN | null>
  tsk_id: <TSK-NNN | null>
  slug: <stringa>
  spec_source: <path | null>
  output_path: <prototyping_config.output_path>
  css_strategy: <backends.html.css_strategy>   # solo se backend == html
  art_director_active: <bool>
  art_director_tokens: <yaml | null>
  states_hint: [...]                            # stati UI dalla spec/intent (best-effort)
  fidelity: <prototyping_config.fidelity>
  selected_backend: <da Fase 0>
  resolved_marker: <da Fase 0>
```

**Criteri di uscita**: `brief` completo; `spec_source` valorizzato o `null`; art-director
determinato; `slug` e `output_path` pronti. Nessun file spec modificato (INV-3).

## Fase 2 — Generate

**Scopo**: produrre l'artefatto delegando interamente alla skill `<backend>-mapping`. Il core
non contiene logica MCP/HTML/React — delega totale e provider-agnostic (ADR-EP035-003 GO, riuso
pattern publisher). Aggiungere un nuovo backend = aggiungere `<backend>-mapping` + voce in
`fallback_chain`; nessuna modifica al protocollo core.

1. Identifica la skill in base a `selected_backend`:

   | `selected_backend` | Skill invocata |
   |---|---|
   | `html` | [html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) |
   | `react` | [react-mapping](mdc:.cursor/skills/react-mapping/SKILL.md) (US-124) |
   | `figma` | figma-mapping (US-126, futuro) |
   | `penpot` | penpot-mapping (US-127, futuro) |

   Se la skill per il `selected_backend` non esiste nell'adapter: **STOP** + segnala
   `[Fase 2] Skill <backend>-mapping non trovata ...`. Il caller lo gestisce come errore di
   configurazione (non come degrado backend — già gestito in Fase 0).

2. Invoca la skill `<backend>-mapping` passando il `brief` completo (Step 1.4) + accesso in
   lettura a `spec_source` (INV-3 è responsabilità anche della mapping skill).

3. La skill ritorna (schema minimo, varia per backend):

   ```yaml
   output_ref: <path del file generato | riferimento artefatto>
   backend: <html | react | figma | penpot>
   marker: <backend-specifico>          # es. HTML_GENERATED
   artifact_metadata: <yaml — dipende dal backend>
   ```

4. Se la skill mapping ritorna errore (file non generato, MCP non risponde, build fallita):
   logga `[Fase 2] Generazione fallita (backend: <backend>): <motivo>`; **STOP** — non procedere
   a Fase 3; suggerisci `/prototype-status` per diagnosticare.

**Criteri di uscita**: `output_ref` valorizzato; `marker` emesso; `artifact_metadata`
disponibile. Nessuna logica backend-specifica nel corpo di questa fase.

## Fase 3 — Self-contain check

**Scopo**: verificare invarianti meccaniche (self-containment, completezza strutturale, assenza
dipendenze rotte) prima dell'emit definitivo. Backend-dipendente, ma sempre responsabilità del
core (non della mapping skill).

**INV-4**: questa fase NON valuta qualità estetica/funzionale — solo invarianti meccaniche. La
validazione qualitativa è delegata a oracle/reviewer in Fase 4.

### Backend `html` (INV-6 non overridabile)

- [ ] Il file esiste e ha dimensione > 0 bytes.
- [ ] **`single_file: true`** (INV-6): un solo `index.html`; nessun file aggiuntivo nella dir (salvo struttura dichiarata dalla mapping skill).
- [ ] **Nessun asset esterno non consentito**: nessun `<link href="http://...">`, `<script src="http://...">`, `@import url("http://...")`, `<img src="http(s)://...">` — eccetto Tailwind CDN (`https://cdn.tailwindcss.com`) se `css_strategy: tailwind-cdn`.
- [ ] **Stati UI principali coperti**: `artifact_metadata.states_covered` non vuoto; almeno `default`. Se `states_hint` era valorizzato, verifica che gli stati dichiarati siano coperti (stati custom mancanti → warning senza bloccare).
- [ ] **`single_file_verified: true`** nel `artifact_metadata`.

Se una o più verifiche falliscono: logga i check falliti; **STOP** — non emettere
`PROTOTYPE_GENERATED`; segnala che il prototipo non è self-contained.

### Backend `react`

- [ ] Il file/directory di output esiste.
- [ ] Nessuna dipendenza non risolta (nessun errore di import mancante).
- [ ] `artifact_metadata.component_file` valorizzato.
- [ ] `artifact_metadata.states_covered` non vuoto.

### Backend `figma` o `penpot`

- [ ] `output_ref` valorizzato con riferimento valido (URL o ID artefatto).
- [ ] `artifact_metadata` contiene conferma di creazione (frame_id, component_id).
- [ ] Nessun errore MCP (`mcp_error: null` o assente).

### Marker di uscita

Se tutti i check passano:

```
PROTOTYPE_GENERATED: <output_ref>
```

Esempi: `PROTOTYPE_GENERATED: output/prototypes/login-form/index.html` ·
`PROTOTYPE_GENERATED: figma://file/AbCdEf123/frame/42`

`PROTOTYPE_GENERATED` è l'unico marker emesso da questa fase — mai se anche un solo check è fallito.

**Criteri di uscita**: `PROTOTYPE_GENERATED` emesso; check di self-containment superati; nessuna
auto-valutazione qualitativa (INV-4).

## Fase 4 — Handoff

**Scopo**: dopo `PROTOTYPE_GENERATED`, registrare l'evento nel log, notificare stato TSK/US se
applicabile, orientare verso i reviewer/oracle downstream.

**INV-4 (enforced)**: nessuna valutazione qualitativa — né in chat né nel log. Frasi tipo "il
prototipo è ben strutturato" / "il design è adeguato" / "buon risultato" sono vietate. Questa
fase fa solo routing verso chi valuta.

### Step 4.1 — Log entry

Path: `prototyping_config.log_path` se valorizzato, altrimenti `wiki/log.md`. Append-only:

```
## YYYY-MM-DD HH:MM — prototype <TSK-id | US-id | "intent">
**Backend:** <selected_backend> (<resolved_marker>)
**Artefatto:** <output_ref>
**Spec source:** <spec_source | "none (intent only)">
**Art-director:** <art_director_active>
**States covered:** <states_covered list>
**Suggerimenti emessi:** <N> (elenco comandi, o "nessuno — oracle_handoff: false")
**Files touched:** 1 (<output_ref> [NEW])
```

Il log entry è scritto **sempre**, indipendentemente da `oracle_handoff`.

### Step 4.2 — Notifica status TSK/US (se applicabile)

Se `tsk_id` valorizzato e TSK in `in-progress`: **non modificare lo status del TSK** (è del
dev-agent/orchestrator che ha invocato il protocollo; il protocollo è una skill, non ha ownership
sul TSK); segnala `[Fase 4] Prototipo generato per TSK-NNN. Se era il deliverable principale,
aggiorna lo status del TSK.` Se `tsk_id: null`: solo `[Fase 4] Prototipo generato: <output_ref>`.

### Step 4.3 — Guard `oracle_handoff`

```
SE oracle_handoff == false:
  STOP questo step — nessun suggerimento.
  Log entry già scritto con "Suggerimenti emessi: nessuno — oracle_handoff: false".
  Emetti "[Fase 4] oracle_handoff: false — suggerimenti soppressi."
  Procedi ai criteri di uscita.
```

Se `oracle_handoff: true` (default): procedi con Step 4.4.

### Step 4.4 — Gate installazione comandi

Per ogni suggerimento candidato: se il comando corrispondente **non è installato** nell'adapter,
sopprimi silenziosamente il suggerimento (nessun WARNING). Solo i comandi installati vengono proposti.

### Step 4.5 — Suggerimenti per backend

| Backend | Suggerimenti candidati (emessi solo se comando installato e gate config attivo) |
|---|---|
| `html` | `/visual-oracle` (sempre) · `/functional-oracle` (se `states_covered` > 1 elemento) · `/ux-ui-review` (sempre) · `/a11y` (sempre) |
| `react` | `/visual-oracle` (sempre) · `/functional-oracle` (sempre) · `/review` (se `code_quality.enabled: true`) · `/a11y` (sempre) · handoff narrativo a [fe-dev](mdc:.cursor/rules/fe-dev.mdc) |
| `figma` | `/ux-ui-review` (sempre) · round-trip `/figma-sync` (narrativo) · revisione manuale nel file Figma (`output_ref`) |
| `penpot` | `/ux-ui-review` (sempre) · revisione manuale nel file Penpot (`output_ref`) |

Gate config per suggerimento:

| Suggerimento | Flag richiesto |
|---|---|
| `/visual-oracle` | `fe_correctness.enabled: true` |
| `/functional-oracle` | `fe_correctness.functional_oracle.enabled: true` |
| `/ux-ui-review` | `ux_ui.enabled: true` |
| `/a11y` | `a11y.enabled: true` |
| `/review` | `code_quality.enabled: true` |

Flag `false`/assente → suggerimento soppresso. Flag `true` ma comando non installato → soppresso.
Entrambi i gate superati → emesso. I suggerimenti narrativi (handoff [fe-dev](mdc:.cursor/rules/fe-dev.mdc),
round-trip `/figma-sync`, revisione manuale) non sono legati a flag config.

### Step 4.6 — Suggerimento push EP-033

Regola aggiuntiva EP-033 (segnale push leggibile dall'orchestrator, non applicato dalla skill):

```
SE prototyping.enabled: true
E lo sprint corrente include TSK con layer=fe
E quei TSK hanno design-spec.md associata
E nessun prototipo recente è registrato in wiki/log.md per quella US nella sessione corrente
→ emetti:
  "[EP-033 push] Rilevati TSK FE con spec ma senza prototipo recente per <US-id>.
   Considera: /prototype <US-id>"
```

Non-bloccante e informativo. Soppresso se `prototyping.enabled: false` o se `/prototype` non è installato.

### Step 4.7 — Formato output Fase 4

```
[Fase 4] Prototipo registrato: <output_ref>
Log: <log_path> (entry appended)

Passi successivi disponibili:
- `/<comando>` — <motivazione breve, max 1 riga, specifica per il backend>.
[... un suggerimento per riga, solo quelli che hanno superato tutti i gate ...]
```

Se 0 suggerimenti superano i gate:

```
[Fase 4] Prototipo registrato: <output_ref>
Log: <log_path> (entry appended)
Nessun suggerimento downstream disponibile (capability non attivate o oracle_handoff: false).
```

Tono: "disponibili", "considera", "potresti" — mai imperativo. La Fase 4 è informativa, non un gate.

**Criteri di uscita**: log entry appended (sempre); suggerimenti emessi in funzione di
backend/gate (o silenzio se `oracle_handoff: false`); segnale push EP-033 se trigger soddisfatto;
nessun side-effect su spec sorgente (INV-3); nessuna valutazione qualitativa (INV-4).

## Output finale del protocollo

### Esito positivo

```
PROTOTYPE GENERATION — <input_ref>
===================================
Fase 0 — Backend:    <resolved_marker>: <selected_backend>
Fase 1 — Source:     <spec_source | "intent only"> / art-director: <on|off>
Fase 2 — Generate:   <backend>-mapping invocata → <marker-mapping>
Fase 3 — Check:      PROTOTYPE_GENERATED: <output_ref>
Fase 4 — Handoff:    log entry scritto · suggerimenti: <N>
```

### Esito con STOP (gate umano o errore)

```
PROTOTYPE GENERATION — STOP
===========================
Fase <N> — <motivo del blocco>
Azione richiesta: <descrizione azione umana>
```

## Invarianti del protocollo

- **INV-1** (`html` sempre disponibile): il protocollo non può hard-fail per indisponibilità backend — `html` è il fallback terminale garantito da [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md).
- **INV-2** (mai bloccare su MCP non autenticato salvo `strict`): la Fase 0 delega al resolver (read-only, nessun OAuth qui).
- **INV-3** (read-only spec sorgente): protocollo e skill invocate non modificano mai `design-spec.md` o altri file di spec.
- **INV-4** (no self-eval): il protocollo non giudica la qualità dell'artefatto — né in chat né nel log. Validazione delegata a oracle/reviewer (Fase 4).
- **INV-5** (default off): a `prototyping.enabled: false`, nessun output/side-effect/artefatto.
- **INV-6** (single_file per html, non overridabile): verificata in Fase 3. Se fallisce, `PROTOTYPE_GENERATED` non viene emesso.

## Vincoli di esecuzione

- **Provider-agnostic (Fase 2)**: nessuna logica MCP/HTML/React nel corpo — tutto nella `<backend>-mapping` delegata.
- **Nessun design**: se la spec è insufficiente/assente, procedi con `intent_text` — non inventare dettagli architetturali. Lo slot `<!-- PLACEHOLDER -->` è l'unico meccanismo di "intent aperto" accettato.
- **Criteri di uscita espliciti per fase**: mai proseguire senza soddisfare il criterio.
- **Mai fallimento silenzioso**: ogni percorso emette un marker (`BACKEND_RESOLVED`, `BACKEND_DEGRADED`, `BACKEND_UNAVAILABLE_STRICT`, `PROTOTYPE_GENERATED`) o un messaggio di STOP esplicito.

## Cross-link

- **Skill invocate**: [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) (Fase 0); [html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) (Fase 2 backend `html`); [react-mapping](mdc:.cursor/skills/react-mapping/SKILL.md) (US-124); figma-mapping (US-126, futuro); penpot-mapping (US-127, futuro).
- **Callers**: [prototype-generator](mdc:.cursor/rules/prototype-generator.mdc) (US-122); comando `/prototype` (US-122).
- **Config source**: `factory.config.yaml` blocchi `prototyping:` e `design_intelligence:`.
- **Analogia strutturale**: `publisher-protocol` (v2.10) — protocollo agnostico + skill provider-specific; [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) — spina dorsale a fasi con gate e handoff.
- **Invarianti EP-035**: INV-1..INV-6.
- **PATTERN §26** (candidato) — Prototype Generation Layer.
- **Fonti**: `wiki/concepts/prototype-generation-capability.md`, `wiki/syntheses/ep-035-prototype-generation-integration.md`, `wiki/sources/2026-07-01-prototype-generation-capability.md`, `management/kanban/EP-035-prototype-generation-layer/`.
