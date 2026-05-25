# AGENTS.md — Operative Context for AI Assistants

**Updated:** 2026-05-25

**Soli Projects** is a Next.js 16 web app for cross-project management of soli92 repositories, with a dedicated Claude AI agent **and a centralized LLM Wiki knowledge base** (pattern llm-wiki++ v2.11 from soli-multi-agents-factory). This document describes architecture, conventions, and operative context for AI assistants (Cursor, Soli Agent, others).

## Project overview

### What is it?
A **personal portfolio + AI copilot + centralized knowledge base** that aggregates state, ideas, todos, and technical debt across the 16 soli92 repositories. The KB follows the llm-wiki pattern (Karpathy) extended with agentic project management. Other repos include this one as a **git submodule** for direct access to the wiki.

### Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 (strict) |
| **Styling** | Tailwind CSS 3.4 + `@soli92/solids` **^1.14.1** preset + CSS variables; font stack in `app/layout.tsx` |
| **LLM** | Anthropic Claude (via `@anthropic-ai/sdk`) |
| **Database** | Supabase — shared project with soli-prof, **dedicated tables** (no prefix; soli-prof uses `rag_*` namespace) |
| **Deployment** | Vercel (auto-deploy from `main`) |
| **Testing** | Vitest 3, jsdom environment |
| **KB Pattern** | llm-wiki++ v2.11 (plan-only topology, Cursor adapter) |

### GitHub Repo
- **Owner**: soli92
- **Visibility**: Public
- **Default branch**: `main`
- **URL**: https://github.com/soli92/soli-projects
- **Docs**: README.md, WEEKLY_LOG.md, AI_LOG.md, AGENTS.md, AGENT.md (redirect)

---

## Directory structure

