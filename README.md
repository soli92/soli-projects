# Soli Projects

Hub centrale dell'ecosistema soli92: knowledge base cross-progetto (LLM Wiki), task manager unificato, documentation navigator e sistema di direttive bidirezionale verso i repo verticali.

## Funzionalita principali

- **Dashboard** (`/`) — panoramica dei 14+ progetti attivi con stato, stack e link rapidi
- **Wiki Navigator** (`/wiki`) — consultazione della knowledge base con 25+ pagine wiki (sources, concepts, entities), ricerca full-text, rendering markdown con wikilink cliccabili
- **Task Manager** (`/tasks`) — vista cross-progetto con due tab:
  - **Operativi** — todo aggregati da tutti i progetti Supabase, filtrabili per progetto/stato/priorita, vista lista o board kanban
  - **Strategici** — epiche, user story e task dal kanban factory (`management/kanban/`)
- **Dettaglio progetto** (`/projects/<slug>`) — tab Overview (snapshot GitHub), Idee, Todo, e **Direttive** (invio di note operative ai repo verticali via GitHub API)
- **LLM Wiki Factory** — pattern llm-wiki++ v2.20, topologia `full-stack-agents`: oltre alla KB (sorgenti sincronizzate da 16 repo), la factory sviluppa la propria app con dev-agent (be/fe/db/qa) nell'adapter Cursor

## Stack

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **UI** | Tailwind CSS + `@soli92/solids` ^1.14.1 (token / preset) + `@tailwindcss/typography` |
| **LLM** | Anthropic Claude (via `@anthropic-ai/sdk`) |
| **Wiki** | gray-matter (frontmatter), remark + remark-gfm + remark-html (rendering), filesystem |
| **Database** | Supabase (schema `pm_*`, condiviso con soli-prof) |
| **Hosting** | Vercel (deploy automatico da `main`) |
| **Test** | Vitest 3 (unit), Playwright (E2E) |
| **KB Pattern** | llm-wiki++ v2.20 (full-stack-agents, Cursor adapter) |

## Setup locale

