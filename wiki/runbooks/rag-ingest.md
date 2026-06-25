---
type: runbook
created: 2026-06-25
topic: rag-ingest
---
# Runbook: RAG Ingest — Corpus soli-prof

> Procedura per indicizzare (o re-indicizzare) i corpus RAG di soli-prof: `ai_logs`, `agents_md`, `repo_configs`.

## Pre-requisiti

- Accesso al repo `soli92/soli-prof` in locale (o accesso all'URL di produzione per trigger HTTP)
- File `.env.local` configurato con le seguenti variabili:
  - `VOYAGE_API_KEY` — embeddings Voyage AI
  - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — vector store pgvector
  - `GITHUB_TOKEN` — lettura repo via GitHub Contents API
  - `RAG_API_KEY` — protegge gli endpoint `/api/rag/ingest` e `/api/rag/query`
- Node 22+ e dipendenze installate (`npm ci`)

## Step

### Opzione A — CLI ingest (da locale, in `soli-prof/`)

Ingest di tutti i corpus in sequenza:
```bash
npm run rag:ingest
```

Ingest selettivo per corpus singolo:
```bash
npm run rag:ingest -- ai_logs       # Solo AI_LOG.md dai repo
npm run rag:ingest -- agents_md     # Solo AGENTS.md dai repo
npm run rag:ingest -- repo_configs  # Solo file di configurazione
```

Lo script è `scripts/rag-ingest.ts` e carica `.env.local` via `dotenv`.

### Opzione B — HTTP sincrono (da script o curl)

```bash
curl -X POST https://soli-prof.vercel.app/api/rag/ingest \
  -H "x-api-key: <RAG_API_KEY>" \
  -H "x-admin-confirm: yes" \
  -H "Content-Type: application/json" \
  -d '{"corpus": "all"}'
```

Per corpus singolo, sostituire `"all"` con `"ai_logs"`, `"agents_md"` o `"repo_configs"`.

Risposta: `{ "reports": IngestReport[] }` — operazione sincrona, può richiedere diversi minuti.

### Opzione C — Admin panel (browser, `/admin`)

1. Vai a `https://soli-prof.vercel.app/admin`.
2. Inserisci la password admin (variabile `ADMIN_PAGE_PASSWORD` su Vercel).
3. Usa il pannello **IngestPanel** per avviare l'ingest con progress real-time (SSE per-repo).
4. Il pannello raggruppa i repo per corpus e mostra lo stato di ogni repository.

### Opzione D — SSE stream (da CLI o script con streaming)

```bash
curl -N -X POST https://soli-prof.vercel.app/api/rag/ingest-stream \
  -H "x-api-key: <RAG_API_KEY>" \
  -H "x-admin-confirm: yes" \
  -H "Content-Type: application/json" \
  -d '{"corpus": "all"}'
```

Emette eventi SSE (`data: {...}`) con campi `start`, `repo-start`, `repo-fetched`, `repo-chunked`, `repo-done`, `repo-skipped`, `repo-error`, `phase`, `complete`. La sentinella di fine stream è `event: end`.

### Re-ingest automatico via webhook GitHub

Il re-ingest viene triggerato automaticamente su ogni `push` ai 13 repository configurati tramite webhook GitHub → `POST https://soli-prof.vercel.app/api/webhooks/github` (HMAC-SHA256 con `GITHUB_WEBHOOK_SECRET`).

I 13 repo con webhook attivo sono: `soli-agent`, `casa-mia-be`, `casa-mia-fe`, `bachelor-party-claudiano`, `solids`, `soli-prof` (configurato manualmente), `soli-dm-be`, `soli-dm-fe`, `soli-dome`, `pippify`, `soli-platform`, `koollector`, `health-wand-and-fire`.

Per registrare/ricreare i webhook sugli altri 12 repo (escluso soli-prof che è manuale):
```bash
# Da soli-prof/ con GITHUB_PAT (scope admin:repo_hook) e GITHUB_WEBHOOK_SECRET in .env.local
bash scripts/setup-webhooks.sh
```

> ⚠️ Da verificare: lo script `setup-webhooks.sh` sovrascrive o aggiunge i webhook? Verificare comportamento in caso di webhook già esistente.

## Verifica post-operazione

1. Dopo l'ingest, interroga il corpus per verificare la presenza di nuovi chunk:
   ```bash
   curl -X POST https://soli-prof.vercel.app/api/rag/query \
     -H "x-api-key: <RAG_API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"corpus": "agents_md", "query": "soli-prof stack tecnico", "topK": 3}'
   ```
   Risposta attesa: `{ "corpus": "agents_md", "context": "...", "sources": [...] }`.

2. Verifica sul pannello `/admin` che tutti i repo abbiano lo stato `done` (nessun `repo-error`).

3. Testa la chat di soli-prof (`https://soli-prof.vercel.app`) con una domanda che richiede contesto RAG per verificare che le fonti siano aggiornate.

## Rollback

Il vector store Supabase pgvector non ha rollback automatico. In caso di ingest corrotto:

1. Identifica il corpus problematico dai log (Vercel Function Logs o output CLI).
2. Se necessario, svuota la tabella del corpus in Supabase (namespace `rag_*`) e ri-esegui l'ingest.

> ⚠️ Da verificare: non è documentata una procedura di rollback puntuale per singolo corpus. Valutare se aggiungere uno step di backup snapshot pgvector prima di ingest massivi.

## Riferimenti

- [[rag-pipeline]] — architettura pipeline RAG multi-corpus
- [[soli-prof]] — dettagli implementativi (endpoint, variabili d'ambiente, CORPUS_REPOS)
- [[supabase-integration]] — vector store pgvector
- [[cross-repo-webhooks]] — meccanismo di trigger automatico
