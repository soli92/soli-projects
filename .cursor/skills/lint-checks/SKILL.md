# Skill: Lint Checks

4 check strutturali + citation audit per il wiki-lint agent.

## Check 1 — Orphan pages

Glob `wiki/**/*.md` (escluso `index.md`, `log.md`, `gaps.md`).
Per ogni pagina: grep `[[<nome-pagina>]]` in tutte le altre pagine wiki.
Se zero incoming links → WARNING `orphan-page`.

## Check 2 — Dangling links

Grep `\[\[.*?\]\]` in tutti i file `wiki/**/*.md`.
Per ogni wikilink: verifica che esista `wiki/**/<nome>.md`.
Se non esiste → ERROR `dangling-link`.

**Heal-eligible**: se fuzzy match ≥ 0.90 con una pagina esistente → `heal-eligible: broken-wikilink`.

## Check 3 — Frontmatter

Per ogni file wiki: verifica frontmatter minimo per tipo (PATTERN §5):
- `type` presente
- `status` presente (se wiki page)
- `sources` presente (se wiki page, anche array vuoto)
- `id` presente (se epica/storia/task)

Campo mancante deducibile dal path → `heal-eligible: missing-frontmatter-field`.
Campo non deducibile → ERROR `missing-frontmatter`.

## Check 4 — Citations

Per ogni pagina wiki (escluso index, log, gaps):
- Identifica claim ≥ 20 parole senza `[^src: ...]` o `[[...]]`
- WARNING `uncited-claim` con riga e testo

### Check 4b — Citation section mismatch

Verifica che `[^src: <path> §<sezione>]` punti a una sezione reale del file citato.
Edit-distance ≤ 3 → `heal-eligible: citation-section-mismatch`.

## Output

Report: `wiki/lint/YYYY-MM-DD-lint-report.md` con:
```yaml
---
type: lint-report
created: YYYY-MM-DD
error_count: N
warning_count: M
heal_eligible_count: K
---
```

Append a `wiki/log.md`:
```markdown
## YYYY-MM-DD — Lint
- Errors: N
- Warnings: M
- Heal-eligible: K
- Report: wiki/lint/YYYY-MM-DD-lint-report.md
```