```
soli-projects/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard: lista progetti attivi
│   ├── layout.tsx                # Root layout, metadata, Google Fonts, SoliDS CSS
│   ├── globals.css               # Tailwind directives + SoliDS CSS import
│   ├── login/page.tsx            # Login (password singola HMAC)
│   ├── wiki/
│   │   ├── page.tsx              # /wiki — indice wiki navigabile (raggruppato per tipo)
│   │   └── [...slug]/page.tsx    # /wiki/<slug> — viewer singola pagina markdown
│   ├── tasks/
│   │   └── page.tsx              # /tasks — task cross-progetto (operativi + strategici)
│   └── projects/
│       └── [slug]/page.tsx       # /projects/<slug> — dettaglio (overview/ideas/todos/directives)
├── components/
│   ├── layout/AppHeader.tsx      # Navbar (Dashboard, Wiki, Task, Esci)
│   ├── projects/                 # ProjectCard, Header, Tabs, Todo/Idea list+form, SnapshotSection, DirectiveForm
│   ├── wiki/                     # WikiPageCard, WikiPageViewer, WikiBreadcrumb, WikiSearch, WikiStatusBadge
│   └── tasks/                    # CrossProjectTaskBoard, CrossProjectTaskCard, TaskFilters, KanbanSection, KanbanItemCard
├── lib/
│   ├── data/                     # Supabase data layer (projects, ideas, todos, snapshots)
│   ├── actions/                  # Server actions (ideas, todos, kanban, directives)
│   ├── auth/                     # HMAC session auth (actions, session)
│   ├── wiki/                     # reader.ts (fs + gray-matter), render.ts (remark + wikilinks)
│   ├── kanban/                   # reader.ts (EP/US/TSK parser from management/kanban/)
│   ├── github/                   # client.ts (read), writer.ts (create files in remote repos)
│   ├── supabase/                 # server.ts, browser.ts, types.ts
│   ├── validation/               # Zod schemas
│   ├── format/                   # relative.ts (Italian relative time)
│   └── solids-package.test.ts    # Validates @soli92/solids range
├── raw/                          [L1 — immutable sources]
│   ├── .extraction-manifest.json # Sync manifest
│   ├── images/                   # Figure estratte
│   └── <repo>-agents.md          # AGENTS.md dai singoli repo (sync)
├── wiki/                         [L2 — LLM wiki karpathy-style]
│   ├── index.md                  # Overview + navigazione
│   ├── log.md                    # Append-only operation log
│   ├── gaps.md                   # Feedback loop (gap aperti/chiusi)
│   ├── sources/                  # Una pagina per sorgente ingerita
│   ├── concepts/                 # Concetti di dominio trasversali
│   ├── entities/                 # Servizi, librerie, piattaforme
│   ├── syntheses/                # Risposte cross-source consolidate
│   ├── runbooks/                 # Playbook operativi
│   ├── incidents/                # Post-mortem (append-only)
│   ├── query/                    # Risposte persistite
│   └── lint/                     # Lint report
├── management/                   [L3 — project management]
│   ├── kanban/                   # EP-XXX/US-YYY/TSK-ZZZ
│   ├── roadmap.md                # Release planning
│   └── questions.md              # Gate domande (hard/soft)
├── design_&_architecture/        [L4 — architecture]
│   ├── api_specs/
│   ├── db_schemas/
│   └── decisions/                # ADR-NNN.md
├── memory/                       [Cross-conversation persistence]
│   ├── episodic/                 # Run records
│   ├── semantic/                 # Fatti consolidati
│   └── procedural/              # Playbook riutilizzabili
├── PATTERN.md                    # Contratto universale agent-agnostic (v2.11)
├── factory.config.yaml           # Config: topology, routing, scheduler
├── .cursor/
│   ├── rules/                    # Adapter Cursor: ruoli PATTERN §2
│   │   ├── factory-contract.mdc  # Pointer al contratto + mapping ruoli
│   │   ├── orchestrator.mdc
│   │   ├── wiki-keeper.mdc
│   │   ├── sync-docs.mdc
│   │   ├── product-manager.mdc
│   │   ├── lead-architect.mdc
│   │   ├── tpm.mdc
│   │   ├── wiki-query.mdc
│   │   └── wiki-lint.mdc
│   └── skills/                   # Procedure canoniche (fat skills)
│       ├── citation-rules/
│       ├── ingest-protocol/
│       ├── query-protocol/
│       ├── lint-checks/
│       ├── wiki-gap-protocol/
│       ├── wiki-log-entry/
│       ├── scrivi-wiki-page/
│       ├── scrivi-epica/
│       ├── scrivi-user-story/
│       ├── scrivi-task/
│       ├── apri-question/
│       ├── promote-status/
│       └── heal-protocol/
├── .github/workflows/ci.yml     # CI: lint + type-check + test + build
├── package.json
├── README.md
├── AGENTS.md                     # This file
├── AI_LOG.md
└── LICENSE
```

---

## LLM Wiki KB (llm-wiki++ v2.11)

### Pattern

