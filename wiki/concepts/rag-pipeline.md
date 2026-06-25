---
type: concept
created: 2026-05-25
updated: 2026-06-25
sources: [tech_stack.md, soli-prof-agents.md, soli-agent-agents.md]
status: draft
---
# RAG Pipeline

> Pipeline di Retrieval-Augmented Generation multi-corpus: soli-prof come servizio RAG centralizzato, soli-agent come consumer principale.

## Summary

La RAG pipeline dell'ecosistema soli92 e implementata in [[soli-prof]] come servizio centralizzato. Opera su tre corpus distinti (`ai_logs`, `agents_md`, `repo_configs`) indicizzando file da tutti i repository dell'ecosistema [^src: raw/soli-prof-agents.md §RAG]. [[soli-agent]] consuma il servizio via tool `search_knowledge` con fusione Reciprocal Rank Fusion (RRF) [^src: raw/soli-agent-agents.md §Tool search_knowledge].

## Key points

- **Tre corpus**: `ai_logs` (AI_LOG.md dai repo), `agents_md` (AGENTS.md dai repo), `repo_configs` (file di configurazione) [^src: raw/soli-prof-agents.md §RAG]
- **Vector store**: [[supabase]] pgvector con embeddings Voyage [^src: raw/tech_stack.md §Stack comune]
- **Ingest**: CLI via `npm run rag:ingest` (sync), endpoint HTTP `POST /api/rag/ingest` e `POST /api/rag/ingest-stream` (SSE con progress per-repo), admin panel con UI `/admin` [^src: raw/soli-prof-agents.md §RAG]
- **Query**: `POST /api/rag/query` (singolo corpus), `queryMultipleCorpora` (RRF su N corpus, `RRF_K=60`) usato nella chat di soli-prof [^src: raw/soli-prof-agents.md §RAG]
- **Consumer soli-agent**: tre POST parallele a soli-prof, fusione RRF, stringa contesto per il modello (`lib/agent/tools/search-knowledge.ts`) [^src: raw/soli-agent-agents.md §Tool search_knowledge]
- **Re-ingest automatico**: webhook GitHub su `push` da tutti i repo verso `/api/webhooks/github` (fire-and-forget, HMAC) [^src: raw/soli-prof-agents.md §POST /api/webhooks/github]
- **Repository indicizzati**: soli-agent, casa-mia-be, casa-mia-fe, bachelor-party-claudiano, solids, soli-prof, soli-dm-be, soli-dm-fe, soli-dome, pippify, soli-platform, Koollector, health-wand-and-fire [^src: raw/soli-prof-agents.md §Repository indicizzati]

## Projects

| Progetto | Ruolo nella pipeline |
|----------|---------------------|
| [[soli-prof]] | Servizio RAG: ingest, query, vector store, admin panel, webhook receiver |
| [[soli-agent]] | Consumer principale via tool `search_knowledge` |
| Tutti i 13+ repo | Sorgenti dati: AGENTS.md, AI_LOG.md, file config indicizzati |

## Chunking Strategy & Optimization

> TSK-020 — audit 2026-06-25

### Strategia attuale

Il chunker corrente e `markdown-v2.1` (vedi `CURRENT_CHUNKER_VERSION` in `lib/rag-service/config.ts`):

- **Splitting:** heading h2/h3 come separatori principali
- **Contextual retrieval:** bullet split + preambolo contestuale (pattern settembre 2024)
- **`chunkMaxTokens`:** 1500 token (da `RAG_CONFIG.chunkMaxTokens`)

### Problema: file > 500 righe

File di grandi dimensioni producono chunk problematici:

- **Chunk troppo grandi:** se una sezione sotto un heading h2 non ha h3 interni e supera 1500 token, il chunker la tronca arbitrariamente perdendo il contesto di fine sezione
- **Chunk tagliati male:** file con struttura mista YAML + prose + code block (tipica di AI_LOG.md) possono essere spezzati a meta di un blocco YAML o in mezzo a un code example
- **Rumore retrieval:** chunk molto grandi hanno embedding "diluiti" su troppi concetti → peggiore similarity per query specifiche

### File candidati da monitorare

| File | Repo | Stima righe | Corpus | Problema atteso |
|------|------|-------------|--------|-----------------|
| `AI_LOG.md` | soli-agent | > 1000 righe | ai_logs | Struttura YAML+prose cumulativa, chunk tagliati male |
| `AGENTS.md` | soli-platform | > 500 righe | agents_md | Sezioni verbose senza h3 → chunk grandi |

### Raccomandazioni (da implementare in TSK-020)

