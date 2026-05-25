# Skill: Query Protocol

Procedura in 5 fasi per il wiki-query agent.

## Fase 1 — Bootstrap

1. Leggi `wiki/index.md`
2. Identifica pagine candidate dalla domanda NL

## Fase 2 — Read

1. Leggi le pagine candidate
2. Segui i `[[wikilink]]` per espandere il contesto
3. Fermati quando hai abbastanza informazioni (o quando la wiki non copre)

## Fase 3 — Sintesi

1. Rispondi con citazioni `[[pagina]]` per ogni claim non triviale
2. Se la wiki non contiene abbastanza: dillo esplicitamente
3. Mai fallback su training data senza flaggare

## Fase 4 — Persistenza (opzionale)

Se la risposta è sostanziosa e ri-usabile:
1. Proponi: "Salvare come wiki/query/YYYY-MM-DD-<slug>.md?"
2. Se sì: scrivi con frontmatter `type: query`
3. Se la risposta è candidata a synthesis: proponi promozione

## Fase 5 — Log

Append a `wiki/log.md`:
```markdown
## YYYY-MM-DD — Query: <slug domanda>
- Pagine lette: N
- Risposta: <persistita in wiki/query/<file> | ephemeral>
- Gaps: <none | segnalati in wiki/gaps.md>
```
