# Skill: Scrivi User Story

Template per `management/kanban/EP-XXX-<slug>/US-YYY-<slug>/US-YYY.md`.

## Template

```markdown
---
id: US-YYY
title: "<Titolo storia>"
role: "<Chi beneficia>"
priority: high | medium | low
status: draft
wiki_page: "<pagina-wiki-correlata>"
blocked_by: []
---
# US-YYY — <Titolo>

## Come <ruolo>, voglio <azione> per <beneficio>

## Contesto
<Riferimenti a [[pagine-wiki]]>

## Criteri di accettazione
- [ ] ...

## Note tecniche
<Vincoli emersi dalla wiki, mai prescrizioni di implementazione>
```

## Naming

- Cartella: `management/kanban/EP-XXX-<slug>/US-YYY-<slug>/`
- File: `US-YYY.md` dentro la cartella
- Epic deducibile dal path (non duplicare nel frontmatter)

## Regole

- `role` obbligatorio (chi beneficia)
- `blocked_by` lista di `Q_NNN` aperte (se nessuna: array vuoto)
- `wiki_page` collega alla pagina wiki più rilevante