1. **Ridurre `chunkMaxTokens`** da 1500 a ≤ 800 token per i corpus `ai_logs` e `agents_md`
2. **Aggiungere overlap** del ~10% tra chunk consecutivi (es. 80 token) per preservare il contesto di confine
3. **Separatori custom** per pattern YAML+prose+code: riconoscere blocchi `---` YAML, ` ``` ` code block e linee `---` come punti di taglio naturali prima del limite di token
4. **Incrementare `CURRENT_CHUNKER_VERSION`** a `markdown-v2.2` dopo qualsiasi modifica al chunking (convenzionalmente: `"<strategy>-vMAJOR.MINOR"`)

Nota: qualsiasi cambio al chunker richiede re-ingest completo di tutti i repo (i chunk esistenti con versione precedente restano in Supabase ma non vengono usati per i corpus aggiornati grazie al filtro `CURRENT_CORPUS_VERSION`).

---

## Similarity Thresholds

> TSK-021 — audit 2026-06-25 — verifica allineamento API ↔ UI

### Configurazione attuale

In `lib/rag-service/config.ts`:

```typescript
RAG_CONFIG.similarityThresholdForContext  = 0.20  // soglia LLM context
RAG_CONFIG.similarityThresholdForSources  = 0.30  // soglia UI source badges
```

### Verifica utilizzo (risultato audit)

**`queryCorpus` in `lib/rag-service/query.ts`:**

- Usa `similarityThresholdForContext` (0.20) per filtrare i chunk passati al contesto LLM ✅
- Usa `similarityThresholdForSources` (0.30) per filtrare i chunk mostrati come badge fonti nell'UI ✅

**`queryCorpusHybrid` in `lib/rag-service/query.ts`:**

- Stessa logica di filtro applicata post-RRF su chunk semantic+BM25 ✅
- Usa entrambe le soglie correttamente (righe ~199 e ~203 del file) ✅

**`queryMultipleCorpora` in `lib/rag-service/query.ts`:**

- Opera sulle `sources` gia filtrate da `queryCorpus`/`queryCorpusHybrid` → la soglia e applicata upstream ✅
- Il context string di output usa `source.preview` (subset del content) → nessun bypass della soglia ✅

**`POST /api/rag/query` route (`app/api/rag/query/route.ts`):**

- Chiama `queryCorpus(corpus, query, topK)` direttamente → soglie applicate nella funzione ✅
- La route non sovrascrive ne bypassa le soglie ✅

### Conclusione: soglie allineate

**Le soglie sono correttamente e simmetricamente applicate** in tutta la pipeline. Non e stata trovata alcuna divergenza tra API e UI.

### Asimmetria intenzionale (by design)

L'asimmetria `context=0.20` vs `sources=0.30` e intenzionale e documentata inline nel codice:

- **Context (0.20):** soglia bassa → piu materiale per il LLM. Il modello puo ignorare chunk irrilevanti. L'obiettivo e massimizzare il recall (non perdere informazioni utili).
- **Sources/UI (0.30):** soglia alta → mostra all'utente solo fonti di cui il sistema e "sicuro". Evita di mostrare badge di fonti marginali che potrebbero ingannare l'utente sulla provenienza della risposta.

Questo pattern e coerente con la filosofia RAG "generous context, conservative attribution": il LLM vede piu materiale di quanto venga mostrato all'utente come fonte.

---

## Onboarding nuovi repo

> TSK-024 — procedura 2026-06-25

Per aggiungere un nuovo repository alla pipeline RAG di soli-prof:

### Step 1 — Aggiungi il repo a `CORPUS_REPOS`

In `lib/rag-service/config.ts` (soli-prof), aggiungi il repo nei corpora pertinenti:

```typescript
// Esempio: aggiunta di soli-boy
ai_logs: [
  // ... repo esistenti ...
  { owner: "soli92", repo: "soli-boy", branch: "main" },  // se ha AI_LOG.md
],
agents_md: [
  // ... repo esistenti ...
  { owner: "soli92", repo: "soli-boy", branch: "main" },  // se ha AGENTS.md
],
```

Scegli i corpus in base ai file presenti nel repo:
- `ai_logs` → se il repo ha `AI_LOG.md` con contenuto utile
- `agents_md` → se il repo ha `AGENTS.md` con contesto agentico
- `repo_configs` → per tutti i repo con package.json/tsconfig/workflow

### Step 2 — Aggiungi il webhook con setup-webhooks.sh

In soli-prof, esegui:

```bash
GITHUB_PAT=<token> GITHUB_WEBHOOK_SECRET=<secret> \
  bash scripts/setup-webhooks.sh <nome-repo>
```

Requisiti: `GITHUB_PAT` con scope `admin:repo_hook`. Il webhook verra registrato verso `https://soli-prof.vercel.app/api/webhooks/github` sull'evento `push`.

### Step 3 — Dry-run ingest

```bash
npm run rag:ingest -- --corpus agents_md --repo <nome-repo>
```

Sostituisci `agents_md` con il corpus target. Per piu corpus, esegui il comando per ciascuno. Verifica l'output: deve mostrare chunk creati senza errori.

### Step 4 — Verifica chunks in Supabase

Controlla nel pannello admin di soli-prof (`/admin`) o direttamente su Supabase che i chunk siano stati creati correttamente:
- Tabella `rag_agents_md`, `rag_ai_logs`, o `rag_repo_configs` in base al corpus
- Filtra per `repo = '<nome-repo>'` e verifica che i chunk abbiano `corpus_version = CURRENT_CORPUS_VERSION`

---

## Connections

- Related: [[cross-repo-webhooks]] — meccanismo di trigger per re-ingest automatico
- Related: [[supabase-integration]] — pgvector come vector store
- Related: [[anthropic-claude]] — LLM usato per la chat RAG-augmented di soli-prof (Haiku 3.5)
- Related: [[deployment-patterns]] — soli-prof deployato su Vercel