```bash
# 1. Clona
git clone https://github.com/soli92/soli-projects
cd soli-projects

# 2. Installa dipendenze (@soli92/solids e' pubblico su npm)
npm install

# 3. Configura variabili d'ambiente
cp .env.example .env.local
# Compila .env.local con le chiavi necessarie:
# - SOLI_PROJECTS_PASSWORD (password di accesso)
# - SOLI_PROJECTS_SESSION_SECRET (min 16 char per HMAC)
# - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# - GITHUB_TOKEN (lettura snapshot + scrittura direttive)

# 4. Avvia il dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Comandi

```bash
npm run dev          # Dev server
npm run build        # Build produzione
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm test             # Vitest (run once)
npm run test:watch   # Vitest watch
npm run test:e2e     # Playwright E2E (Chromium)
npm run test:e2e:headed  # Playwright E2E con browser visibile
```

## Schema database

- Le tabelle vivono nello stesso progetto Supabase di soli-prof, con prefisso `pm_`.
- Migration in `sql/`, applicate via Supabase SQL Editor o psql.
- Tabelle: `pm_projects`, `pm_ideas`, `pm_todos`, `pm_debt_items`, `pm_snapshots`.
- Seed: `sql/002_seed_projects.sql` (14 progetti).

## Knowledge base (LLM Wiki)

Il repo include una knowledge base strutturata secondo il pattern llm-wiki++ v2.20:

- `raw/` — sorgenti immutabili (AGENTS.md, AI_LOG.md, README.md da 16 repo)
- `wiki/` — pagine wiki con citazioni e wikilink
- `management/kanban/` — epiche, storie e task strategici (EP/US/TSK-*.md)
- `PATTERN.md` — contratto agent-agnostic
- `factory.config.yaml` — configurazione (topology `full-stack-agents`, `code_path: "."`)

La factory ha **doppia natura**: KB cross-progetto *e* applicazione che sviluppa se stessa. I dev-agent dell'adapter Cursor (`be/fe/db/qa-dev`) consumano i TSK e producono codice in `app/`, `lib/`, `components/`; il deploy (`infra`) resta umano (Vercel).

### Integrazione submodule

Gli altri repo possono includere soli-projects come submodule:

```bash
git submodule add https://github.com/soli92/soli-projects.git soli-projects
```

L'agent locale del repo verticale legge `wiki/` e scrive in `raw/` o `management/kanban/`.

## Submodule Setup

Questa sezione documenta come usare `soli-projects` come git submodule nei repository verticali (soli-agent, solids, soli-prof, ecc.).

### Clonare un repo con il submodule gia' configurato

Usa `--recurse-submodules` per clonare e inizializzare il submodule in un solo comando:

```bash
git clone --recurse-submodules https://github.com/soli92/<repo-verticale>.git
```

Se hai gia' clonato senza il flag, inizializza manualmente:

```bash
git submodule update --init
```

> Nota: evita `--recursive` se non necessario — soli-projects contiene a sua volta
> submoduli di altri repo che potrebbero richiedere credenziali aggiuntive.

### Aggiornare il submodule a HEAD

Per portare il puntatore del submodule all'ultimo commit di `main` di soli-projects:

```bash
git submodule update --remote --merge
```

Poi crea un commit nel repo verticale per registrare il nuovo puntatore:

```bash
git add soli-projects
git commit -m "chore: update soli-projects submodule to latest"
```

### Quando fare pull del submodule

- Dopo ogni `git pull` nel repo verticale, se il puntatore e' cambiato, esegui:
  ```bash
  git submodule update --init
  ```
- Periodicamente (es. inizio sprint) per avere la wiki aggiornata:
  ```bash
  git submodule update --remote --merge
  ```
- Prima di creare PR che dipendono da contenuti wiki o direttive aggiornate.

### Risolvere conflitti di puntatore submodule

Un conflitto sul puntatore del submodule (file `soli-projects`) appare come un normale
conflitto di merge. Per risolverlo:

1. Visualizza le due versioni del puntatore:
   ```bash
   git diff HEAD MERGE_HEAD -- soli-projects
   ```
2. Scegli la versione corretta (di solito quella piu' recente):
   ```bash
   # Accetta la versione in arrivo (MERGE_HEAD)
   git checkout --theirs soli-projects
   # oppure mantieni la tua (HEAD)
   git checkout --ours soli-projects
   ```
3. Allinea la working directory al puntatore scelto:
   ```bash
   git submodule update
   ```
4. Aggiungi e completa il merge:
   ```bash
   git add soli-projects
   git commit
   ```

### Direttive

Da `/projects/<slug>?tab=directives` si possono inviare direttive ai repo verticali (file `directives/DIR-*.md` creati via GitHub API).

## Route dell'app

| Route | Descrizione |
|-------|-------------|
| `/` | Dashboard progetti attivi |
| `/login` | Login con password singola |
| `/wiki` | Indice wiki (raggruppato per tipo) |
| `/wiki/<slug>` | Viewer singola pagina wiki |
| `/tasks` | Task manager cross-progetto (operativi + strategici) |
| `/projects/<slug>` | Dettaglio progetto (overview, idee, todo, direttive) |

## Documentazione

- [AI_LOG.md](./AI_LOG.md) — memoria sviluppo AI-assisted
- [AGENTS.md](./AGENTS.md) — contesto operativo per agenti AI
- [PATTERN.md](./PATTERN.md) — contratto LLM Wiki v2.20
- [WEEKLY_LOG.md](./WEEKLY_LOG.md) — avanzamento settimanale

## Link correlati

- [soli-prof](https://github.com/soli92/soli-prof) — AI tutor + sistema RAG
- [soli-agent](https://github.com/soli92/soli-agent) — agente di sviluppo Soli
- [soli-multi-agents-factory](https://github.com/soli92/soli-multi-agents-factory) — meta-prompt LLM Wiki
- [@soli92/solids](https://www.npmjs.com/package/@soli92/solids) — design system

## Licenza

MIT © [soli92](https://github.com/soli92)
