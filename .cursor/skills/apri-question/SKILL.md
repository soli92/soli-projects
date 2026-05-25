# Skill: Apri Question

Template per domande bloccanti/non-bloccanti in `management/questions.md`.

## Template

Append nella sezione `## [APERTE]` di `management/questions.md`:

```markdown
### Q_NNN — <Titolo domanda>
**Bloccante:** hard | soft
**Origine:** <agente> @ <artefatto>
**Contesto:** <perché serve chiarimento>
**Impatto:** <cosa è bloccato se hard>
**Creata:** YYYY-MM-DD
```

## Risoluzione

Quando risolta, spostare nella sezione `## [RISOLTE]` con:

```markdown
### Q_NNN — <Titolo>
**Risposta:** <sintesi decisione>
**Risolta:** YYYY-MM-DD
**Da:** <chi ha deciso>
```

## Regole

- NNN = 3 cifre zero-padded, sequenziale
- `hard` = blocca le US dipendenti (gate L4)
- `soft` = si può procedere con `pending_clarification`
- Pre-v2.6 default: trattare come `hard`
