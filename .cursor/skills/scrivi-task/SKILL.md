# Skill: Scrivi Task

Template per `management/kanban/EP-XXX-<slug>/US-YYY-<slug>/TSK-ZZZ.md`.

## Template

```markdown
---
id: TSK-ZZZ
sprint: <N>
layer: be | fe | db | qa | infra
consumer: human
priority: high | medium | low
estimate: <ore o story points>
status: todo
---
# TSK-ZZZ — <Titolo atomico>

## Descrizione
<Cosa fare, in modo testabile e atomico>

## Riferimenti
- US: [[US-YYY]]
- ADR: [[ADR-NNN]] (se applicabile)
- Wiki: [[concept-correlato]]

## Criteri di done
- [ ] ...
```

## Naming

- File: `TSK-ZZZ.md` dentro la cartella della US corrispondente
- Story e Epic deducibili dal path

## Regole

- **Atomicità**: un task = una unità testabile
- `consumer: human` (topologia plan-only, nessun dev-agent)
- `layer` obbligatorio (be/fe/db/qa/infra)
- `sprint` obbligatorio
- Mai "Crea modulo X" → spezza in task atomici
