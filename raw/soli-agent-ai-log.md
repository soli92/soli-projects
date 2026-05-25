---

# AI Log — soli-agent

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

**Soli Agent**: applicazione web (Next.js) per chat con **agente AI** configurabile, integrazione **Anthropic** (metriche in UI, SSE), opzioni **OpenCode**, strumenti con **dry-run**, suite **eval** e workflow **GitHub Actions** (incluso smoke secrets). Design system **@soli92/solids ^1.14.1** (font Google in `app/layout.tsx`, smoke `__tests__/solids-dependency.test.js`). Tool **`search_knowledge`**: retrieval su **Soli Prof** (`/api/rag/query`, corpora `ai_logs` + `agents_md` + `repo_configs`, **RRF**), env `SOLI_PROF_RAG_API_KEY` / `SOLI_PROF_RAG_URL`.

**Stack AI usato (inferito; aggiornato 2026-04-24)**: **Cursor** — PR `da53d10` da branch `cursor/development-environment-setup-7d46`; `43108c4` e `AGENTS.md` menzionano **Cursor Cloud**. Runtime: **Anthropic**, **OpenCode** (SDK `@opencode-ai/sdk`, lazy-load `2046c76`), eval/dry-run (`lib/agent/tools/dry-run.ts`, `eval.yml`), integrazione RAG cross-repo via soli-prof. File `.cursor/rules/agents-context.mdc` (pattern ecosistema). *Il repo è meta-LLM: stack AI = prodotto + toolchain di sviluppo.*

**Periodo di sviluppo**: 2026-03-24 (`ab3fdf5`) → 2026-04-22 (`2046c76` fix providers lazy-load opencode SDK).

**Numero di commit**: 19

---

## Aggiornamento 2026-04-27 — Soli Prof: `search_knowledge` e webhook re-ingest

