# Skill: Wiki Log Entry

Template per entry di `wiki/log.md` per tipo di operazione.

## Formato

Ogni entry è un heading H2 con data e tipo, seguita da bullet points.

### Ingest

```markdown
## YYYY-MM-DD — Ingest: <lista sorgenti comma-separated>
- Created: <path>, <path>, ...
- Updated: <path>, <path>, ...
- Contradictions: <none | descrizione breve>
- Notes: <concept non paginati e perché>
```

### Query

```markdown
## YYYY-MM-DD — Query: <slug domanda>
- Pagine lette: N
- Risposta: <persistita in wiki/query/<file> | ephemeral>
- Gaps: <none | segnalati in wiki/gaps.md>
```

### Lint

```markdown
## YYYY-MM-DD — Lint
- Errors: N
- Warnings: M
- Heal-eligible: K
- Report: wiki/lint/<file>
```

### Promote

```markdown
## YYYY-MM-DD — Promote: <path>
- Status: <old> → <new>
```

### Heal

```markdown
## YYYY-MM-DD — Heal (iter N)
- Fixed: <count>
- Report: <path-lint-report>
- Categories: <tipo> (N), ...
```

### Gap closed

```markdown
## YYYY-MM-DD — Gap closed: <slug>
- Pagina: [[<pagina-che-colma>]]
- Reconcile: <none | US-XXX>
```

## Regole

- Append-only: mai modificare entry esistenti
- Ordine cronologico discendente (più recente in fondo)
- Ogni operazione che modifica la wiki DEVE appendere qui
