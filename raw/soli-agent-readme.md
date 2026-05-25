# ⚡ Soli Agent

Il tuo agente di sviluppo personale che trasforma idee in codice — accessibile da qualsiasi device.

## Stack

- **Frontend / Backend**: Next.js 16 (vedi `package.json`), deploy tipico su Vercel
- **UI**: Tailwind CSS + **`@soli92/solids` ^1.14.1** (token / preset + brand assets); CSS da `app/globals.css`; **Google Fonts** (Inter, DM Sans, JetBrains Mono, famiglie tema) in `app/layout.tsx` come da linee guida SoliDS
- **Cervello**: modelli con tool use (Anthropic, OpenAI, Gemini, OpenCode, ecc. in base alle API key); prompt **dall’idea al rilascio** (web, API, deploy, checklist store); **sub-agent `mobile`** per Expo/Flutter su repo dedicato e **sub-agent `graphic-designer` (Soli Designer)** per task UX/UI, branding e asset visivi
- **Integrazioni**: GitHub API, Vercel API, E2B (sandbox), [Cursor Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints) (opzionale)
- **Interfacce**: Web Chat PWA + Telegram Bot

Per assistenti AI (Cursor / automazione):

- **[`AGENTS.md`](./AGENTS.md)** — contesto operativo completo in inglese (checklist, comandi, tab **Impostazioni** in chat, merge `agentPreferences` lato server).
- **[`AGENT.md`](./AGENT.md)** — stesso indirizzo per tool che cercano questo nome file.