Il repo segue il pattern **llm-wiki++** v2.11 (da [soli-multi-agents-factory](https://github.com/soli92/soli-multi-agents-factory)). Il contratto universale è in `PATTERN.md`; la configurazione in `factory.config.yaml`.

### Topology: plan-only

- **L1 `raw/`** — sorgenti immutabili (AGENTS.md, AI_LOG.md, README.md dai repo soli92)
- **L2 `wiki/`** — wiki strutturata con citazioni e wikilink
- **L3 `management/`** — epiche, storie, task per consumo umano
- **L4 `design_&_architecture/`** — architettura e ADR
- **L5** — non attivo (nessun dev-agent)

### Adapter Cursor

I ruoli PATTERN §2 sono implementati come `.cursor/rules/` (identità) + `.cursor/skills/` (procedure). Vedi `.cursor/rules/factory-contract.mdc` per il mapping completo.

### Operazioni principali

| Operazione | Come invocare | Ruolo |
|---|---|---|
| Stato progetto | "mostra stato progetto" | Orchestrator |
| Sync sorgenti | "sync raw/ dai repo" | Sync |
| Ingest wiki | "ingerisci raw/<file>" | Wiki Keeper |
| Query wiki | "query: <domanda>" | Wiki Query |
| Lint wiki | "lint wiki" | Wiki Lint |
| Plan (epiche/storie) | "pianifica da wiki" | PM |
| Design | "disegna architettura" | Architect |
| Task | "genera task da design" | TPM |
| Promote | "promote <path> <status>" | Orchestrator |
| Heal | "heal <lint-report>" | Wiki Keeper |

### Cross-project scope

Repository indicizzati nella KB (16):
`soli-agent`, `soli-prof`, `soli-projects`, `soli-platform`, `solids`, `Koollector`, `soli-dome`, `pippify`, `bachelor-party-claudiano`, `casa-mia-fe`, `casa-mia-be`, `soli-dm-fe`, `soli-dm-be`, `llm-wiki-template`, `soli-obsidian-vault`, `soli-multi-agents-factory`.

### Git submodule for consumers

Other repos include `soli-projects` as a submodule to access `wiki/`, `management/`, and `memory/`.

**Setup (from vertical repo root):**
```bash
git submodule add https://github.com/soli92/soli-projects.git .soli-projects
git commit -m "chore: add soli-projects KB as submodule"
```

**Convention for vertical agents:**
- **Read** `.soli-projects/wiki/` for cross-project context
- **Write** to `.soli-projects/raw/` (new sources) or `.soli-projects/management/kanban/` (tasks)
- Commit and push the submodule changes; the parent repo tracks the new SHA

**Updating the submodule (from vertical repo):**
```bash
cd .soli-projects && git pull origin main && cd .. && git add .soli-projects && git commit -m "chore: update KB submodule"
```

### Directives (hub → vertical repos)

soli-projects can send directives to vertical repos via GitHub Contents API. Each vertical repo should have a `directives/` folder (gitkeep). Directives follow this format:

```yaml
---
id: DIR-<timestamp>
from: soli-projects
date: YYYY-MM-DD
priority: low|medium|high|critical
wiki_refs: ["wiki/concepts/rag-pipeline"]
---
# Title
Body of the directive...
```

The vertical repo's ingest/PM flow picks up files from `directives/` and processes them. The hub UI for sending directives is at `/projects/<slug>?tab=directives`.

---

## Hub application features

### Wiki Navigator (`/wiki`)

Server-rendered wiki browser backed by the filesystem (`wiki/` directory).
- `lib/wiki/reader.ts` — `listWikiPages()`, `getWikiPage(slug)`, `searchWikiPages(query)` via `gray-matter` frontmatter parsing
- `lib/wiki/render.ts` — remark + remark-gfm + remark-html pipeline with `[[wikilink]]` resolution and `[^src:]` citation formatting
- Route `/wiki` — index grouped by type (source, concept, entity, synthesis)
- Route `/wiki/[...slug]` — single page viewer with breadcrumb, frontmatter badges, rendered markdown

### Cross-Project Task Manager (`/tasks`)

Two data sources, one unified view:
- **Operativi** (tab) — `pm_todos` from Supabase, aggregated across all projects via `listAllTodos()` with join to `pm_projects`; filterable by project, status, priority; switchable list/board view
- **Strategici** (tab) — EP/US/TSK markdown files from `management/kanban/` parsed by `lib/kanban/reader.ts`

Server actions:
- `lib/actions/kanban.ts` — `createKanbanTaskAction`, `updateKanbanStatusAction` (write/update `.md` files)
- `lib/actions/directives.ts` — `createDirectiveAction` (push to vertical repo via GitHub API)

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config)
npm run type-check   # tsc --noEmit
npm test             # Vitest run (CI mode)
npm run test:watch   # Vitest watch mode
```

---

## Key files

| File | Purpose |
|------|---------|
| `PATTERN.md` | Contratto universale agent-agnostic v2.11 |
| `factory.config.yaml` | Config factory: topology, routing, scheduler |
| `wiki/index.md` | Overview KB + navigazione |
| `wiki/log.md` | Operation log (append-only) |
| `wiki/gaps.md` | Feedback loop gap |
| `management/roadmap.md` | Release planning cross-progetto |
| `management/questions.md` | Gate domande bloccanti |
| `app/page.tsx` | Dashboard — lista progetti attivi |
| `app/wiki/page.tsx` | Wiki navigator index |
| `app/wiki/[...slug]/page.tsx` | Wiki page viewer |
| `app/tasks/page.tsx` | Cross-project task manager |
| `app/projects/[slug]/page.tsx` | Project detail (overview/ideas/todos/directives) |
| `lib/wiki/reader.ts` | Wiki filesystem reader (gray-matter) |
| `lib/wiki/render.ts` | Wiki markdown renderer (remark + wikilinks) |
| `lib/kanban/reader.ts` | Kanban file parser (EP/US/TSK) |
| `lib/github/writer.ts` | GitHub Contents API writer (directives) |
| `lib/data/todos.ts` | Todo data layer incl. `listAllTodos()` cross-project |
| `lib/actions/kanban.ts` | Server actions for kanban CRUD |
| `lib/actions/directives.ts` | Server action for pushing directives to repos |
| `lib/solids-package.test.ts` | Validates `@soli92/solids` dependency range |
| `tailwind.config.ts` | SoliDS Tailwind preset + typography plugin |

---

## Soli Prof integration

This repository is in **`CORPUS_REPOS`** on [soli-prof](https://github.com/soli92/soli-prof). A **GitHub push webhook** pointing to `https://soli-prof.vercel.app/api/webhooks/github` handles automatic re-ingest on push.

---

## Supabase schema

- Shares the same Supabase project as soli-prof
- soli-prof occupies the `rag_*` table namespace
- soli-projects uses **unprefixed table names**
- Connection: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only); `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-side)

---

## Code conventions

### Language
- **UI strings and docs**: Italian (`README.md`, `AI_LOG.md`, user-facing text)
- **Code, types, comments, AGENTS.md**: English
- **Wiki content**: Italian (lingua dei documenti sorgente)

### File naming
- Components: PascalCase `.tsx` (e.g. `ProjectCard.tsx`)
- Utilities/lib: kebab-case `.ts` (e.g. `supabase-client.ts`)
- Wiki/management: kebab-case `.md` (e.g. `event-sourcing.md`)
- Routes: Next.js App Router conventions

### TypeScript
- Strictly `strict: true`
- Explicit types for function params and return values
- No `any` without justified comment

### React + Next.js
- App Router — server components by default
- `"use client"` only for interactive components
- No styled-components; use Tailwind + SoliDS tokens

### Tailwind / SoliDS
- Use semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, etc.
- Mobile-first responsive: `md:`, `lg:` breakpoints

---

## CI / GitHub Actions

Workflow: `.github/workflows/ci.yml`
- Trigger: push to `main`, pull_request
- Node 22 on ubuntu-latest
- Steps: checkout → setup-node (cache npm) → npm ci → lint → type-check → test → build

---

## Rules for agents

- Follow `PATTERN.md` for all wiki/management/architecture operations.
- Respect role scopes (§2): never write outside your designated paths.
- Citations are mandatory on non-trivial claims (§6, §7).
- `wiki/log.md`, `wiki/gaps.md`, `wiki/incidents/` are append-only.
- Report + STOP before batch writes (§7 r.6).
- Do not commit secrets (`.env.local`, API keys).
- Keep `package-lock.json` committed for CI.
- After changes to wiki structure: update this `AGENTS.md` if needed.

---

## Links

- **GitHub**: https://github.com/soli92/soli-projects
- **Live**: https://soli-projects.vercel.app
- **soli-prof**: https://github.com/soli92/soli-prof (RAG + knowledge base)
- **soli-agent**: https://github.com/soli92/soli-agent (Soli dev agent)
- **soli-multi-agents-factory**: https://github.com/soli92/soli-multi-agents-factory (meta-prompt source)
- **@soli92/solids**: https://www.npmjs.com/package/@soli92/solids
