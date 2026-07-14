# Skill: Ingest Protocol

Procedura in 5 fasi per il wiki-keeper quando ingerisce nuove sorgenti da `raw/`.

## Fase 0 — Bootstrap

1. Glob `raw/` → lista file sorgente
2. Leggi `raw/.extraction-manifest.json` → identifica file non ancora ingeriti
3. Leggi `wiki/gaps.md` → identifica gap aperti da colmare
4. Leggi `wiki/index.md` + pagine plausibilmente correlate

## Fase 1 — Analisi

Per ogni nuova sorgente:
1. Leggi il file completo (non skimmare)
2. Identifica: concept di dominio, entity (repo, servizi, persone), relazioni cross-repo
3. Per sorgenti cross-repo (AGENTS.md dei singoli repo):
   - Stack tecnologico
   - Integrazioni con altri repo (webhook, submodule, RAG, ecc.)
   - Convenzioni e pattern ricorrenti
   - Comandi e workflow

## Fase 2 — Proposta

Mostra all'umano:
- Lista pagine da **creare** (path + titolo)
- Lista pagine da **aggiornare** (path + cosa cambia)
- **Contraddizioni** rilevate vs wiki esistente
- Concept menzionati che **non** riceveranno una pagina (con motivazione one-line)

**STOP — attendi conferma.**

## Fase 3 — Scrittura

Per ogni pagina confermata:
1. Scrivi/aggiorna seguendo il template `scrivi-wiki-page`
2. Aggiungi `[[wikilink]]` aggressivamente (primo meaningful occurrence)
3. Verifica che ogni pagina abbia almeno un incoming link
4. Aggiorna `wiki/index.md` se nuove pagine top-level

## Fase 4 — Log

Append a `wiki/log.md`:
```markdown
## YYYY-MM-DD — Ingest: <lista sorgenti>
- Created: <path>, <path>, ...
- Updated: <path>, <path>, ...
- Contradictions: <none | descrizione>
- Notes: <concept non paginati e perché>
```

## Fase 5 — VCS handoff (OBBLIGATORIA, ACC-05 TR-20260714-14)

Al termine della Fase 4, verifica lo stato del repository:

```
git status --short wiki/ raw/
```

Se risultano file modified o untracked nelle directory `wiki/` e `raw/`:
1. Proponi in chat il commit con il messaggio pre-compilato:
   ```
   docs(ingest): <key> — <N> pagine wiki aggiornate/create
   ```
2. Attendi conferma esplicita o esegui il commit se il contesto è autonomo
   (flag `auto_commit: true` o sessione scheduler).
3. Se il commit ha successo, segnala in chat: `VCS: commit effettuato — wiki/ e raw/ puliti.`

**Motivazione**: ogni ingest deve chiudersi con un repository in stato committato.
Modifiche non committate a `wiki/` e `raw/` rischiano di essere sovrascritte o di
creare conflitti in sessioni successive. (ACC-05 TR-20260714-14)

## Regole speciali per KB cross-progetto

- Una **source page** per repository in `wiki/sources/<repo-name>.md`
- **Concept pages** per temi trasversali: auth patterns, deploy strategies, design system, RAG pipeline, testing conventions, ecc.
- **Entity pages** per servizi/prodotti: Supabase, Vercel, Anthropic, SoliDS, ecc.
- Relazioni cross-repo esplicite con wikilink (es. soli-agent usa soli-prof per RAG)
