# Skill: Test Healing Protocol

> Adapter Cursor della skill `test-healing-protocol` (v1.0, EP-028, Sprint 30). Protocollo di auto-guarigione dei test per [qa-dev](mdc:.cursor/rules/qa-dev.mdc). Prerequisiti: EP-018 ([functional-oracle-protocol](mdc:.cursor/skills/functional-oracle-protocol/SKILL.md), acceptance-spec immutabile), EP-027 ([flakiness-detection-protocol](mdc:.cursor/skills/flakiness-detection-protocol/SKILL.md), candidati prioritari per healing).

## Sezione 1 — Overview e Gate

Gate di abilitazione — no-op totale quando:

```yaml
qa_layer:
  test_healing:
    enabled: false   # default (R.P3 opt-in totale)
```

Con flag spento [qa-dev](mdc:.cursor/rules/qa-dev.mdc) non invoca nessuna fase; comportamento identico a pre-EP-028. Attivazione: `qa_layer.test_healing.enabled: true`.

Il test-healer è un **evaluator-optimizer probabilistico** specializzato per il corpus test, a livello di singolo test-case (non TSK/epica). Quando un test fallisce:

1. **Classifica** il failure in 1 delle 4 categorie causali (Fase 1).
2. **Propone o applica** un repair con confidence-gating a 3 livelli (Fasi 2-4).
3. **Tutela** l'immutabilità degli YAML acceptance-spec (Fase 5).
4. **Registra** ogni azione nell'audit trail JSONL (append-only).

Analogia con CQRL (EP-019): come `code-reviewer` migliora il codice con loop bounded (`max_iterations: 3`), il test-healer migliora la suite con loop bounded (`max_attempts`, default 3).

Categorie failure (grana fine, livello test-case):

| Categoria | Causa tipica |
|---|---|
| `STALE_SELECTOR` | Selettore CSS/ARIA non trovato nel DOM snapshot corrente (refactoring UI) |
| `SCHEMA_DRIFT` | Campo mancante o tipo errato in fixture/response body vs schema atteso |
| `INFRA_ERROR` | Timeout, porta occupata, network error, processo non avviato |
| `WRONG_ASSERTION` | Comportamento attuale != acceptance-spec ma diff semanticamente coerente |
| `UNKNOWN` | Nessuna euristica o LLM ha prodotto classificazione attendibile |

## Sezione 2 — Fase 1: Pipeline classificazione failure

Classificazione **deterministica prima, LLM dopo**: euristiche meccaniche (Step 1-3) prioritarie sul fallback LLM (Step 4). **Idempotente**: stesso input → stessa classificazione; nessuna scrittura/repair durante Fase 1 (solo lettura e analisi).

### Step 1 — INFRA_ERROR (deterministico)

Trigger: pattern infrastrutturali nel log. Euristiche: exit code `124` (timeout), `SIGKILL`, processo non-zero per motivi OS; keyword `ECONNREFUSED`, `ETIMEDOUT`, `port/address already in use`, `ENOENT`, `EACCES`, `DNS resolution failure`/`ENOTFOUND`, `ECONNRESET`, `Process exited with code`. Azione: se almeno un pattern matcha → `INFRA_ERROR`. Confidence dalla specificità del pattern. **Nessun repair automatico** — solo report di escalazione.

### Step 2 — SCHEMA_DRIFT (deterministico)

Trigger: campo mancante o tipo incompatibile in fixture/response body vs schema atteso. Euristiche (diff fixture vs schema endpoint/DB): campo obbligatorio assente/`null`; tipo diverso (es. atteso `string`, presente `number`; atteso `array`, presente `object`); campo `required: true` mancante nel response body. Azione: ≥1 discrepanza → `SCHEMA_DRIFT`. Confidence dalla completezza del diff.

### Step 3 — STALE_SELECTOR (deterministico)

