# Skill: Flakiness Detection Protocol

> Adapter Cursor della skill `flakiness-detection-protocol` (EP-027, Sprint 28). Rilevamento statistico di test flaky per [qa-dev](mdc:.cursor/rules/qa-dev.mdc). Dipende da `analytics/events/qa-events.jsonl` (event store side-channel EP-009).

Documenta il contratto dati (schema JSONL) e l'algoritmo del flakiness score che [qa-dev](mdc:.cursor/rules/qa-dev.mdc) usa per decidere se un test è flaky.

**Gate:** no-op totale se `qa_layer.flakiness_detection.enabled: false` in `factory.config.yaml`. Con il flag spento, [qa-dev](mdc:.cursor/rules/qa-dev.mdc) si comporta identicamente a v2.21 senza side effect.

## Sezione 1 — Schema JSONL evento `test_run`

Path store canonico: `analytics/events/qa-events.jsonl` — separato da `task-events.jsonl` (EP-009) per isolamento schema. Non gitignored di default (audit trail necessario per il calcolo dello score nel tempo).

Ogni record è una riga JSON newline-delimited:

```jsonl
{"type":"test_run","test_id":"<univoco>","tsk_id":"TSK-NNN","outcome":"pass|fail|skip","run_at":"<ISO 8601>","suite":"<opzionale>"}
```

| Campo | Tipo | Obbl. | Descrizione |
|---|---|---|---|
| `type` | stringa | SI | Costante `"test_run"` — discrimina dagli eventi TSK EP-009 (`type: "tsk_*"`) |
| `test_id` | stringa | SI | Univoco: `scenario.id` + `suite` per test EP-018; hash deterministico del nome file per gli altri |
| `tsk_id` | stringa | SI | TSK padre che ha originato l'esecuzione (es. `"TSK-123"`) |
| `outcome` | enum | SI | `"pass"` \| `"fail"` \| `"skip"` |
| `run_at` | stringa | SI | Timestamp ISO 8601 UTC (es. `"2026-06-25T10:30:00Z"`) |
| `suite` | stringa | NO | Nome suite / file di test |

Esempio:

```jsonl
{"type":"test_run","test_id":"login-happy-path","tsk_id":"TSK-201","outcome":"pass","run_at":"2026-06-25T10:30:00Z","suite":"e2e/auth"}
{"type":"test_run","test_id":"login-happy-path","tsk_id":"TSK-201","outcome":"fail","run_at":"2026-06-25T11:45:00Z","suite":"e2e/auth"}
```

## Sezione 2 — Algoritmo flakiness score (rolling window)

Formula:

```
flakiness_score = failure_count / min(total_runs, 50)
```

- `total_runs` = numero totale di record con il `test_id` target in `qa-events.jsonl`
- `window_size` = `min(total_runs, 50)` — le ultime N run (rolling window)
- `failure_count` = numero di record con `outcome: "fail"` nella window

Procedura (read-only, idempotente):

1. **Filtra** il JSONL per `test_id` target.
2. **Seleziona** le ultime `min(total_runs, 50)` run ordinate per `run_at` decrescente.
3. **Conta** `failure_count` nella window.
4. **Calcola** `flakiness_score = failure_count / window_size`.
5. **Arrotonda** a 2 decimali (es. `0.33`).

Proprietà: output float `[0.0, 1.0]` a 2 decimali, oppure `"insufficient_data"`. Idempotente e read-only (la scrittura eventi avviene solo a fine sessione test da parte di qa-dev).

**Label `insufficient_data`:** se `total_runs < 10` → non emettere score, non produrre verdetto di quarantena, restituire `"insufficient_data"`. Evita falsi positivi su test nuovi o rari.

Esempi:

| total_runs | failure_count (window) | flakiness_score |
|---|---|---|
| 5 | 2 | `"insufficient_data"` (< 10 run) |
| 10 | 3 | `0.30` |
| 20 | 4 | `0.20` |
| 50 | 10 | `0.20` |
| 80 | 10 | `0.20` (window = 50, non 80) |
| 50 | 0 | `0.00` |
| 50 | 50 | `1.00` |

## Sezione 3 — Gate opt-in

No-op quando `qa_layer.flakiness_detection.enabled: false`. Con flag spento: [qa-dev](mdc:.cursor/rules/qa-dev.mdc) non legge `qa-events.jsonl` per lo score, non legge né scrive `analytics/qa/quarantine.json`, pipeline identica a v2.21 (backward compat totale, R.P3).

Attivazione:

```yaml
# factory.config.yaml
qa_layer:
  flakiness_detection:
    enabled: true
```

## Sezione 4 — Allineamento EP-009 (event store JSONL)

**Dipendenza hard:** EP-009 è prerequisito. `analytics/events/` deve esistere e `analytics.measurement.enabled: true`.

Il campo `type: "test_run"` discrimina gli eventi QA dagli eventi TSK di EP-009 (`type: "tsk_*"`). Schemi affiancati nello stesso side-channel ma in file separati:

