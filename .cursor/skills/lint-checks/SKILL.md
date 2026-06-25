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

## Check 4ag — Staleness Wiki Pages (WARNING, always-on — EP-031)

**Trigger**: sempre attivo — nessun flag richiesto.
**Severità**: WARNING se > 365 gg, INFO se > 180 gg. Non blocca il lint totale.

1. Scansiona `wiki/**/*.md` (escludi `log.md`, `lint/`, `sources/`, `index.md`).
2. Leggi `updated:` (o `created:` se `updated:` assente) dal frontmatter YAML.
3. Calcola `age_days = today − updated`.
4. Emetti:
   - `age_days > 365` → WARNING `[Check 4ag] STALE: <path> — ultimo aggiornamento <N> giorni fa (soglia: 365)`
   - `age_days > 180` → INFO `[Check 4ag] INFO: <path> — non aggiornata da <N> giorni (soglia: 180)`
   - `age_days ≤ 180` → skip silenzioso.
5. Pagine senza `updated:` e senza `created:` → WARNING `[Check 4ag] MISSING-DATE: <path>`.

Invarianti: zero API call; deterministico; non blocca il lint totale; esclude `lint/` e `sources/`.

## Check 4af — Embedding Similarity Wiki vs PATTERN (INFO only — EP-031)

**Trigger**: `wiki_lint.semantic_check.enabled: true` (default `false` → skip totale).
**Severità**: INFO — mai WARNING, mai ERROR. Non blocca pipeline. Non è un gate.

1. Scansiona `wiki/**/*.md` con frontmatter `pattern_section: "§N"`.
   Pagine senza questo campo → skip silenzioso.
2. Per ogni pagina candidata: calcola embedding del body della pagina e della
   sezione `§N` estratta da `PATTERN.md`, poi similarità coseno.
3. Se `score < wiki_lint.semantic_check.similarity_threshold` (default 0.75):
   → INFO `[Check 4af] <path> — §N — score: X.XX (< 0.75)`
4. Stima costo prima del scan; se > `cost_warn_usd` → chiedi conferma esplicita.
5. Se `output_report: true` → scrivi
   `<output_report_path>/wiki-lint-semantic-<YYYY-MM-DD>.md`.

Invarianti: `enabled: false` → zero API call; mai ERROR; idempotente.
Vedi `wiki/runbooks/semantic-drift-prerequisites.md` per configurazione.
