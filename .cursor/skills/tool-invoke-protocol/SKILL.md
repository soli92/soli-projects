# Skill: Tool Invoke Protocol

> Adapter Cursor della skill `tool-invoke-protocol` (v1.0).

**Scopo:** standardizzare la risoluzione del path di invocazione di uno strumento della factory indipendentemente dall'adapter.

## Regole

**R.TI.1** — Tutti i tool della factory vivono in `tools/` alla root del repo. I path `.claude/tools/` sono shim backward-compat.

**R.TI.2** — Il path root è risolto tramite:

- (a) `$CLAUDE_PROJECT_DIR` per Claude Code
- (b) `${workspaceFolder}` (env VS Code) per Cursor
- (c) Path relativo `./tools/` da CWD per lancio manuale
- (d) Adapter-specific binding (vedi binding table)

**R.TI.3** — I path `.claude/tools/` sono shim backward-compat e **non devono essere usati in nuovo codice**. Usa sempre `tools/<subfolder>/` nei nuovi skill/rule.

## Binding table

| Adapter | Risoluzione root |
|---|---|
| Claude Code | `$CLAUDE_PROJECT_DIR` |
| Cursor | `${workspaceFolder}` (VS Code env) |
| Aider | CWD al lancio (assume root repo) |
| Lancio manuale | CWD = root repo |

## Esempio invocazione da skill/rule

```bash
# Cursor (VS Code env)
bash "${workspaceFolder}/tools/a11y/a11y-scan.sh" --target <url>

# Claude Code
bash "$CLAUDE_PROJECT_DIR/tools/a11y/a11y-scan.sh" --target <url>

# Lancio manuale (dalla root del repo)
bash tools/a11y/a11y-scan.sh --target <url>

# Python tool
python3 "${workspaceFolder}/tools/analytics/show-session-tokens.py" --full
```
