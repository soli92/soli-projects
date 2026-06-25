---
type: lint
created: 2026-06-25
updated: 2026-06-25
sources: [soli-prof-agents.md, lib/rag-service/config.ts, lib/rag-service/query.ts]
status: draft
related_task: TSK-019
epic: EP-003
us: US-007
---
# RAG Performance Analysis — 2026-06-25

> Documento di audit metodologico per il benchmark latenza della pipeline RAG multi-corpus di soli-prof.
> **Stato: dati non ancora raccolti** — questo è un piano di benchmark (TSK-019 è task di audit).

## Overview

La pipeline RAG di soli-prof opera su tre corpus (`ai_logs`, `agents_md`, `repo_configs`) con due modalità di query:

1. **`queryCorpus`** — semantic search su singolo corpus (endpoint `POST /api/rag/query`)
2. **`queryMultipleCorpora`** — N corpus in parallelo con fusione RRF (K=60) usata nella chat di soli-prof

L'obiettivo del benchmark è misurare p50/p95 latenza nelle due modalità, identificare i bottleneck e definire baseline per future ottimizzazioni.

---

## Metodologia benchmark

### Parametri da misurare

| Metrica | Target atteso | Note |
|---------|--------------|-------|
| p50 latenza singolo corpus | < 500ms | Escluso cold start Vercel |
| p95 latenza singolo corpus | < 1200ms | Include varianza embedding Voyage-3 |
| p50 latenza multi-corpus (3 corpora) | < 800ms | Parallelo, non seriale |
| p95 latenza multi-corpus (3 corpora) | < 2000ms | Include RRF overhead |

### Setup consigliato

**Tool:** [k6](https://k6.io/) (load testing) o [autocannon](https://github.com/mcollina/autocannon) (Node.js, più vicino allo stack del progetto).

**Endpoint target:** `POST https://soli-prof.vercel.app/api/rag/query`

**Header richiesti:**
```
Content-Type: application/json
x-api-key: <RAG_API_KEY>
```

**Payload tipo — singolo corpus:**
```json
{
  "corpus": "ai_logs",
  "query": "Come funziona il tool search_knowledge in soli-agent?",
  "topK": 15
}
```

**Payload tipo — per misurare multi-corpus indirettamente:**

Non esiste endpoint HTTP diretto per `queryMultipleCorpora`. La funzione è invocata internamente dalla chat di soli-prof (`/api/chat`). Per il benchmark isolato occorre:
- Invocare `POST /api/rag/query` in parallelo su 3 corpus (simulazione del parallelismo client-side)
- Oppure esporre un endpoint `/api/rag/query-multi` dedicato (change in soli-prof, out of scope TSK-019)

**Script k6 di riferimento (singolo corpus):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '60s',
};

const CORPORA = ['ai_logs', 'agents_md', 'repo_configs'];
const QUERIES = [
  'Come funziona il tool search_knowledge?',
  'Quali repo sono indicizzati nel corpus ai_logs?',
  'Qual e la struttura del progetto soli-platform?',
];

export default function () {
  const corpus = CORPORA[Math.floor(Math.random() * CORPORA.length)];
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];

  const res = http.post(
    'https://soli-prof.vercel.app/api/rag/query',
    JSON.stringify({ corpus, query, topK: 15 }),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': __ENV.RAG_API_KEY,
      },
    }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'latency < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

**N iterazioni consigliate:** almeno 100 richieste per corpus per campione statisticamente significativo (k6: `duration: '2m'` con `vus: 3`).

---

## Bottleneck attesi

### 1. Cold start Vercel (Serverless Functions)

soli-prof e deployato su Vercel come Next.js app. Le route API (`/api/rag/query`) sono serverless functions:

- **Cold start stimato:** 500–1500ms sulla prima invocazione dopo periodo di inattivita
- **Warm execution:** 200–600ms (dominata da embedding Voyage-3 + pgvector query)
- **Mitigazione:** nessuna attualmente (niente Vercel Pro "Fluid Compute" o Edge caching configurato)

### 2. Dimensione corpus `ai_logs` — file AI_LOG.md > 1000 righe

Il corpus `ai_logs` include `soli-agent/AI_LOG.md`, che supera abbondantemente le 1000 righe (log cumulativo di sviluppo). File grandi producono:

- Piu chunk in `rag_ai_logs` (Supabase pgvector) → piu vettori da scansionare
- Chunk di qualita variabile se il chunker `markdown-v2.1` non gestisce bene la struttura YAML+prose mista
- Potenziale slow query su `match_rag_ai_logs` se l'indice IVFFLAT non e ben calibrato

**Azione correlata:** TSK-020 (ottimizzazione chunking).

### 3. Parallelismo `queryMultipleCorpora` e RRF overhead

`queryMultipleCorpora` lancia N query in `Promise.all`, quindi la latenza totale e `max(latenza_corpus_i)`, non la somma. Tuttavia:

- L'overhead RRF (sorting + aggregation in-memory) e trascurabile (O(n log n) su poche centinaia di chunk)
- Il vero collo di bottiglia e il corpus piu lento (solitamente `ai_logs` per dimensione)
- Il parametro `topKPerCorpus` (default 25) determina quanto materiale viene recuperato per corpus prima della fusione

### 4. Embedding Voyage-3 (API call esterna)

Ogni query richiede una chiamata a Voyage AI per embeddare il testo della query (`embedTexts([userQuery], "query")`). Latenza stimata: 100–300ms per chiamata. Non cacheato attualmente.

---

## Stato attuale

**Dati non raccolti.** Questo documento definisce la metodologia; il benchmark effettivo e pianificato come task separato (potenzialmente US-007 sprint successivo).

Prerequisiti prima dell'esecuzione:
- [ ] `RAG_API_KEY` disponibile come env var locale (non commitare)
- [ ] k6 installato (`brew install k6` su macOS) o autocannon (`npm i -g autocannon`)
- [ ] Vercel non in modalita preview (usare URL produzione)
- [ ] Campionare anche con corpus vuoti (baseline senza dati) vs. corpus completi

---

## Riferimenti

- `lib/rag-service/config.ts` — `RAG_CONFIG`, `CORPUS_REPOS`, `CURRENT_CHUNKER_VERSION`
- `lib/rag-service/query.ts` — `queryCorpus`, `queryMultipleCorpora`, `RRF_K=60`
- `app/api/rag/query/route.ts` — endpoint HTTP `POST /api/rag/query`
- TSK-020 — ottimizzazione chunking (prerequisito per benchmark su file grandi)
- ADR-004 — RAG multi-corpus con fusione RRF
