# Skill: Scrivi Epica

Template per `management/kanban/EP-XXX-<slug>/EP-XXX.md`.

## Template

```markdown
---
id: EP-XXX
title: "<Titolo epica>"
status: draft
priority: high | medium | low
confidence: XX%
confidence_rationale: "<perché questo livello>"
wiki_pages: [<pagine-wiki-correlate>]
created: YYYY-MM-DD
---
# EP-XXX — <Titolo>

## Obiettivo
<1-2 frasi che descrivono il valore di business>

## Contesto
<Riferimenti a [[pagine-wiki]] che motivano l'epica>

## Storie
- US-YYY — <titolo> (`status: draft`)
- ...

## Criteri di accettazione
- [ ] ...

## Rischi e dipendenze
- ...
```

## Naming

- Cartella: `management/kanban/EP-XXX-<slug>/`
- File: `EP-XXX.md` dentro la cartella
- XXX = 3 cifre zero-padded, sequenziale globale
- Slug: lowercase, max 40 char

## Regole

- Mai tecnologia specifica (solo dati e interfacce)
- `confidence` obbligatorio con `confidence_rationale`
- Ogni epica deve essere tracciabile a pagine wiki via `wiki_pages`
