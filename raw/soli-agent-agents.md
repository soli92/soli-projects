# AGENTS.md — AI / Cursor agent context

**Updated:** 2026-05-14

## Project

Single **Next.js 16** (TypeScript) app: AI dev assistant with **Web Chat PWA** and **Telegram Bot**. **npm** (`package-lock.json`). User-facing UI text, comments, and prompts are **Italian**.

Also see **[AGENT.md](./AGENT.md)** — short pointer for tools that look for that filename; canonical detail remains here.

## When resuming work (checklist)

1. **`git status`** — align with **`README.md`** for product scope.
2. **Env** — copy `.env.example` → `.env.local` for real provider keys; without them the UI works but AI replies need keys. Placeholders in `.env.example` are not real secrets; `/api/health` may still report providers as configured.
3. **Before merge** — `npm run lint`, `npm run typecheck`, `npm test` (include `__tests__/tools-dry-run.test.ts` per `SOLI_TOOLS_DRY_RUN` e `__tests__/solids-dependency.test.js` per **`@soli92/solids` ^1.14.1**), `npm run build`; optional E2E: `npx playwright test --project=chromium`. Se la PR modifica path coperti da **`.github/workflows/eval.yml`**, controllare che la CI eval su GitHub sia verde (o lanciare `npm run eval` in locale con le stesse env).
4. **Repomix** (opzionale) — `npm run repomix` per `repomix-output.md` da condividere con altri agenti; non versionare l’output (è in `.gitignore`).

## Web UI: Impostazioni agente

The chat exposes a tab **Impostazioni** (mobile: main tabs; desktop: sidebar next to Dashboard). Preferences are stored in **`localStorage`** under `soli_agent_prefs_v1` and sent as **`agentPreferences`** on each `POST /api/chat` when the user has saved settings.

Server-side merge lives in **`lib/agent-runtime-prefs.ts`** (`resolveAgentRuntimePreferences`). Shared types and defaults: **`lib/agent-preferences-shared.ts`**.

Relevant knobs include: assistant profile (`dev` | `personal` | `hybrid`), optional cost tier override, context auto-summary, Redis response cache toggle, **`openCodeInRouting`** (exclude OpenCode from model routing when false; cannot override serverless disablement), message window size, tool output cap, premium routing threshold.

### Usage metrics in Settings (web chat)

- **`runAgent`** returns optional **`usage`** built by **`lib/chat-usage.ts`** (`buildChatStreamUsagePayload`): Anthropic block (per-request `count_tokens`, approximate context footprint, per-API-call turns with cache fields, USD estimate) plus **`rolling`** from in-process ring in **`lib/anthropic-usage.ts`** (window 10; serverless = per instance).
- **`POST /api/chat`** SSE final event: `{ done: true, model, requestId, usage }` (`usage` may have `anthropic: null` when the run did not call Anthropic).
- **`app/page.tsx`** stores the last payload in **`localStorage`** key **`soli_last_stream_usage_v1`** and passes it to **`AgentSettingsPanel`** for the **Metriche ultima richiesta** section.
- UI metrics now include per-request breakdown (`input` / `output` / `cache read`) and **session cumulative cost** (`sessionCost`) updated on each completed stream.
- Pricing logic is model-aware in `lib/anthropic-usage.ts` via `getAnthropicPricingForModel` (Opus/Sonnet/Haiku profiles) with fallback compatibility to `getAnthropicPricingUsdPerMillion`.
- `AgentSettingsPanel` must stay backward-compatible with legacy `streamUsage` payloads restored from `localStorage` (missing `costBreakdownUsd` / `sumCacheReadTokens`): use safe defaults to avoid runtime crashes.

### Chat UX runtime additions

- `app/page.tsx` uses `AbortController` for `/api/chat` SSE and exposes a `⏹ Stop` button while `loading=true`; abort is handled as non-error flow (`AbortError`).
- Message bubbles render Markdown via `react-markdown` + `remark-gfm`; code blocks use `react-syntax-highlighter` (Prism/oneDark).
- Message-level actions: hover copy (`navigator.clipboard` with fallback) and code-block downloads (`extractDownloadableFiles` + `downloadFile`).

## GitHub repos: README-first contextualization

When Soli (runtime agent) works on an **existing** `owner/repo` via tools:

1. It must read **root `README.md`** with `read_github_file` before large edits or multi-file plans (see **`lib/agent/prompts.ts`** — sections *REPOSITORY GITHUB ESISTENTI* and *FLUSSO per modifiche a progetti esistenti*).
2. Tool descriptions in **`lib/agent/tools/definitions.ts`** (`read_github_file`, `list_github_files`) reinforce this.
3. For monorepos, follow up with `list_github_files` + extra README / `AGENTS.md` / `CONTRIBUTING.md` under relevant paths when the task requires it.

