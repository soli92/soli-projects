# Skill: Heal Protocol

Ciclo evaluator-optimizer vincolato per ERROR meccanici heal-eligible.

## Prerequisiti

- Un lint report con `heal_eligible_count > 0`
- Conferma umana prima di procedere

## Whitelist chiusa (3 categorie)

1. **`broken-wikilink`** — fuzzy match ≥ 0.90 con pagina esistente → correggi il link
2. **`missing-frontmatter-field`** — campo deducibile dal path (es. `type` da `wiki/concepts/`) → aggiungi
3. **`citation-section-mismatch`** — edit-distance ≤ 3 tra sezione citata e sezione reale → correggi

**Tutto il resto** (WARNING, ERROR fuori whitelist) → non toccare.

## Procedura

1. Leggi il lint report indicato
2. Filtra solo le entry `heal-eligible`
3. **Mostra piano bulk** all'umano: lista di fix proposti
4. **Attendi conferma**
5. Applica i fix (max 3 iterazioni se un fix ne genera altri)
6. Append a `wiki/log.md`:

```markdown
## YYYY-MM-DD — Heal (iter N)
- Fixed: <count> errors
- Report: <path-lint-report>
- Categories: broken-wikilink (X), missing-frontmatter (Y), citation-mismatch (Z)
```

## Regole

- Max 3 iterazioni
- Mai correggere WARNING
- Mai correggere ERROR fuori dalla whitelist
- Gate umano bulk obbligatorio
