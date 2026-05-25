# Skill: Citation Rules

Grammatica delle citazioni e wikilink per la knowledge base.

## Citazione fonte

Ogni claim non triviale (≥ 20 parole, non common knowledge) DEVE avere una citazione:

```
[^src: raw/<repo>-agents.md §<sezione>]
[^src: raw/<repo>-ai-log.md §Fase 3]
[^src: raw/<nome>.txt §<header>]
```

La sezione (`§`) è un header markdown del file citato.

## Wikilink interni

Per link interni alla wiki usare **sempre** la sintassi Obsidian:

```
[[nome-pagina-senza-estensione]]
```

**Mai** path relativi (`../../wiki/concepts/foo.md`). Solo `[[foo]]`.

## Regole

1. Claim senza citazione = claim invalido (segnalato dal Lint).
2. Common knowledge ("Node.js è un runtime JavaScript") non richiede citazione.
3. Ogni pagina wiki deve avere almeno un incoming `[[wikilink]]` da un'altra pagina.
4. Preferire parafrasi a citazione diretta. Citazioni dirette sotto 15 parole.
5. Mai citare la stessa fonte due volte nella stessa pagina con la stessa citazione.

## Cascade di citazione per layer

| Layer | Cita direttamente | Cita transitivamente |
|---|---|---|
| L2 (wiki) | `raw/**` via `[^src: ...]` | — |
| L3 (management) | `wiki/**` via `[[...]]` | `raw/` via wiki |
| L4 (architecture) | `management/**` via `[^src: ...]`, `wiki/**` per contesto | `raw/` via wiki |