Oltre al tool **`search_knowledge`** (variabili `SOLI_PROF_RAG_*` in `.env` verso [Soli Prof](https://github.com/soli92/soli-prof)), un webhook **`push`** su GitHub può attivare re-ingest lato Soli su `/api/webhooks/github` (HMAC, segreto solo in Vercel; niente da configurare in questo repository). Riferimenti: **soli-prof** `AGENTS.md` e `scripts/setup-webhooks.sh` nel repo del tutor.

L’agente in chat, quando lavora su **repository GitHub già esistenti**, è istruito a leggere **prima il `README.md` in root** (poi `AGENTS.md` / README di sottocartelle in monorepo se serve) per allinearsi a stack, comandi e convenzioni documentate.

---

## Setup in 5 passi

### 1. Clona e installa

```bash
git clone https://github.com/TUO-USERNAME/soli-agent
cd soli-agent
npm install
```

**Node.js 22+** (`engines` in `package.json`, file **`.nvmrc`**). Il **`.npmrc`** in repo punta al registry npm pubblico con `tag=latest` (utile se il tuo `~/.npmrc` globale imposta un dist-tag non standard).

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env.local
```

Poi compila `.env.local` con le tue chiavi (vedi commenti nel file).

**Chiavi necessarie:**
- `ANTHROPIC_API_KEY` → [console.anthropic.com](https://console.anthropic.com)
- `GITHUB_TOKEN` → GitHub → Settings → Developer Settings → Fine-grained tokens
- `GITHUB_USERNAME` → il tuo username GitHub

**Chiavi opzionali (funzionalità extra):**
- `VERCEL_TOKEN` → abilita il deploy automatico
- `TELEGRAM_BOT_TOKEN` → abilita il bot Telegram
- `TELEGRAM_WEBHOOK_SECRET` → protegge il webhook Telegram (consigliata)
- `E2B_API_KEY` → abilita l'esecuzione di codice in sandbox
- `FAL_API_KEY` → abilita il worker immagini (`generate_image_hf` async) via fal.ai per Soli Designer
- `CURSOR_API_KEY` → abilita i tool `cursor_cloud_*` (Cloud Agent su repo GitHub); chiave da [Cursor Dashboard → Cloud Agents](https://cursor.com/dashboard/cloud-agents), formato `key_...`. Vedi [documentazione API](https://cursor.com/docs/cloud-agent/api/endpoints).

### 3. Testa in locale

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### Test automatici

```bash
npm test              # suite Node (__tests__/*.js, smoke TS: router, cache, dry-run tool)
npm run test:watch    # watch su un file di test
npm run test:e2e      # Playwright
npm run test:e2e:ui   # Playwright con UI
```

`npm run build` per verificare la build Next prima del deploy.

### Sub-agent disponibili

- `frontend`, `backend`, `devops`, `tester`, `code-reviewer`, `general`
- `mobile` — implementazione app Android/iOS (Expo/Flutter) con checklist release/store
- `graphic-designer` (**Soli Designer**) — task visivi: logo/favicon, palette/type scale, layout/componenti UI, prompt immagini, coerenza con `@soli92/solids`
  - Routing qualità forzato: in sub-agent runtime è sempre `premium=true` per privilegiare la catena quality (Claude Sonnet prima degli altri provider)
  - Iterazioni dedicate: `SOLI_SUBAGENT_GRAPHIC_DESIGNER_MAX_ITERATIONS` (default 30), più alto degli altri ruoli
  - Tool immagini disponibili: `generate_image` (DALL-E), `generate_image_hf` (fal.ai FLUX async job), `generate_svg_recraft` (Recraft V3 SVG via fal.ai), `check_image_job`, `create_svg`, `generate_css_gradient`, `create_favicon`
  - Stato sub-agent persistito su Redis (`subagent:*`, TTL 1 ora): resilienza migliore su reload modulo/istanze serverless
  - Timeout e watchdog runtime: `SOLI_SUBAGENT_TIMEOUT_MS` (default 300000), con stato `failed` + messaggio `Timeout raggiunto` se scade
  - Concorrenza controllata: `SOLI_MAX_PARALLEL_SUBAGENTS` (default 3); oltre soglia i job passano in `queued` e partono a slot libero
  - Limite iterazioni per ruoli standard: `SOLI_SUBAGENT_MAX_ITERATIONS` (default 20), con warning log all'80%
  - API polling stato: `GET /api/subagent-status?id=agent-xxxx` (ritorna `status`, `result`, `role`, `task`; `not_found` se non presente)
  - UI chat: quando compare un `agent-xxxxxxxx` in risposta assistant, parte polling ogni 10s; su `completed` mostra banner cliccabile che invia `Mostrami il risultato del sub-agente {id}`
  - `app/api/image-worker/route.ts` usa fal.ai: `POST https://fal.run/fal-ai/flux/schnell` con auth header `Authorization: Key <FAL_API_KEY>`
  - Pattern async: `generate_image_hf` crea un `job_id` su Redis (`hf_job:*`, TTL 1 ora) e triggera `POST /api/image-worker`; per ottenere il risultato usare `check_image_job` ogni ~10 secondi
  - `check_image_job` restituisce ora direttamente l'URL CDN ritornato da fal.ai (non piu data URI base64 in Redis)
  - `generate_svg_recraft` usa `POST https://fal.run/fal-ai/recraft-v3` con `output_format: "svg"` e ritorna l'URL del file vettoriale
  - Base URL trigger worker: fallback runtime `NEXT_PUBLIC_BASE_URL -> BASE_URL -> https://${VERCEL_URL}`

**Eval suite (opzionale, cartella `evals/`):** `npm run eval` (anche `eval:chat`, `eval:tools`, `eval:baseline`). In locale servono le stesse chiavi dei provider; per evitare mutazioni reali su GitHub/deploy usa **`SOLI_TOOLS_DRY_RUN=true`** (`.env.example`, `lib/agent/tools/dry-run.ts`).

**CI GitHub:** il workflow **`.github/workflows/eval.yml`** si avvia su **pull request** che toccano agent/router/chat/evals (vedi `paths` nel file) e su **`workflow_dispatch`** (filtro categoria opzionale, flag per aggiornare `evals/reports/baseline.json` solo da `main`). Imposta i **repository secrets** `ANTHROPIC_API_KEY`, `EVAL_GITHUB_TOKEN`, `EVAL_GITHUB_USERNAME` (il job mappa il PAT su `GITHUB_TOKEN` / `GITHUB_USERNAME` per il runner); opzionali `GEMINI_API_KEY`, `OPENAI_API_KEY`. In CI sono attivi **`SOLI_TOOLS_DRY_RUN`** e **`SOLI_EVAL_MODE`** (log sintetici degli intercept dry-run). Artefatti: report `run-*.{md,json}`; su PR viene aggiunto un **commento** con esito e confronto con `baseline.json` se presente. Il workflow manuale **smoke-secrets** (`.github/workflows/smoke-secrets.yml`) verifica solo la presenza e la validità delle chiavi.

Dettagli operativi: **`evals/README.md`**, **`INTEGRATION.md`**, **`AGENTS.md`**.

### Snapshot del codice per analisi AI (opzionale)

[Repomix](https://repomix.com) genera un singolo file Markdown con il sorgente rilevante, da passare a un altro assistente o strumento che deve capire il progetto senza clonare la repo.

```bash
npm run repomix
```

L’output predefinito è **`repomix-output.md`** (in `.gitignore`: va rigenerato in locale quando serve). Cosa escludere dal pack (dipendenze, `.next`, report Playwright, artefatti di test, ecc.) è definito in **`repomix.config.ts`**, **`.repomixignore`** e nel **`.gitignore`**.

### 4. Deploya su Vercel

```bash
npm i -g vercel
vercel --prod
```

Oppure connetti la repo su [vercel.com](https://vercel.com) e aggiungi le env vars dal dashboard.

### 5. Configura il bot Telegram (opzionale)

Una volta deployato, registra il webhook:

```bash
curl -X POST "https://api.telegram.org/botTUO_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://soli-agent.vercel.app/api/telegram"}'
```

---

## Utilizzo

### Web Chat
Apri `https://soli-agent.vercel.app` dal browser.
Su mobile: **Menu → Aggiungi a schermata Home** per usarla come app nativa (PWA).

Su **mobile** trovi le tab Chat, Impostazioni e Dashboard; su **desktop** la chat è a tutta larghezza e a destra Dashboard / **Impostazioni** (preferenze agente salvate in `localStorage`, inviate come `agentPreferences` in `POST /api/chat` — dettaglio in `AGENTS.md`).

Nella tab **Impostazioni** è presente anche la sezione **Metriche ultima richiesta (Anthropic)**: dopo ogni risposta in chat il server invia nel frame SSE finale (`done: true`) un oggetto **`usage`** (token stimati pre-create, somme per turno, stima USD, media mobile sugli ultimi turni Anthropic sul processo). La UI persiste l’ultimo payload in `localStorage` sotto **`soli_last_stream_usage_v1`**. Se l’ultima risposta non passa dall’API Anthropic (cache, OpenAI, Gemini, OpenCode, ecc.), il blocco Anthropic risulta vuoto ma la media mobile può restare valorizzata. Vedi `AGENTS.md` e `lib/chat-usage.ts`.

Nel pannello chat sono disponibili anche:
- **Stop generazione** (`⏹ Stop`) durante stream SSE in corso, con `AbortController` lato client.
- **Rendering Markdown** con GFM + syntax highlighting per code block.
- **Copia rapida messaggio** (hover su bubble assistant/user).
- **Download snippet**: ogni fenced code block del messaggio assistant genera un pulsante `⬇` per scaricare il contenuto.
- **Compatibilità metriche storiche**: la tab Impostazioni gestisce payload usage vecchi in `localStorage` (fallback sicuri per campi costo introdotti dopo update).

### Telegram
Trova il tuo bot su Telegram e inizia a scrivere.
- `/start` o `/reset` — azzera la conversazione
- Qualsiasi altro testo — viene processato da Soli

### Esempi di prompt

```
Crea una landing page per una app fitness con Next.js e Tailwind
```

```
Costruisci un'API REST in Python/FastAPI per gestire una lista di task,
con endpoint CRUD e documentazione Swagger
```

```
Fai uno script Python che scarica i prezzi di Bitcoin ogni ora
e li salva in un CSV
```

---

## Struttura del progetto

```
soli-agent/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # Web Chat (SSE streaming)
│   │   ├── subagent/route.ts    # API sub-agenti
│   │   ├── subagent-status/route.ts # Polling stato sub-agenti (UI)
│   │   └── telegram/route.ts    # Webhook Telegram
│   ├── page.tsx                 # UI Chat + tab Impostazioni / Dashboard
│   ├── components/              # UI (chat, dashboard, impostazioni, mascotte)
│   │   ├── AgentSettingsPanel.tsx
│   │   ├── DashboardPanel.tsx
│   │   └── SoliCat.tsx
│   └── layout.tsx               # Layout + meta PWA
├── lib/
│   ├── agent/                   # Core agente (modulare)
│   │   ├── index.ts             # Export pubblici (runAgent, AGENT_TOOLS, …)
│   │   ├── run-agent.ts         # Loop agente, provider, cache
│   │   ├── providers.ts         # Gemini, OpenCode (stream); Anthropic/OpenAI in run-agent
│   │   ├── prompts.ts           # System prompt (incl. policy README su repo GitHub)
│   │   ├── message-window.ts    # Finestra messaggi (anti context rot)
│   │   ├── types.ts
│   │   └── tools/
│   │       ├── definitions.ts   # AGENT_TOOLS (schema Anthropic)
│   │       ├── tool-impl.ts     # Implementazioni + executeTool()
│   │       ├── search-knowledge.ts  # RAG Soli Prof (RRF su ai_logs + agents_md + repo_configs)
│   │       └── labels.ts        # Etichette UI per i tool
│   ├── agent-preferences-shared.ts   # Tipi + localStorage client → payload API
│   ├── agent-runtime-prefs.ts        # Merge env + body `agentPreferences`
│   ├── chat-usage.ts                 # Payload `usage` per SSE + tipi condivisi con la UI
│   ├── anthropic-usage.ts            # Log turno, media mobile, stima USD (env prezzi)
│   ├── token-optimize.ts             # Tetto euristico contesto (SOLI_MAX_APPROX_CONTEXT_INPUT_TOKENS)
│   ├── context.ts               # Contesto sessione + digest
│   ├── router.ts                # Analisi task e scelta modello primario
│   ├── subagent.ts
│   ├── optimize.ts              # Redis: cache, rate limit
│   └── fallback.ts              # Euristiche semplici (non routing LLM)
├── app/manifest.ts              # PWA manifest (route /manifest.webmanifest)
└── .env.example                 # Template variabili d'ambiente
```

Per ogni richiesta viene scelto **un solo modello** (il migliore tra quelli configurati). I task che richiedono tool usano solo provider che supportano i tool, senza passare automaticamente a modelli più deboli se il principale fallisce (eventuale secondo tentativo solo per errori transitori sullo stesso provider).

Routing aggiornato:
- fallback multi-provider con chain ordinata per tier (`economy`/`premium`)
- circuit breaker Redis su 429/quota (`provider_failures:{provider}`, TTL 1h, skip provider dopo 3 failure)
- livello `nano` per richieste semplicissime (prompt molto breve): forza modello economico
- sticky model di sessione (`session_model:{clientUserId}`, TTL 10 min) per coerenza nei follow-up
- evento strutturato `model_routing_decision` nei log runtime (reason, provider saltati, token stimati)

---

## Come aggiungere un nuovo tool a Soli

1. Aggiungi la definizione in `AGENT_TOOLS` in `lib/agent/tools/definitions.ts`
2. Implementa la funzione (file dedicato es. `search-knowledge.ts` oppure inline in `lib/agent/tools/tool-impl.ts`)
3. Aggiungi il `case` in `executeTool()` in `tool-impl.ts`
4. Se il tool deve essere **simulato** con `SOLI_TOOLS_DRY_RUN`, aggiungi un `case` in `lib/agent/tools/dry-run.ts` → `buildFake` (non in `PASS_THROUGH` se non deve chiamare reti esterne)
5. (Opzionale) Etichetta in `lib/agent/tools/labels.ts` per la chat

Esempio — tool per inviare email:

```typescript
// 1. Definizione (in definitions.ts, dentro l'array AGENT_TOOLS)
{
  name: "send_email",
  description: "Invia un'email",
  input_schema: {
    type: "object",
    properties: {
      to: { type: "string" },
      subject: { type: "string" },
      body: { type: "string" },
    },
    required: ["to", "subject", "body"],
  },
}

// 2. Implementazione (in tool-impl.ts)
async function sendEmail(input: { to: string; subject: string; body: string }) {
  // ... logica con Resend, Nodemailer, ecc.
}

// 3. Dispatcher (sempre in tool-impl.ts, dentro executeTool)
case "send_email": return sendEmail(input as Parameters<typeof sendEmail>[0]);
```
