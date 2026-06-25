---
type: concept
created: 2026-05-25
updated: 2026-06-25
sources: [soli-prof-agents.md, soli-agent-agents.md, solids-agents.md, soli-dome-agents.md, soli-dm-fe-agents.md, soli-dm-be-agents.md, soli-platform-agents.md, koollector-agents.md, pippify-agents.md, bachelor-party-claudiano-agents.md, casa-mia-fe-agents.md, casa-mia-be-agents.md, soli-projects-agents.md]
status: draft
---
# Cross-Repo Webhooks

> Sistema di webhook GitHub che connette tutti i repository soli92 a soli-prof per re-ingest RAG automatico su ogni push.

## Summary

Ogni repository dell'ecosistema soli92 ha un webhook GitHub configurato sull'evento `push` verso `https://soli-prof.vercel.app/api/webhooks/github`. Quando viene pushato codice, [[soli-prof]] riceve l'evento, verifica la firma HMAC-SHA256 e avvia un re-ingest selettivo in modalita fire-and-forget [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]. I test e i comandi locali dei singoli repository non dipendono da questo canale [^src: raw/solids-agents.md §Integrazione Soli Prof].

## Key points

- **Endpoint**: `POST /api/webhooks/github` su soli-prof (Next.js API route) [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **Verifica HMAC-SHA256**: header `X-Hub-Signature-256` verificato con `GITHUB_WEBHOOK_SECRET`; firma assente o invalida: 401; secret mancante: 500 [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **Fire-and-forget**: risposta 200 immediata, `maxDuration` 60s; l'ingest non e `await`-ed nella route [^src: raw/soli-prof-agents.md §Known edge cases]
- **Selezione corpus e repo**: il webhook analizza i path modificati nel payload `push` per scegliere il corpus (`ai_logs`, `agents_md`, `repo_configs`) e lo scope del re-ingest [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **Script di registrazione**: `scripts/setup-webhooks.sh` su soli-prof registra i webhook per 12 repo (soli-prof configurato manualmente); richiede `GITHUB_PAT` (scope `admin:repo_hook`) e `GITHUB_WEBHOOK_SECRET` [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **13 repository collegati**: soli-agent, casa-mia-be, casa-mia-fe, bachelor-party-claudiano, solids, soli-prof, soli-dm-be, soli-dm-fe, soli-dome, pippify, soli-platform, koollector, health-wand-and-fire [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **CORPUS_REPOS**: la configurazione vive in `lib/rag-service/config.ts` su soli-prof [^src: raw/soli-prof-agents.md §Repository indicizzati]
- **Indipendenza locale**: i test e build dei singoli repo non dipendono dal webhook; il canale e puramente asincrono [^src: raw/solids-agents.md §Integrazione Soli Prof]

## Projects

| Progetto | Ruolo |
|----------|-------|
| [[soli-prof]] | Receiver: endpoint webhook, verifica HMAC, ingest selettivo |
| Tutti i 13 repo | Sender: webhook `push` configurato su GitHub |
| [[soli-agent]] | Consumer indiretto: usa i dati re-ingestati via tool `search_knowledge` |

## Stato webhook (2026-06-25)

> TSK-023 — validazione webhook push

### Repo con webhook configurato (13 confermati)

Al 2026-06-25, i seguenti 13 repository hanno il webhook push attivo verso `https://soli-prof.vercel.app/api/webhooks/github`:

| Repository | Webhook push | Note |
|-----------|-------------|-------|
| soli-agent | ✅ | — |
| casa-mia-be | ✅ | — |
| casa-mia-fe | ✅ | — |
| bachelor-party-claudiano | ✅ | — |
| solids | ✅ | — |
| soli-prof | ✅ | Configurato manualmente (non via setup-webhooks.sh) |
| soli-dm-be | ✅ | — |
| soli-dm-fe | ✅ | — |
| soli-dome | ✅ | — |
| pippify | ✅ | — |
| soli-platform | ✅ | — |
| koollector | ✅ | — |
| health-wand-and-fire | ✅ | — |

**Totale: 13 repo configurati via `scripts/setup-webhooks.sh` (12) + soli-prof (manuale).**

### Aggiungere webhook a nuovi repo

Per registrare il webhook su un nuovo repo (es. dopo aggiunta a `CORPUS_REPOS`):

```bash
cd soli-prof
GITHUB_PAT=<token-con-scope-admin:repo_hook> \
GITHUB_WEBHOOK_SECRET=<secret-condiviso> \
  bash scripts/setup-webhooks.sh <nome-repo>
```

### Rischio: fire-and-forget senza notifica su fallimento

Il webhook opera in modalita **fire-and-forget**: soli-prof risponde 200 immediatamente e avvia il re-ingest in background senza `await`. Se il re-ingest fallisce (es. Voyage API timeout, Supabase errore), il fallimento non viene notificato al repo sorgente.

Questo rischio e monitorato in US-009 (TSK-025 — sistema di monitoraggio e alerting pipeline ingest). Non e stato implementato un meccanismo di retry o notifica al 2026-06-25.

## Connections

- Related: [[rag-pipeline]] — il webhook alimenta la pipeline RAG di soli-prof
- Related: [[supabase-integration]] — il re-ingest aggiorna embeddings su pgvector
- Related: [[deployment-patterns]] — il webhook vive sulla stessa infrastruttura Vercel di soli-prof