- Documentata in **`AGENTS.md`**, sotto *search_knowledge*, la catena **push GitHub** → [soli-prof `/api/webhooks/github`](https://soli-prof.vercel.app/api/webhooks/github) per re-ingest della KB (HMAC, **CORPUS_REPOS** con soli-agent). I test `npm test` in questo repo **non** richiedono quel flusso.

## Aggiornamento 2026-04-28 — Attivazione ufficiale Soli Designer

- Esposto il ruolo `graphic-designer` nel tool runtime `spawn_sub_agent` (`lib/agent/tools/definitions.ts`), così il main agent può invocarlo esplicitamente.
- Sostituito il prompt del ruolo in `lib/subagent.ts` con profilo **Soli Designer**: UX/UI, visual design e brand identity, vincoli tecnici su Next.js/TypeScript/Tailwind + `@soli92/solids`, output operativi (palette hex, spec componenti CVA, SVG diretto).
- Aggiornata la sezione multi-agent del system prompt (`lib/agent/prompts.ts`) con regola d’invocazione per `graphic-designer`.
- Allineati test locali su ruoli validi (`__tests__/subagent.test.js`, `__tests__/api-validation.test.js`) includendo `graphic-designer`.
- Allineata documentazione runtime in `README.md` e `AGENTS.md`.

## Aggiornamento 2026-04-28 — Nuovo tool `generate_image_hf` (Hugging Face)

- Aggiunto il tool `generate_image_hf` in `lib/agent/tools/definitions.ts` (schema input: `prompt`, `negative_prompt`, `width`, `height`) e nel dispatcher `executeTool` (`lib/agent/tools/tool-impl.ts`).
- Implementata l’integrazione HTTP verso Hugging Face Inference API (modello `black-forest-labs/FLUX.1-schnell`) con output `data:image/png;base64,...`.
- Abilitato il tool nella toolbox del ruolo `graphic-designer` in `lib/subagent.ts` e aggiornate le regole di output del ruolo per l’uso operativo su asset visivi.
- Allineata documentazione env/runtime: `.env.example` (`HUGGINGFACE_API_KEY`), `README.md` (chiavi opzionali + tool stack Soli Designer), `AGENTS.md` (stack immagini del sub-agent).
- Esteso `__tests__/tools-dry-run.test.ts` con caso dedicato a `generate_image_hf` per garantire compatibilità con `SOLI_TOOLS_DRY_RUN`.

## Aggiornamento 2026-04-28 — Refinement runtime Soli Designer

- Aggiornato `generate_image_hf` in `lib/agent/tools/tool-impl.ts` verso endpoint router Hugging Face: `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell`.
- Introdotto flag `premium` nel modello dati sub-agent (`lib/subagent.ts`) e policy esplicita: role `graphic-designer` forza sempre `premium=true`.
- Obiettivo operativo: mantenere il comportamento quality-first per i task visuali del designer (preferenza chain premium/quality).
- Allineati test locali: `__tests__/subagent.test.js` (assert forzatura premium su `graphic-designer`) e `__tests__/api-validation.test.js` (validazione tipo opzionale `premium`).
- Allineata documentazione tecnica in `README.md` e `AGENTS.md` con note su premium forzato e endpoint router HF.

## Aggiornamento 2026-04-28 — HF async jobs con Redis + worker

- `generate_image_hf` migrato da sync call diretta a pattern **fire-and-poll**: crea `job_id`, salva stato su Redis (`hf_job:{jobId}` con TTL 600) e ritorna subito istruzioni operative.
- Nuovo tool runtime `check_image_job` in `definitions.ts` + `tool-impl.ts`, esposto anche nel ruolo `graphic-designer` (`lib/subagent.ts`) per polling del risultato.
- Nuovo endpoint `app/api/image-worker/route.ts` (`runtime=nodejs`, `maxDuration=60`) che processa job pending, aggiorna stato `processing/completed/failed` e salva base64 finale su Redis.
- Trigger worker in fire-and-forget dentro `generate_image_hf` usando `NEXT_PUBLIC_BASE_URL` o fallback `BASE_URL`.
- Allineati test/doc: `__tests__/tools-dry-run.test.ts` copre anche `check_image_job`; `README.md` e `AGENTS.md` documentano il flusso async.

## Aggiornamento 2026-04-28 — Fallback URL worker su Vercel

- Migliorato il trigger fire-and-forget in `generate_image_hf`: fallback base URL ora `NEXT_PUBLIC_BASE_URL -> BASE_URL -> https://${VERCEL_URL}`.
- Obiettivo: evitare job non triggerati quando non sono impostate env custom, sfruttando `VERCEL_URL` disponibile in runtime deploy.
- Aggiornati `.env.example`, `README.md` e `AGENTS.md` per riflettere il nuovo ordine di fallback.

## Aggiornamento 2026-04-28 — Switch modello HF worker a Stable Diffusion 2.1

- Aggiornato `app/api/image-worker/route.ts`: endpoint modello da `black-forest-labs/FLUX.1-schnell` a `stabilityai/stable-diffusion-2-1`.
- Ottimizzati i parametri inference nel worker async: `num_inference_steps` da `4` a `20` e aggiunto `guidance_scale: 7.5` per output piu stabili/aderenti al prompt.
- Allineata documentazione runtime/tooling in `.env.example`, `README.md`, `AGENTS.md`, `lib/agent/tools/definitions.ts` e `lib/subagent.ts`.

## Aggiornamento 2026-04-28 — Switch modello HF worker a FLUX.1-dev

- Aggiornato `app/api/image-worker/route.ts`: endpoint modello da `stabilityai/stable-diffusion-2-1` a `black-forest-labs/FLUX.1-dev`.
- Allineato il body `parameters` nel worker al profilo richiesto: `negative_prompt`, `width`, `height`, `num_inference_steps: 20` (rimosso `guidance_scale`).
- Aggiornata la documentazione e le descrizioni tool (`README.md`, `AGENTS.md`, `.env.example`, `lib/agent/tools/definitions.ts`, `lib/subagent.ts`).

## Aggiornamento 2026-04-28 — Migrazione worker immagini da Hugging Face a Replicate

- Sostituita in `app/api/image-worker/route.ts` la chiamata provider: da endpoint HF router a `POST https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions`.
- Nuova auth/env nel worker: `REPLICATE_API_TOKEN`; richiesta con header `Prefer: wait=60` per ottenere output sincrono (entro timeout) senza polling esterno.
- Parsing risultato aggiornato: uso di `output[0]` (URL immagine), fetch binario e conversione in `data:image/png;base64,...`; errore esplicito su `response.ok=false` o output vuoto.
- Allineati docs e metadata tool (`README.md`, `AGENTS.md`, `.env.example`, `lib/agent/tools/definitions.ts`, `lib/subagent.ts`).

## Aggiornamento 2026-04-29 — Migrazione worker immagini da Replicate a fal.ai

- Aggiornata `app/api/image-worker/route.ts` per usare `POST https://fal.run/fal-ai/flux/schnell` al posto di Replicate.
- Nuova auth/env runtime: `FAL_API_KEY` con header `Authorization: Key ...`.
- Payload fal.ai impostato con `prompt`, `negative_prompt`, `image_size: "square"`, `num_inference_steps: 4`, `num_images: 1`.
- Parsing risultato aggiornato su `images[0].url`, download binario e conversione in `data:image/png;base64,...`; errore esplicito se fal.ai non ritorna immagini.
- Allineati docs e descrizioni tool (`README.md`, `AGENTS.md`, `.env.example`, `lib/agent/tools/definitions.ts`, `lib/subagent.ts`).

## Aggiornamento 2026-04-29 — Ottimizzazione payload Redis image jobs

- In `app/api/image-worker/route.ts` rimosso il fetch binario + conversione base64 dell'immagine fal.ai.
- Lo stato `completed` ora salva in Redis direttamente `result: imageUrl` (URL fal.ai), riducendo payload e pressione memoria.
- TTL job allineato a **3600 secondi** (1 ora) su `generateImageHf` (`lib/agent/tools/tool-impl.ts`) e nel worker (`processing/completed/failed`).

## Aggiornamento 2026-04-29 — Prompt Soli Designer v2 + tool SVG Recraft

- Sostituito integralmente il prompt `graphic-designer` in `lib/subagent.ts`: ruolo primario da visual maker a consulente UI/UX (analisi, valutazione con SoliDS, istruzioni operative precise, verifica post-modifica).
- Nuovo tool runtime `generate_svg_recraft` aggiunto in `lib/agent/tools/definitions.ts` e `lib/agent/tools/tool-impl.ts` con chiamata `POST https://fal.run/fal-ai/recraft-v3`.
- `generate_svg_recraft` espone `prompt`, `style` (`vector_illustration`/`icon`/`logo`), `width`, `height`, forza `output_format: "svg"` e ritorna URL SVG.
- Toolbox `graphic-designer` aggiornata in `lib/subagent.ts` per includere `generate_svg_recraft`.

## Aggiornamento 2026-04-29 — Persistenza sub-agent su Redis + polling UI stato

- Stato sub-agent migrato da in-memory only a strategia ibrida in `lib/subagent.ts`: cache locale `activeSubAgents` + persistenza Redis `subagent:{id}` (TTL 3600s) in `spawnSubAgent`/`updateSubAgent`.
- `getSubAgent` e `listSubAgents` resi async con fallback Redis; quando un agente viene recuperato da Redis viene ricaricato anche nella `Map` locale.
- Allineati call-site async in `lib/agent/tools/tool-impl.ts` e `app/api/subagent/route.ts` (`await listSubAgents/getSubAgent`), incluso ruolo valido `graphic-designer` nel `VALID_ROLES`.
- Nuovo endpoint `app/api/subagent-status/route.ts` (`runtime=nodejs`, `maxDuration=10`) per polling leggero dello stato (`completed`/`failed`/`not_found`).
- UI in `app/page.tsx`: rilevamento `agent-[a-f0-9]{8}` nei messaggi assistant, polling ogni 10s su `/api/subagent-status`, banner in-chat su completamento/fallimento e CTA per auto-inviare `Mostrami il risultato del sub-agente {id}`.
- Fix serializzazione/deserializzazione Redis in `lib/subagent.ts`: mantenuto `JSON.stringify(...)` nei `redis.set` di `subagent:{id}` e lettura aggiornata a `redis.get<SubAgent>` senza `JSON.parse`, coerente con auto-deserializzazione Upstash.

## Aggiornamento 2026-04-29 — Chat UX: stop stream, markdown, copy/download + costi model-aware

- `app/page.tsx`: aggiunto `AbortController` per la fetch SSE `/api/chat` con pulsante UI `⏹ Stop`; l’abort utente (`AbortError`) è gestito come uscita silenziosa senza banner errore.
- Rendering messaggi migrato a Markdown (`react-markdown` + `remark-gfm`) con syntax highlighting Prism (`react-syntax-highlighter`, tema `oneDark`) sui fenced code block.
- Azioni messaggio introdotte nel bubble: copia su clipboard (con fallback `execCommand`) e download diretto degli snippet (`extractDownloadableFiles` / `downloadFile`).
- Costi Anthropic aggiornati in `lib/anthropic-usage.ts`: pricing model-aware (`claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`) con quota cache-read; fallback legacy preservato.
- `lib/chat-usage.ts` esteso con `sumCacheReadTokens` e `costBreakdownUsd`; `AgentSettingsPanel` mostra breakdown input/output/cache e costo sessione cumulativo (`sessionCost` da `app/page.tsx`).
- Dipendenze aggiunte: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`.

## Aggiornamento 2026-04-29 — Hardening tab Impostazioni + test costi

- Fix runtime in `app/components/AgentSettingsPanel.tsx`: fallback difensivi per payload usage legacy in `localStorage` (assenza `costBreakdownUsd` / `sumCacheReadTokens`) per evitare crash aprendo la tab Impostazioni.
- Nuova suite `__tests__/chat-usage-costs.test.ts` inclusa in `npm test`: verifica pricing model-aware, breakdown costo (`input`/`output`/`cache read`) e campi default quando il collector non ha turni.

## Aggiornamento 2026-04-29 — Ottimizzazione multiagenting + model routing

- `lib/subagent.ts`: introdotti controlli runtime configurabili via env:
  - `SOLI_SUBAGENT_MAX_ITERATIONS` (default 20)
  - `SOLI_SUBAGENT_GRAPHIC_DESIGNER_MAX_ITERATIONS` (default 30)
  - `SOLI_SUBAGENT_TIMEOUT_MS` (default 300000)
  - `SOLI_MAX_PARALLEL_SUBAGENTS` (default 3)
- Aggiunti stati queue-oriented per i sub-agent (`queued`) e scheduling automatico: se i running raggiungono il limite, i nuovi job restano in coda e partono a slot libero.
- Timeout intelligente: al superamento di `SOLI_SUBAGENT_TIMEOUT_MS` il job passa a `failed` con risultato `Timeout raggiunto`.
- Cleanup esteso: oltre ai completed/failure vecchi, vengono rimossi running stale e chiavi Redis orfane pertinenti.
- `lib/router.ts`: circuit breaker Redis per provider in quota/rate limit:
  - `recordProviderFailure(provider)` su 429
  - chiave `provider_failures:{provider}`, TTL 3600s
  - skip provider nella fallback chain quando count >= 3
- Routing migliorato con segnali aggiuntivi:
  - complexity `nano` per task brevissimi/banali (forza tier economico)
  - premium continuity in follow-up tramite sticky session model (`session_model:{clientUserId}`, TTL 600s)
  - reason tracking centralizzato (`premium_keyword`, `complexity_high`, `token_threshold`, `economy_default`, `nano_simple`, `sticky_session`)
- `lib/agent/run-agent.ts`: log strutturato `model_routing_decision` con provider/model scelto, reason, estimatedTokens e circuit breaker aperti.
- `app/api/chat/route.ts`: pass-through `clientUserId` al runner per abilitare sticky routing sessione.
- Test allineati: `__tests__/router-cost.smoke.ts` aggiornato per `getModelFallbackChain` async.

## Aggiornamento 2026-04-29 — Branding migration SoliDS 1.14.1 (logo, loader, manifest)

- Upgrade dipendenza UI: `@soli92/solids` da `^1.13.1` a `^1.14.1` (`package.json` + `package-lock.json`).
- Aggiornato il controllo di coerenza in `__tests__/solids-dependency.test.js` al nuovo range `^1.14.1`.
- Branding app allineato a SoliDS:
  - Nuovo componente `app/components/SoliLogo.tsx` con varianti `colored/gold/mono` dipendenti dal tema `data-theme`.
  - Header chat (`app/page.tsx`) migrato a `SoliLogo`.
  - Nuovo stato di caricamento `app/loading.tsx` con logo brandizzato.
- PWA/head allineati:
  - `app/layout.tsx` usa icone da `@soli92/solids/brand-assets/*` e punta al manifest route `/manifest.webmanifest`.
  - `app/manifest.ts` introduce il manifest Next App Router con icone SoliDS.
  - Rimossi i file statici legacy `manifest.json` e `public/manifest.json`.
- Documentazione aggiornata (`README.md`, `AGENTS.md`) per il nuovo range SoliDS e il percorso manifest.

## Fasi di sviluppo (inferite dal history)

### Fase 1 — UI SoliDS e fix lint speech

**Timeframe**: `ab3fdf5` → `f005acc`.

**Cosa è stato fatto**: integrazione SoliDS, fix lint su speech hooks, aggiornamento `next-env.d.ts`.

**Evidenza di AI-assist** (inferita):

- Commit iniziale unico su design system poi micro-fix tipici di iterazione IDE.

**Decisioni architetturali notevoli**:

- **Next** con tipi dev path aggiornato (`6b9dbdc`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Integra @soli92/solids nel progetto Next 16 e risolvi lint su speech hooks / `next-env.d.ts`."
> *Evidenza*: `ab3fdf5`, `f005acc`, `6b9dbdc`.

**Lezioni apprese**

- Hook speech che dipendono da stato devono **defer** aggiornamenti da effect per soddisfare regole ESLint React (`f005acc`).

### Fase 2 — Documentazione, Node 22, AGENTS/Cursor, PR setup

**Timeframe**: `a2e6e2a` → `da53d10` (merge PR Cursor).

**Cosa è stato fatto**: README comandi test, **AGENTS.md** focalizzato su Cursor Cloud (`43108c4`), slim successivo (`fb4ee9a`), regola `.cursor`, upgrade toolchain `99a2cec`.

**Evidenza di AI-assist** (inferita):

- **Evidenza forte**: branch `cursor/development-environment-setup-7d46` e testo AGENTS “Cursor Cloud”.

**Decisioni architetturali notevoli**:

- Trattare **AGENTS.md** come contratto operativo per assistenti (coerente col nome del progetto).

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi AGENTS.md con istruzioni Cursor Cloud, README con comandi test, regola `.cursor`, allinea toolchain Node 22."
> *Evidenza*: `43108c4`, `a2e6e2a`, `fb4ee9a`, `99a2cec`, merge `da53d10`.

**Lezioni apprese**

- **AGENTS “slim”** dopo una prima versione verbosa mantiene il file usabile (`fb4ee9a`).
- PR da branch `cursor/*` documenta esplicitamente origine assistita (`da53d10`).

### Fase 3 — Preferenze agente, OpenCode routing, metriche Anthropic

**Timeframe**: `87b3b8a` → `e9d6733`.

**Cosa è stato fatto**: tab Impostazioni, preferenze contesto README GitHub, fix OpenCode solo dove usabile, nota env Supabase vs Casa Mia, metriche Anthropic in UI/SSE.

**Evidenza di AI-assist** (inferita):

- Commit densi che legano UI, routing provider e documentazione env — pattern comune in pair con LLM.

**Decisioni architetturali notevoli**:

- **OpenCode** opzionale e condizionato (`50bc742`).
- Esportazione **usage** Anthropic nel flusso streaming.

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi tab Impostazioni con preferenze agente, escludi OpenCode dal routing dove non supportato, documenta env Supabase vs Casa Mia, mostra metriche Anthropic in UI e nel payload SSE."
> *Evidenza*: `87b3b8a`, `50bc742`, `7746bf8`, `e9d6733`, `lib/chat-usage.ts` (citato in `AGENTS.md`).

**Lezioni apprese**

- **OpenCode** non è sempre deployabile in serverless → preferenza UI + guard rail server (`50bc742`).
- **countTokens** e stima USD per turno richiedono integrazione trasversale (`AGENTS.md` sezione Anthropic).

### Fase 4 — Evals, dry-run tool, CI, Repomix, lazy-load OpenCode SDK

**Timeframe**: `63ae730` → `2046c76`.

**Cosa è stato fatto**: hook `onToolCall`, `SOLI_TOOLS_DRY_RUN`, suite eval; workflow smoke secrets; documentazione eval; **Repomix** config; bump SoliDS; **lazy-load** `@opencode-ai/sdk` per CI (`2046c76`, duplicato `ad73ec0` in history — verificare se amend/revert locale).

**Evidenza di AI-assist** (inferita):

- Infrastruttura **eval** e **dry-run** è tipica di progetti “agent-first” sviluppati con assistenza AI e CI rigorosa.

**Decisioni architetturali notevoli**:

- **Lazy import** del SDK OpenCode per evitare fallimenti CI quando il pacchetto o l’ambiente non sono necessari al job.

**Prompt chiave usati**

> **Prompt [inferito]**: "Implementa hook onToolCall, SOLI_TOOLS_DRY_RUN, suite eval, workflow smoke-secrets, Repomix config, lazy-load @opencode-ai/sdk per CI eval."
> *Evidenza*: `63ae730`, `01e6052`, `b16f3f0`, `d75cc68`, `2046c76`.

**Lezioni apprese**

- **Import statico** di SDK opzionali rompe job CI che non ne hanno bisogno → **dynamic import** nel modulo providers (`2046c76`).
- **Dry-run** centralizzato (`lib/agent/tools/dry-run.ts`) consente eval deterministiche in `CI=true` (`AGENTS.md`).

### Fase 5 — Tool `search_knowledge` (Soli Prof RAG, RRF)

**Timeframe**: 2026-04-24 (sessione assistita).

**Cosa è stato fatto**: nuovo modulo **`lib/agent/tools/search-knowledge.ts`** — `fetch` parallelo ai due corpus dell’API soli-prof, **Reciprocal Rank Fusion** su `sources`, formattazione contesto; registro in **`definitions.ts`**, **`executeTool`** in `tool-impl.ts`, risposta fittizia in **`dry-run.ts`** (non pass-through, niente HTTP in CI); **`labels.ts`**; istruzioni in **`lib/agent/prompts.ts`**; env in **`.env.example`**; doc **AGENTS** / **README** / **INTEGRATION**; test **`__tests__/tools-dry-run.test.ts`**.

**Decisioni**: chiave dedicata **`SOLI_PROF_RAG_API_KEY`** (stesso segreto di `RAG_API_KEY` sul deploy soli-prof); URL base configurabile per staging.

**Lezioni**: tool read-only verso un servizio esterno **separato** da Tavily/GitHub → meglio **simulare** in dry-run invece del pass-through, per eval stabili senza secret aggiuntivi in CI.

### Fase 6 — Bump @soli92/solids 1.7.0, font stack, test dipendenza (2026-04-24)

**Cosa è stato fatto**: dipendenza **`@soli92/solids` ^1.7.0**; link **Google Fonts** in `app/layout.tsx` (allineamento Storybook SoliDS); **`__tests__/solids-dependency.test.js`** nella catena `npm test`; README / AGENTS aggiornati.

**Lezioni**: i token `--sd-font-*` richiedono famiglie caricate; conviene fissare il range major-minor nel test per evitare regressioni silenziose.

---

## Pattern ricorrenti identificati

- **Docs(ci)** accoppiati a modifiche pipeline (`b16f3f0`, `01e6052`).
- **Feature flag / env** documentati in README/AGENTS.
- **Conventional commits** con scope (`feat(agent):`, `fix(providers):`).
- Presenza file **`.github/workflows`** e riferimenti a segreti (smoke workflow).

---

## Tecnologie e scelte di stack

- **Framework**: Next.js 16 (da README/history), React, TypeScript
- **Styling**: SoliDS
- **State**: inferito da pattern Next App Router + client chat
- **Deploy**: non dedotto in dettaglio da questa analisi (probabile Vercel)
- **LLM integration**: Anthropic SDK, SSE, metriche usage; OpenCode SDK opzionale
- **RAG esterno**: tool `search_knowledge` → API soli-prof (`SOLI_PROF_RAG_*` env)

## Problemi tecnici risolti (inferiti)

1. **OpenCode non sempre utilizzabile**: `50bc742 fix: OpenCode solo dove usabile…`.
2. **CI eval bloccata da import statico opencode**: `2046c76 fix(providers): lazy-load @opencode-ai/sdk…`.
3. **Lint speech hooks**: `f005acc`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `2046c76` fix(providers): lazy-load @opencode-ai/sdk to unblock CI eval runs
- `63ae730` feat(agent): onToolCall hook, SOLI_TOOLS_DRY_RUN, evals suite
- `50bc742` fix: OpenCode solo dove usabile; preferenza UI openCodeInRouting
- `e9d6733` feat(chat): metriche Anthropic in UI e payload SSE usage
- `da53d10` Merge pull request #1 from soli92/cursor/development-environment-setup-7d46
- `43108c4` Add AGENTS.md with Cursor Cloud specific development instructions
- `ab3fdf5` feat(ui): integrate SoliDS design system

---

## Punti aperti / note per il futuro

- **grep `TODO|FIXME|HACK|XXX`** in `lib/`, `app/`, `evals/` (esclusi artifact): **nessun match** in questa passata.
- **Policy segreti / smoke workflow** (`smoke-secrets.yml`): dipendenza da configurazione GitHub — verificare periodicamente che i secret obsoleti non restino documentati.
- **Matrice provider**: OpenAI/Gemini/OpenCode/Anthropic coesistono nel codice; tabella supporto runtime **non** centralizzata in un singolo file al momento dell’analisi (vedi `AGENTS.md` e `lib/agent/`).
- **Debito tecnico inferito**: costi **eval** in CI su ogni PR che tocca path in `eval.yml` — monitorare minuti Actions e budget API.
- **Debito tecnico inferito**: duplicato commit `ad73ec0`/`2046c76` in history locale passata: verificare se amend/rebase ha lasciato riferimenti confusi in mirror/fork.
- **Debito tecnico inferito**: webpack-only (`AGENTS.md`) vs default Next — onboarding nuovi dev deve ripetere flag `--webpack`.

---

> **Nota metodologica**: aggiornamento Fase 5 (search_knowledge) il 2026-04-24; validare inferenze sui prompt con log reali di sessione.

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026**, integrazione manuale **24 aprile 2026** (Fase 5), analizzando:

- **19+** commit su `main` (riferimento `git log`; il conteggio esatto va aggiornato dopo push)
- **~14** file/config (`package.json`, `AGENTS.md`, `AGENT.md`, `.github/workflows/eval.yml`, `.github/workflows/smoke-secrets.yml`, `lib/agent/*`, `lib/agent/tools/search-knowledge.ts`, `repomix.config.ts`)
- **0** occorrenze `TODO|FIXME|HACK|XXX` nei sorgenti TypeScript principali ispezionati via grep workspace

**Punti di minore confidenza:**

- Prompt fase 3–4 dedotti da messaggi commit senza transcript.
- Elenco file “M” approssimativo se il tree locale differisce da remoto.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.

---

## Aggiornamento 2026-05-14 — `search_knowledge`: copy tool e documentazione

- **`lib/agent/tools/definitions.ts`**: descrizione runtime del tool aggiornata per riflettere **tre corpora** RAG e l’ordine di grandezza **~14 repo** `soli92` su `main` (allineato a `CORPUS_REPOS` su soli-prof), invece del testo precedente basato su “12 repo” e solo AI_LOG/AGENTS.
- **`AGENTS.md`**: sezione tool corretta da “due POST” a **tre POST** parallele (`ai_logs`, `agents_md`, `repo_configs`).
- **`README.md`**: alberatura tool aggiornata (tre corpora nel commento su `search-knowledge.ts`).
