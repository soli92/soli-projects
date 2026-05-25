# Skill: Promote Status

Transizioni di status ammesse per le pagine wiki.

## Transizioni valide

```
draft → review → approved
```

Non è possibile tornare indietro. Se una pagina `approved` necessita modifiche, creare una nuova versione o appendere `## Aggiornamenti (vYYYY-MM-DD)`.

## Procedura (Orchestrator)

1. Leggi il frontmatter della pagina indicata
2. Verifica che la transizione sia valida (es. `draft → review`)
3. Aggiorna `status:` e `updated:` nel frontmatter YAML
4. **Non toccare il corpo** della pagina
5. Append a `wiki/log.md`:

```markdown
## YYYY-MM-DD — Promote: <path>
- Status: <old> → <new>
```

## Auto-promotion suggerita

Se un concept page è citata da ≥ 2 US con status `committed`/`in-progress`:
- L'Orchestrator può **suggerire** (mai auto-applicare): "Considera promote <path> review"