**Cursor / local work on this repo:** treat **`README.md`** and **`AGENTS.md`** the same way — they are the human-facing and agent-facing entry points. **`AI_LOG.md`** holds a retroactive AI-assisted development log (Italian) for this repo.

## Commands

`npm run dev` (webpack, http://localhost:3000) · `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:e2e` · `npm run build` · `npm run repomix` · `npm run eval` (suite in `evals/`, opzionale)

## Useful files

`README.md` · **`AGENT.md`** · **`AGENTS.md`** (this file) · **`AI_LOG.md`** · `.env.example` · `repomix.config.ts` · `.repomixignore` · `playwright.config.ts` · `.github/workflows/eval.yml` · `.github/workflows/smoke-secrets.yml` · `lib/agent-runtime-prefs.ts` · `lib/agent-preferences-shared.ts` · `lib/chat-usage.ts` · `lib/agent/prompts.ts` · `lib/agent/run-agent.ts` · `lib/agent/tools/dry-run.ts` · `lib/agent/tools/tool-impl.ts` · **`lib/agent/tools/search-knowledge.ts`** (RAG Soli Prof + RRF) · `lib/anthropic-cache.ts` · `lib/anthropic-usage.ts` · `lib/token-optimize.ts` · `app/api/chat/route.ts` · `app/page.tsx` · `app/layout.tsx` (font SoliDS) · `app/components/AgentSettingsPanel.tsx` · `app/components/SoliLogo.tsx` · `app/loading.tsx` · `app/manifest.ts`

### Sub-agent roles

- Runtime `spawn_sub_agent` roles in `lib/agent/tools/definitions.ts`: `frontend`, `backend`, `devops`, `tester`, `code-reviewer`, `general`, `mobile`, `graphic-designer`.
- `graphic-designer` maps to **Soli Designer** in `lib/subagent.ts` (`ROLE_PROMPTS`): primary role is UI/UX consultancy (analysis, actionable specs, post-change validation) aligned to `@soli92/solids`; image generation is secondary.
- Soli Designer image stack: `generate_image` (OpenAI), `generate_image_hf` (fal.ai FLUX async job), `generate_svg_recraft` (Recraft V3 SVG via fal.ai), `check_image_job`, `create_svg`, `generate_css_gradient`, `create_favicon`; env key: `FAL_API_KEY` (see `.env.example`).
- In `spawnSubAgent`, role `graphic-designer` forces `premium=true` to keep quality-first behavior in routing decisions.
- Sub-agent runtime controls (env): `SOLI_SUBAGENT_MAX_ITERATIONS` (default 20), `SOLI_SUBAGENT_GRAPHIC_DESIGNER_MAX_ITERATIONS` (default 30), `SOLI_SUBAGENT_TIMEOUT_MS` (default 300000), `SOLI_MAX_PARALLEL_SUBAGENTS` (default 3).
- Parallel orchestration: if running agents reach `SOLI_MAX_PARALLEL_SUBAGENTS`, new jobs are created as `queued`; queue drains automatically when a running agent completes/fails.
- Timeout behavior: when `SOLI_SUBAGENT_TIMEOUT_MS` is reached, sub-agent status becomes `failed` with result `Timeout raggiunto`.
- Sub-agent runtime state is persisted on Redis (`subagent:{id}`, TTL 3600s) with in-memory `Map` kept as hot cache for local execution.
- Redis payload for `subagent:{id}` is written as JSON string (`JSON.stringify(...)`) and read back with `redis.get<SubAgent>` (Upstash auto-deserialization), avoiding manual `JSON.parse` in runtime paths.
- Public status endpoint for UI polling: `GET /api/subagent-status?id=agent-xxxxxxxx` → `{ status, result, role, task }` or `{ status: "not_found" }`.
- `app/page.tsx` detects `agent-[a-f0-9]{8}` in assistant messages and starts 10s polling; completed jobs show an in-chat CTA that auto-sends `Mostrami il risultato del sub-agente {id}`.
- `app/api/image-worker/route.ts` calls fal.ai endpoint (`https://fal.run/fal-ai/flux/schnell`) with `Authorization: Key <FAL_API_KEY>`.
- Async image worker flow: `generate_image_hf` writes `hf_job:{jobId}` on Redis (`getRedisClient`, TTL 3600s) and triggers `POST /api/image-worker` fire-and-forget; polling result via `check_image_job`.
- Worker completed payload stores `result` as the fal.ai image URL (no base64 blob persisted in Redis).
- `generate_svg_recraft` uses `POST https://fal.run/fal-ai/recraft-v3` with `output_format: "svg"` and returns a direct SVG URL.
- Worker trigger base URL fallback: `NEXT_PUBLIC_BASE_URL -> BASE_URL -> https://${VERCEL_URL}`.

### Tool hook e dry-run (eval / tracing)

- **`RunAgentOptions.onToolCall`** — dopo ogni tool nel loop principale Anthropic/OpenAI (`run-agent.ts`): `{ name, input, result, ok, durationMs }`. Utile per eval e integrazioni (es. Langfuse). I path stream Gemini/OpenCode non passano da questo loop.
- **`SOLI_TOOLS_DRY_RUN`** (`true` / `1` / `yes` / `on`) — in `lib/agent/tools/dry-run.ts`: tool mutanti restituiscono output fittizi; **letture** restano reali se le chiavi ci sono. In **GitHub Actions** (`eval.yml`) è sempre attivo per l’eval; con **`SOLI_EVAL_MODE=true`** o **`CI=true`** viene loggata una riga `[dry-run] intercepted …` per ogni tool intercettato (utile nei log della CI).
- Il tool **`search_knowledge`** (Soli Prof RAG) **non** è pass-through: in dry-run resta **simulato** (nessuna chiamata HTTP a soli-prof).

### Tool `search_knowledge` (knowledge base personale)

- **Implementazione**: `lib/agent/tools/search-knowledge.ts` — tre POST parallele a `{SOLI_PROF_RAG_URL}/api/rag/query` (`ai_logs`, `agents_md`, `repo_configs`), fusione **RRF**, stringa contesto per il modello.
- **Registro**: `definitions.ts` + `executeTool` in `tool-impl.ts`; etichetta UI in `labels.ts`.
- **Env** (vedi `.env.example`): **`SOLI_PROF_RAG_API_KEY`** (obbligatoria per chiamate reali; allineata a `RAG_API_KEY` su soli-prof); **`SOLI_PROF_RAG_URL`** opzionale (default `https://soli-prof.vercel.app`).
- **System prompt**: `lib/agent/prompts.ts` — usare il tool quando l’utente chiede come ha fatto / convenzioni / decisioni sui propri repo indicizzati.

- **Soli Prof — ingest da `push` (soli92/soli-agent)**: oltre al tool, gli stessi repo sono in **`CORPUS_REPOS`**; un **webhook** `push` su GitHub verso `https://soli-prof.vercel.app/api/webhooks/github` consente a Soli Prof di rieseguire **ingest selettivo** (HMAC) senza toccare questo repository. I test in **`npm test`** (dry-run, dipendenze, ecc.) non dipendono da quel canale. Script e env di setup hook: [soli-prof `AGENTS.md`](https://github.com/soli92/soli-prof/blob/main/AGENTS.md), `scripts/setup-webhooks.sh` nel repo Soli Prof.

### Anthropic (Claude): token, costi, cache, contesto

- **`messages.countTokens`** prima di ogni `messages.create` (stesso `model`, `system`, `messages`, `tools`): evento JSON `anthropic_count_tokens_pre_message` + riga console.
- Dopo ogni risposta: console `[Anthropic] turno: input_tokens=… output_tokens=…` (+ cache read/create se presenti); JSON `anthropic_turn_tokens` con stima USD; ogni **10 turni** media mobile e `anthropic_rolling_avg_10` (prezzi sovrascrivibili con `SOLI_ANTHROPIC_INPUT_USD_PER_MILLION` / `OUTPUT`).
- **`SOLI_SYSTEM_PROMPT_VARIANT=concise`**: system statico accorciato (`prompts.ts`) per confronto token/qualità rispetto al default.
- **Prompt cache**: `SOLI_ANTHROPIC_PROMPT_CACHE`; `cache_control` sul blocco statico solo se i token stimati del prefisso ≥ `SOLI_PROMPT_CACHE_MIN_STATIC_TOKENS` (default 1024).
- **Tetto contesto**: `SOLI_MAX_APPROX_CONTEXT_INPUT_TOKENS` (>0) → più passate di `applyMessageWindow` con budget caratteri ridotto finché l’euristica input non scende sotto il tetto (si integra con `SOLI_MESSAGE_WINDOW_MAX_CHARS`).

### Model routing / circuit breaker

- Router supports **nano** complexity (very short/simple prompts) to force lowest-cost tier.
- Routing can keep continuity with **sticky session model** (`session_model:{clientUserId}`, TTL 600s) when compatible provider/model is still available.
- 429 handling now records failures in Redis via `provider_failures:{provider}` (TTL 3600s). Providers with count >= 3 are skipped in fallback chain (circuit open).
- Structured decision log event: `model_routing_decision` with `{ requestId, model, provider, costTier, reason, estimatedTokens, circuitBreakers }`.

## Rules for agents

- Dev and production builds use **`--webpack`**, not Turbopack.
- Playwright config can start the dev server; with a server already on **3000**, tests reuse it outside CI (`reuseExistingServer`).
- **`e2b`** may emit a webpack *Critical dependency* warning on build — safe to ignore.
- Do not commit secrets (`.env.local`, API keys). Use `.env.example` only as a template.
