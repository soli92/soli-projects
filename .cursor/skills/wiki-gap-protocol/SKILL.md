# Skill: Wiki Gap Protocol

Formato gap e ciclo apertura/chiusura per il canale `wiki/gaps.md`.

## Apertura (qualsiasi agente L3+)

Append a `wiki/gaps.md`:

```markdown
## YYYY-MM-DD HH:MM — <slug-gap>
**Origine:** <agente> @ <artefatto in lavorazione>
**Gap:** <cosa manca in wiki/>
**Sospetta fonte:** <raw da ingerire | "nessuna fonte chiara, serve nuovo raw">
**Impatto:** <quale produzione è frenata>
**Bloccante:** sì | no  (se sì, riferisci Q_NNN)
```

## Chiusura (wiki-keeper)

Quando un gap viene colmato da un ingest o synthesis:

```markdown
**Risolto:** YYYY-MM-DD — [[<pagina-wiki-che-colma>]]
```

Poi:
1. Append a `wiki/log.md` con marker `gap-closed: <slug>`
2. Se il gap citava una `Q_NNN` risolta contestualmente: esegui `propagate-resolution`

## Regole

- Mai eliminare un gap entry: solo appendere `**Risolto:**`
- Il wiki-keeper legge `wiki/gaps.md` all'inizio di ogni run (Fase 0 di ingest)
- I gap non bloccanti non fermano il PM (solo i bloccanti con Q_NNN hard)
