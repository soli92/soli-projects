# Skill: Scrivi Wiki Page

Template per una pagina wiki karpathy-style.

## Template

```markdown
---
type: <source | concept | entity-person | entity-org | entity-product | synthesis | overview>
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [<raw-filename-1>, <raw-filename-2>]
status: draft
---
# <Titolo>

> Definizione o tesi in una frase.

## Summary
2–4 frasi. Linguaggio piano.

## Key points
- Bullet con citazione `[^src: raw/<file> §<sezione>]`.
- Ogni claim non triviale citato.

## Connections
- Related: [[altra-pagina]] — una riga sulla relazione.
- Contrasts with: [[altra-pagina]] — una riga.

## Open questions
- Cose che la wiki non ancora copre.
```

## Regole

- Adattare il template al contenuto; non imbottire per riempire sezioni.
- Una pagina per concetto/entità; non mega-pagine.
- `type` coerente con il path (`wiki/sources/` → `source`, `wiki/concepts/` → `concept`, ecc.).
- Frontmatter `sources` = lista dei filename raw usati (senza path `raw/`).
- `status: draft` alla creazione; `review` e `approved` solo via `promote`.

## Specializzazioni per tipo

- **Source page** (`wiki/sources/<repo>.md`): riassume un singolo raw; sezione `## Repo metadata` con stack, comandi, link.
- **Concept page** (`wiki/concepts/<tema>.md`): concetto trasversale; sezione `## Projects` con quali repo lo implementano.
- **Entity page** (`wiki/entities/<nome>.md`): servizio, libreria, piattaforma; sezione `## Usage` con come i repo lo usano.