Trigger: selettore CSS/ARIA non trovato nel DOM snapshot corrente al passo fallito. Euristiche: `element not found` con selettore esplicito; selettore (CSS class, ID, ARIA role, `data-testid`) assente nel DOM snapshot al fallimento; selettore valido in run precedenti (flakiness log EP-027). Il DOM snapshot va acquisito al momento del fallimento (candidato: `playwright evaluate`); il test-healer lo consuma come input, non lo acquisisce. Azione: selettore non trovato → `STALE_SELECTOR`. Confidence dall'univocità del candidato sostitutivo (1 candidato = alta; 0 o 2+ = media/bassa).

### Step 4 — WRONG_ASSERTION / UNKNOWN (LLM fallback)

Trigger: nessuno degli Step 1-3 ha classificato. Input al LLM: log completo, diff comportamento attuale vs atteso (dall'acceptance-spec), rationale richiesto. Logica: coerenza semantica con cambiamento legittimo (label/campo/flusso modificato deliberatamente) → `WRONG_ASSERTION`; se `confidence < 0.50` o nessuna categoria → `UNKNOWN`. **UNKNOWN policy:** escalation immediata al gate umano, nessun repair, TSK flaggato `self_healing_status: needs_human_review`.

Output schema obbligatorio per ogni invocazione:

```json
{
  "test_id": "<suite>::<test-name>",
  "classification": "STALE_SELECTOR | WRONG_ASSERTION | INFRA_ERROR | SCHEMA_DRIFT | UNKNOWN",
  "confidence": 0.00,
  "evidence": "<artefatto concreto: log excerpt, DOM snapshot ref, fixture diff>",
  "rationale": "<spiegazione sintetica>"
}
```

**Regola:** classificazione senza `evidence` → forzata a `UNKNOWN`. Il campo `evidence` è obbligatorio e non omissibile (artefatto concreto, non parafrasi del log).

Nota tecnica DOM snapshot: `STALE_SELECTOR` richiede lo snapshot al fallimento. La skill documenta l'interfaccia attesa (input: DOM snapshot HTML; output: lista candidati selettori) senza vincolare l'implementazione runtime; l'adozione di uno strumento specifico richiede un ADR separato.

## Sezione 3 — Fase 2: Strategie repair per categoria

Il repair non viene mai applicato senza passare per il confidence-gating (Fase 3).

- **STALE_SELECTOR:** cerca nel DOM snapshot un selettore alternativo, priorità: (1) `aria-label`, (2) `data-testid`, (3) testo visibile. Candidato scelto solo se **univoco** (1 match); 0 o 2+ candidati → downgrade automatico a Livello 2. Aggiorna il selettore nel file test. **Vietato** modificare `**/acceptance-spec/*.yaml` (Fase 5).
- **SCHEMA_DRIFT:** aggiunge il campo mancante con `null`/default del tipo (`""`, `0`, `[]`) alla fixture, o aggiorna il tipo se superset compatibile. **Auto-apply** solo se il nuovo schema è superset compatibile (nessun campo obbligatorio rimosso, nessun tipo incompatibile); altrimenti downgrade a Livello 3. Modifica annotata con `before_hash`/`after_hash`. **Vietato** modificare YAML acceptance-spec anche se il drift riguarda un campo dello spec.
- **INFRA_ERROR:** nessun repair automatico; solo report di escalazione (categoria, evidence del pattern matchato, suggerimento operativo, `action_taken: "escalated_to_human"`).
- **WRONG_ASSERTION:** genera diff comportamento attuale vs atteso (acceptance-spec) e propone l'aggiornamento dell'assertion nel file test. **Invariante critica:** NON può modificare l'acceptance-spec; se lo richiedesse → attivazione obbligatoria Fase 5, indipendentemente dal confidence.
- **UNKNOWN:** nessun repair; escalation umana immediata (`self_healing_status: needs_human_review`, report con classificazione/confidence/evidence/rationale, `action_taken: "escalated_to_human"`).

## Sezione 4 — Fase 3: Confidence-gating (3 livelli)

Soglia calcolata sul `confidence_score` della Fase 1.

### Livello 1 — Auto-apply (`confidence_score > 0.95`)

Condizioni: confidence > 0.95; categoria `STALE_SELECTOR` o `SCHEMA_DRIFT`; nessun file `**/acceptance-spec/*.yaml` coinvolto (glob check pre-write); per STALE_SELECTOR esattamente 1 candidato (altrimenti → Livello 2); per SCHEMA_DRIFT schema superset compatibile (altrimenti → Livello 3). Azione: repair applicato al working tree.

```json
{"type":"healing_action","test_id":"<suite>::<test-name>","classification":"STALE_SELECTOR | SCHEMA_DRIFT","confidence":0.00,"action_taken":"auto_applied","before_hash":"<sha256>","after_hash":"<sha256>","iteration":1}
```

### Livello 2 — Proposta patch/PR (`confidence_score` 0.70..0.95)

Condizioni: confidence in `[0.70, 0.95]` oppure downgrade da Livello 1 per ambiguità (0 o 2+ candidati). Azioni: diff annotato in `analytics/qa/healing-proposals/<test_id>-<YYYY-MM-DD>.diff` (file modificato, contesto 5 righe, annotazione inline con rationale + confidence); repair NON applicato al working tree. Se VCS disponibile: branch `qa-heal/<test_id>-<YYYY-MM-DD>`, commit `qa(heal): propose fix for <test_id> [confidence=<value>]`, PR draft (se provider in `kanban_publish`). Se VCS non disponibile: solo file di patch. L'orchestratore crea un TSK di revisione per PM/lead-architect.

```json
{"type":"healing_action","test_id":"<suite>::<test-name>","classification":"STALE_SELECTOR | SCHEMA_DRIFT | WRONG_ASSERTION","confidence":0.00,"action_taken":"pr_proposed","proposal_path":"analytics/qa/healing-proposals/<test_id>-<date>.diff","iteration":1}
```

### Livello 3 — Human gate (`confidence_score < 0.70`)

Condizioni: confidence < 0.70; oppure classificazione `UNKNOWN`; oppure `INFRA_ERROR`; oppure downgrade da L1 per schema drift con campi obbligatori rimossi; oppure downgrade da L2 per mancanza di candidati non ambigui. Azioni: nessuna modifica al codebase; TSK flaggato `self_healing_status: needs_human_review`; report QA con classificazione/confidence/evidence/rationale.

```json
{"type":"healing_action","test_id":"<suite>::<test-name>","classification":"UNKNOWN | <qualsiasi>","confidence":0.00,"action_taken":"escalated_to_human","iteration":1}
```

## Sezione 5 — Audit trail

Ogni azione di healing è appesa a `analytics/events/qa-events.jsonl`:

```json
{"type":"healing_action","test_id":"...","category":"...","confidence":0.0,"action_taken":"auto_applied|proposed|escalated","timestamp":"..."}
```

Il form esteso con `before_hash`/`after_hash` (auto-apply) e `proposal_path` (pr_proposed) è nelle rispettive sezioni.

**Invariante:** il JSONL è **append-only** — nessun record modificato/eliminato a posteriori. Ogni auto-apply include `before_hash`/`after_hash` (sha256) per verifica integrità. Leggibile da tool esterni. Già usato da EP-027: il sotto-schema `healing_action` affianca senza sovrascrivere `flakiness_event`.

## Sezione 6 — Loop bounded

Repair tentato al massimo `qa_layer.test_healing.max_attempts` volte (default `3`); dopo ogni tentativo il test è rieseguito. Il loop si interrompe quando: il test passa (repair efficace) oppure `iteration` raggiunge `max_attempts`.

Al terzo tentativo fallito: escalation umana obbligatoria indipendentemente dal confidence; test marcato `self_healing_status: exhausted`.

```json
{"type":"healing_action","test_id":"<suite>::<test-name>","classification":"<ultima>","confidence":0.00,"action_taken":"max_attempts_exceeded","iteration":3}
```

**Invariante contatore:** `iteration` mai resettato retroattivamente (append-only); nessun tentativo automatico dopo `max_attempts_exceeded`.

## Sezione 7 — Fase 5: Invariante acceptance-spec immutabile

> I file che matchano `**/acceptance-spec/*.yaml` e `**/*.acceptance-spec.yaml` sono **read-only** per il test-healer. Invariante senza eccezioni automatiche e non disabilitabile via config (`acceptance_spec_immutable: true` non overridabile, analogo a `to_artifact: off` nel compression layer).

Priorità su qualsiasi `confidence_score`: anche con confidence 0.99 nessuna scrittura su acceptance-spec YAML; nessun path di bypass.

Trigger di escalazione: (1) classificazione `WRONG_ASSERTION`; (2) il repair richiederebbe la modifica di un file che matcha i glob acceptance-spec. **Glob check pre-write** prima di ogni write; se matcha → attivazione immediata Fase 5, senza eccezioni.

Azione obbligatoria quando Fase 5 si attiva: (1) interrompi il repair (nessuna modifica al working tree); (2) non aprire PR con modifiche a acceptance-spec; (3) produci report:

```json
{
  "test_id": "<suite>::<test-name>",
  "classification": "WRONG_ASSERTION",
  "confidence": 0.00,
  "evidence": "<diff leggibile osservato vs atteso nello YAML>",
  "required_human_action": "UPDATE_ACCEPTANCE_SPEC",
  "acceptance_spec_path": "<path YAML coinvolto>",
  "rationale": "Il comportamento diverge dall'acceptance-spec in modo semanticamente intenzionale. Aggiornare lo spec richiede deliberazione umana."
}
```

`required_human_action: "UPDATE_ACCEPTANCE_SPEC"` è obbligatorio. (4) Salva il report in `analytics/qa/healing-proposals/<test_id>-<YYYY-MM-DD>-escalation.json`; (5) flagga il TSK `self_healing_status: needs_human_review`; (6) registra JSONL:

```json
{"type":"healing_action","test_id":"<suite>::<test-name>","classification":"WRONG_ASSERTION","confidence":0.00,"action_taken":"escalated_immutable_spec","iteration":1}
```

Il campo `evidence` deve contenere un diff leggibile (unified diff o tabella before/after) tra comportamento osservato (output attuale) e comportamento atteso (contenuto YAML acceptance-spec). È il materiale con cui l'umano decide: comportamento nuovo corretto → aggiorna lo spec; comportamento vecchio giusto → correggi il bug applicativo.

Configurazione:

```yaml
qa_layer:
  test_healing:
    enabled: false           # opt-in (R.P3) — EP-028
    max_attempts: 3          # loop bounded
    auto_apply_threshold: 0.95
    propose_threshold: 0.70
    healing_invariants:
      acceptance_spec_immutable: true   # INVARIANTE non overridabile
      acceptance_spec_glob: "**/acceptance-spec/*.yaml"
```

`acceptance_spec_immutable: true` non può essere impostato a `false`: il validation gate deve rifiutare una config con `false` emettendo errore fail-loud al boot.

Allineamento EP-018: `acceptance_spec_glob` deve essere coerente con il path di [functional-oracle-protocol](mdc:.cursor/skills/functional-oracle-protocol/SKILL.md) (default `fe_correctness.functional_oracle.acceptance_spec_glob: "code_quality/acceptance/*.acceptance.yaml"`). Se i due glob divergono → warning al boot:

```
WARNING: test_healing.acceptance_spec_glob differs from functional_oracle.acceptance_spec_glob.
Verify that both globs cover the same acceptance-spec files to avoid protection gaps.
```

Allineamento Fase 1: `WRONG_ASSERTION` è prodotta dalla Fase 1; la Fase 5 definisce l'azione *dopo* quella classificazione, quando il repair richiederebbe di modificare uno YAML acceptance-spec. Fase 1 classifica, Fase 5 enforce l'immutabilità.

## Riferimenti

- EP-028: `management/kanban/EP-028-test-self-healing/EP-028.md`
- EP-018: [functional-oracle-protocol](mdc:.cursor/skills/functional-oracle-protocol/SKILL.md)
- EP-027: [flakiness-detection-protocol](mdc:.cursor/skills/flakiness-detection-protocol/SKILL.md)
- Config: `factory.config.yaml` — blocco `qa_layer.test_healing`
- Audit trail: `analytics/events/qa-events.jsonl` (append-only, side-channel)
