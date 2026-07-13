# /compression — configura e ispeziona il Compression Layer (PATTERN §20, v2.14)

Configura e ispeziona l'asse **output** del Compression Layer (via [caveman-protocol](mdc:.cursor/skills/caveman-protocol/SKILL.md)). Sub-comandi `show`/`set`/`policy`/`dry-run`. Asse **context** (Graphify) → v2.15.

## Sintassi

```
/compression                          → equivalente a /compression show
/compression show                     → mostra config compression corrente + ultime stats
/compression set <key> <value>        → modifica un campo (es. enabled, policy_profile)
/compression policy <profile>         → shortcut: cambia policy_profile
/compression dry-run --payload="<t>"  → comprimi un payload di test (no log, no side effects)
```

## Comportamento per sub-comando

### `show`

Legge `factory.config.yaml.compression.output` e mostra in chat (read-only, nessuna modifica):

```
COMPRESSION CONFIG (v2.14)
==========================
Provider:            caveman
Enabled:             true/false
Policy profile:      conservative / aggressive / custom
Chain depth ceiling: true (threshold=3) / false
Cross-factory:       off (R.C4)
Drift fallback:      enabled (markers: AMBIGUOUS_HANDOFF, REQUEST_CLARIFY)
Audit trail for:     propagate-resolution, feedback-router

CANALI ATTIVI (da policy_profile)
canale                          livello   invariante
orchestrator_to_subagent        full      no
subagent_to_tool                ultra     no
tool_to_subagent                lite      no
subagent_to_orchestrator        full      no
sibling_to_sibling              full      no
feedback_router_to_devagent     full      no
to_user                         off       R.C1 YES (non overridabile)
to_artifact                     off       R.C1 YES (non overridabile)
propagate_resolution            off       R.C1 YES (non overridabile)

ULTIMA SESSIONE (da wiki/log.md, marker `compression`):
  Data: <data>
  Profile: conservative
  Wave size: 4 TSK paralleli
  tokens_in:  raw=15.2k → compressed=7.4k  (ratio 0.49, ~$0.90 saved)
  tokens_out: raw=8.3k  → compressed=3.9k  (ratio 0.47)
  Drift events: 0
```

### `set <key> <value>`

Esempi: `/compression set enabled true`, `/compression set policy_profile aggressive`, `/compression set chain_depth_threshold 4`, `/compression set cross_factory off`.

Modifica `factory.config.yaml.compression.output.<key>`. Gate di coerenza:

- `enabled: true` ⇒ verifica `caveman --version`. Se assente → mostra `install_command` e attendi conferma esplicita (mai auto-install).
- `policy_profile: custom` ⇒ chiede in chat di valorizzare il blocco `channels` completo (modalità conversazionale; scrivi solo se l'utente conferma).
- `cross_factory: on` ⇒ mostra warning su R.C4 e chiede doppia conferma esplicita (default OFF per design).
- Modifica di campi `invariants.*` → **RIFIUTATO** con messaggio: «R.C1 non overridabile. Vedi PATTERN §20.4».

### `policy <profile>`

Shortcut per `/compression set policy_profile <profile>`. Esempi: `/compression policy conservative`, `/compression policy aggressive`, `/compression policy custom`. Passando a `custom`, il comando guida l'utente attraverso la configurazione dei 6 canali in modalità conversazionale.

### `dry-run --payload="<text>" [--channel=<C>] [--profile=<P>] [--chain-depth=<D>]`

Test offline della compressione. Invoca [caveman-protocol](mdc:.cursor/skills/caveman-protocol/SKILL.md) §Fase 2-3 (Identify Channel + Apply Compression) **senza** scrivere `wiki/log.md` né side-effects.

```
DRY-RUN COMPRESSION
===================
Channel:         orchestrator_to_subagent
Profile:         conservative
Effective level: full (chain_depth=2, no R.C3 downgrade)
Tokens in:       247
Tokens out:      113
Ratio:           0.46

INPUT (raw):
"Could you please help me by reading the file at path/to/file.py and ..."

OUTPUT (compressed):
"Read path/to/file.py → extract fn signatures → ret JSON"
```

Utile per: verificare la allow-list (R.C2) per canali non standard; misurare la compressione su payload tipici prima di abilitarla in prod; debugging di drift su payload specifico.

## Prerequisiti

- `factory.config.yaml.compression.output.enabled: true` per i comandi che attivano compressione runtime (`set`/`policy` che richiedono test). `show` e `dry-run` funzionano anche con `enabled: false`.
- [[caveman]] installato (test via `caveman --version`).
- I token di compressione non sono mai usati nei comandi (la skill è prompt-based, no auth esterna).

## Idempotenza

`set` e `policy` sono idempotenti per (key, value): ripetere lo stesso comando non duplica nulla. `show` e `dry-run` sono read-only.

## Vincoli (PATTERN §7 r.18 + §20.4 R.C1–R.C6)

- Mai abilitare compressione su `to_user`, `to_artifact`, `propagate_resolution` (R.C1 enforced — `/compression set invariants.*` rifiutato).
- Mai modifica automatica del `policy_profile` a runtime (richiede comando esplicito + gate umano).
- Mai modifica di `cross_factory: on` senza doppia conferma (R.C4).
- Token di compressione/install: mai committati nel repo; l'install è manuale.

Vedi [caveman-protocol](mdc:.cursor/skills/caveman-protocol/SKILL.md) per la procedura completa, PATTERN §20 per il contratto «Output Compression Layer», [[factory-compression-layer]] per il design rationale.
