---
type: gaps
created: 2026-05-25
---
# Wiki Gaps

> Canale di feedback loop append-only. Ogni agente L3+ che identifica un gap di knowledge base lo formalizza qui.
> Formato: `## YYYY-MM-DD HH:MM — <slug-gap>` con Origine, Gap, Sospetta fonte, Impatto.
> Chiusura: `**Risolto:** YYYY-MM-DD — [[<pagina>]]`.

<!-- Gap aperti verranno aggiunti qui sotto -->

## 2026-07-02 — wise-planeswalker-readme-stub

**Origine**: repo-sync wise-planeswalker (2026-07-02)
**Gap**: il README del repo wise-planeswalker è minimale ("Magic knowledge base", 2 righe). Mancano descrizione del progetto, quick-start, link a PATTERN.md e al wiki.
**Sospetta fonte**: `raw/2026-07-02-repo-wise-planeswalker.md §Gap evidenti`
**Impatto**: basso (documentazione, non bloccante per sviluppo). Riduce discoverability del repo.

## 2026-07-02 — wise-planeswalker-auth-stack-non-deciso

**Origine**: repo-sync wise-planeswalker (2026-07-02), EP-001
**Gap**: il meccanismo di autenticazione per koollector non è ancora deciso (JWT, OAuth2, device token). EP-001 identifica il gap ma non specifica la soluzione. Bloccante per deploy prod.
**Sospetta fonte**: `raw/2026-07-02-repo-wise-planeswalker.md §Epiche in kanban`, `wiki/sources/wise-planeswalker.md §Kanban`
**Impatto**: alto — EP-001 è gate bloccante per qualsiasi deploy in produzione di koollector.
