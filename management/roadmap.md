---
type: roadmap
created: 2026-05-25
updated: 2026-05-25
status: draft
---
# Roadmap Cross-progetto

> Release planning derivato dal ciclo PM sulla wiki centralizzata (25 maggio 2026).

## Priorità e sequenza

Le epiche sono ordinate per impatto e dipendenze. Il ciclo PM ha identificato 6 temi cross-progetto dalla wiki (25 pagine ingerite da 16 repository).

### Alta priorità — Fondazioni

| Epica | Titolo | Storie | Task | Stima totale |
|---|---|---|---|---|
| [[EP-001]] | Consolidamento Design System SoliDS | 3 | 9 | ~20h |
| [[EP-002]] | Knowledge Base Centralizzata (soli-projects hub) | 3 | 9 | ~21h |

**Rationale:** SoliDS e la KB sono infrastruttura trasversale. Ogni altro miglioramento dipende da un design system allineato e da una knowledge base manutenuta.

### Media priorità — Pipeline e infrastruttura

| Epica | Titolo | Storie | Task | Stima totale |
|---|---|---|---|---|
| [[EP-003]] | RAG & AI Intelligence Pipeline | 3 | 9 | ~21h |
| [[EP-004]] | Infrastruttura & CI/CD Cross-progetto | 3 | 9 | ~21h |
| [[EP-005]] | Supabase: Schema, Auth & Realtime | 3 | 9 | ~15h |

**Rationale:** RAG, CI e Supabase sono critici per la qualità operativa ma hanno meno dipendenze incrociate. Possono procedere in parallelo dopo le fondazioni.

### Bassa priorità — Experience e polish

| Epica | Titolo | Storie | Task | Stima totale |
|---|---|---|---|---|
| [[EP-006]] | PWA & Cross-device Experience | 3 | 9 | ~19h |

**Rationale:** PWA è importante per l'UX finale ma non blocca lo sviluppo di altre feature.

## Riepilogo

| Metrica | Valore |
|---|---|
| Epiche totali | 6 |
| Storie totali | 18 |
| Task totali | 54 |
| Stima complessiva | ~117h |
| Topologia | plan-only (consumer: human) |
| Layer coinvolti | fe, be, db, qa, infra |

## Dipendenze tra epiche

```
EP-001 (SoliDS) ──────────────────────────────────┐
EP-002 (KB) ─── EP-004 (CI) ─── EP-005 (Supabase) ├── EP-006 (PWA)
EP-003 (RAG) ──────────────────────────────────────┘
```

EP-001 e EP-002 sono indipendenti e possono procedere in parallelo. EP-003, EP-004 e EP-005 possono iniziare dopo che le fondazioni sono stabilizzate. EP-006 beneficia del completamento di tutte le altre epiche.

## Prossimi passi

1. **Lint wiki** (TSK-010) per validare lo stato della knowledge base.
2. **Audit versione SoliDS** (TSK-001) come quick win cross-progetto.
3. **Submodule pilota** (TSK-013) per validare il modello di integrazione.
