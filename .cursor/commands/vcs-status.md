# /vcs-status — snapshot read-only dello stato branch/HEAD/drift (EP-034)

Mostra uno **snapshot read-only** dello stato VCS della factory: per ogni target (`code_paths`
entry o legacy `vcs:`) — e per ogni git submodule — riporta branch corrente, branch atteso, stato
HEAD (detached?), submodule non inizializzato, e drift parent-ref vs submodule-HEAD. Per ogni
anomalia stampa **il comando esatto** per sistemarla.

Pensato per i progetti con repository sotto **git submodule**, dove «su quale branch sto / su quale
devo stare» è ambiguo per la natura dei due HEAD (parent + submodule).

**Read-only assoluto (R.B7)**: non esegue mai `checkout`, `commit`, `fetch`, `pull`, `reset`,
`submodule update`. Solo comandi git di lettura. Non è un gate: informa, non blocca.

Funziona **anche a `branch_awareness.enabled: false`** (esecuzione esplicita = volontà esplicita).
Il gate automatico pre-dispatch è separato (vive in
[dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) Fase 0, gated da `dispatch_gate`).

---

## Utilizzo

```
/vcs-status              # tutti i target
/vcs-status backend-api  # solo il target indicato
```

## Comportamento

Invoca la skill [vcs-preflight-protocol](mdc:.cursor/skills/vcs-preflight-protocol/SKILL.md) (5
step): Bootstrap → raccolta stato read-only per target → expected branch via
[branch-resolver](mdc:.cursor/skills/branch-resolver/SKILL.md) → verdict → tabella + remediation.

Output tipico:

```
| target       | mode      | branch corrente  | branch atteso | HEAD       | drift             | verdict |
|--------------|-----------|------------------|---------------|------------|-------------------|---------|
| backend-api  | submodule | (detached @a1b2) | tsk-042-...   | ⚠ detached | ✗ parent≠sub      | ACTION  |
| frontend-web | sibling   | develop          | develop       | ✓          | —                 | OK      |

ACTION — backend-api:
  git -C ./code/backend checkout tsk-042-add-login-endpoint

3 target · 2 OK · 1 ACTION
```

## Note

- Se un submodule non è inizializzato → suggerisce `git submodule update --init <path>`.
- Il drift parent-ref vs submodule-HEAD non viene mai risolto automaticamente: la direzione
  (allineare il parent al submodule o viceversa) è una decisione umana.
- Cross-link: skill [vcs-preflight-protocol](mdc:.cursor/skills/vcs-preflight-protocol/SKILL.md),
  [branch-resolver](mdc:.cursor/skills/branch-resolver/SKILL.md); PATTERN §15 §Branch Awareness
  Layer; ADR-EP034-001.