| File | Schema | Prodotto da |
|---|---|---|
| `analytics/events/task-events.jsonl` | eventi TSK (`type: "tsk_*"`) | EP-009 harvest-session-tokens + qa-dev |
| `analytics/events/qa-events.jsonl` | eventi test run (`type: "test_run"`) | qa-dev (questa skill) |

La separazione evita contaminazione dello schema EP-009 e mantiene retrocompatibilità con factory EP-009 senza EP-027. La formalizzazione in ADR è residuo del 28% di confidence (EP-027 §Confidence).

## Sezione 5 — Quarantena automatica reversibile

Path registro: `analytics/qa/quarantine.json` — committato nel repo (audit trail per PM e lead-architect). Prodotto a runtime da qa-dev alla prima messa in quarantena; factory senza EP-027 attivo non lo producono.

Schema:

```json
{
  "quarantined": [
    {
      "test_id": "<stringa>",
      "quarantined_at": "<ISO 8601>",
      "reason": "score_exceeded_threshold",
      "last_score": 0.34,
      "consecutive_passing_runs": 0,
      "quarantined_since_runs": 0,
      "status": "quarantined"
    }
  ]
}
```

| Campo | Tipo | Descrizione |
|---|---|---|
| `test_id` | stringa | Corrisponde al `test_id` del sotto-schema JSONL (Sezione 1) |
| `quarantined_at` | stringa | ISO 8601 UTC della prima quarantena |
| `reason` | stringa | Costante `"score_exceeded_threshold"` (unica causa in EP-027) |
| `last_score` | float | Ultimo `flakiness_score` calcolato all'ingresso/aggiornamento |
| `consecutive_passing_runs` | int | Run consecutive `pass` post-quarantena |
| `quarantined_since_runs` | int | Run totali dalla quarantena (usato da Lint Check 4ae) |
| `status` | enum | `"quarantined"` \| `"monitoring"` \| `"released"` |

Transizioni di stato:

```
(non in quarantena) --score > threshold_quarantine (0.20)--> quarantined
quarantined         --score < threshold_release (0.05)-----> monitoring
monitoring          --consecutive_passing_runs >= release_consecutive_runs (10)--> released
```

Regole:

- **Ingresso** (`→ quarantined`): `flakiness_score > threshold_quarantine` (default `0.20`) e test non già in quarantena; entry con `status: "quarantined"`, contatori a 0.
- **Monitoraggio** (`quarantined → monitoring`): `flakiness_score < threshold_release` (default `0.05`) ma `consecutive_passing_runs` sotto soglia; `status: "monitoring"` quando `consecutive_passing_runs > 0` e score sotto la soglia di release.
- **Uscita** (`monitoring → released`): `flakiness_score < threshold_release` PER `consecutive_passing_runs >= release_consecutive_runs` (default `10`), entrambe simultanee.

Comportamento pipeline con quarantena attiva:

- **Gate pass/fail:** test `status: "quarantined"` **ESCLUSI** dal verdetto finale della wave QA.
- **Report QA:** test in quarantena con label `[QUARANTINED]` in sezione separata.
- **Modalità advisory:** qa-dev esegue i quarantinati in modalità non-blocking per raccogliere dati; l'esito non contribuisce al gate.
- **Orchestratore:** la wave advisory è gated da `qa_layer.flakiness_detection.enabled: true`.

Procedura qa-dev post-sessione:

1. Per ogni `test_id` eseguito, calcola `flakiness_score` (Sezione 2).
2. **Nuovo test flaky** (`score > threshold_quarantine`, non nel registro): aggiungi entry `status: "quarantined"`, contatori a 0.
3. **Test già in quarantena** (`status` in `["quarantined","monitoring"]`):
   - `outcome == "pass"` → incrementa `consecutive_passing_runs`.
   - `outcome == "fail"` → azzera `consecutive_passing_runs`.
   - Incrementa `quarantined_since_runs` di 1 per sessione.
   - `score < threshold_release` AND `consecutive_passing_runs >= release_consecutive_runs` → `status: "released"`.
   - `score < threshold_release` AND `consecutive_passing_runs > 0` (non a soglia) → `status: "monitoring"`.
4. Scrivi il registro aggiornato in `analytics/qa/quarantine.json`.

Gate opt-in: tutta la procedura è no-op se `qa_layer.flakiness_detection.enabled: false` (file né letto né scritto).

Soglie configurabili sotto `qa_layer.flakiness_detection.*`:

| Chiave | Default | Descrizione |
|---|---|---|
| `score_threshold` | `0.20` | Soglia ingresso quarantena (`flakiness_score > soglia`) |
| `release_threshold` | `0.05` | Soglia per iniziare monitoring verso uscita |
| `release_consecutive_runs` | `10` | Run consecutive passing richieste per `released` |
| `rolling_window` | `50` | Dimensione rolling window score (Sezione 2) |
| `stale_threshold` | `100` | Run in quarantena senza revisione → Lint Check 4ae WARNING |
