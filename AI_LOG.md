# AI_LOG — soli-projects

Memoria del processo di sviluppo AI-assisted. Scritto in italiano, aggiornato a ogni sessione significativa.

---

## Aggiornamento 2026-04-30 — Scaffold iniziale

### Cosa è stato fatto

**Scaffold infrastrutturale completo** del nuovo repo `soli92/soli-projects`.

#### Stack scelto
- **Next.js 16 + React 19 + TypeScript 5 (strict)** — allineato al pattern soli-prof e soli-dome (stessa generazione stack).
- **Tailwind CSS 3 + `@soli92/solids` ^1.14.1** — preset Tailwind e CSS variables da SoliDS, stessa versione usata in soli-prof, soli-dome, health-wand-and-fire.
- **Vitest 3** per test; ambiente `jsdom` (coerente con progetto front-end).
- **ESLint flat config** compatibile Next 16 (pattern soli-prof).
- **target ES2022** in tsconfig (upgrade rispetto a ES2020 di soli-prof, richiesto esplicitamente nello scaffold); `jsx: "preserve"` per Next.js App Router.

#### Integrazione soli-prof RAG (webhook)
Il repo `soli-projects` sarà aggiunto a `CORPUS_REPOS` in `lib/rag-service/config.ts` di soli-prof, indicizzando `AI_LOG.md`, `AGENTS.md` e file di configurazione. Un webhook GitHub push verso `https://soli-prof.vercel.app/api/webhooks/github` garantirà il re-ingest automatico ad ogni push su `main`. Dettagli operativi in `AGENTS.md` sezione "Soli Prof integration" e `scripts/setup-webhooks.sh` in soli-prof.

#### Supabase schema condiviso
Il progetto condivide il Supabase di soli-prof (stesso `SUPABASE_URL`). soli-prof occupa il namespace `rag_*`; soli-projects userà tabelle senza prefisso in un namespace dedicato da definire nella fase di implementazione prodotto.

#### File creati in questa sessione
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `eslint.config.mjs`, `vitest.config.ts`
- `.npmrc`, `.nvmrc`, `.gitignore`, `.env.example`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `lib/solids-package.test.ts` (test validazione dipendenza SoliDS)
- `README.md`, `AGENTS.md`, `AGENT.md`, `AI_LOG.md`, `LICENSE`
- `.github/workflows/ci.yml`

#### Deploy
- Repo GitHub: https://github.com/soli92/soli-projects (pubblica)
- Deploy Vercel: https://soli-projects.vercel.app

### Riferimenti
- Sessione documentata nel **WEEKLY_LOG di soli-prof** per il dettaglio del contesto di sviluppo.
- Pattern di scaffold derivato da soli-prof e soli-dome (Next 16 + SoliDS 1.14.1).
- Test `lib/solids-package.test.ts` identico a quello di soli-dm-fe e soli-agent.

---

## Aggiornamento 2026-04-30 — Allineamento CI + documentazione repo

### Cosa e' stato fatto

- Ripristinata configurazione ESLint in formato **flat ESM** con `eslint.config.mjs`.
- Rimossa la config legacy `.eslintrc.json`.
- Aggiunto `package-lock.json` (necessario per `npm ci` in GitHub Actions).
- Aggiunta dipendenza `tailwindcss-animate` per risolvere il build error del preset SoliDS.
- Build Next ha generato `next-env.d.ts` e normalizzato `tsconfig.json` (`jsx: react-jsx`).
- Introdotto `WEEKLY_LOG.md` nel repo e aggiornati `README.md` / `AGENTS.md` al nuovo standard documentale.

### Verifiche eseguite

- `npm run lint` ✅
- `npm run type-check` ✅
- `npm test` ✅
- `npm run build` ✅

### Stato dopo l'allineamento

- Repository pronto per commit/push con pipeline locale verde.
- Deploy Vercel da confermare dopo push e nuova esecuzione CI su GitHub.

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.

---

## Aggiornamento 2026-05-25 — LLM Wiki factory bootstrap + Hub centrale

### Cosa e' stato fatto

Sessione di trasformazione completa: soli-projects diventa l'hub centrale dell'ecosistema soli92.

#### Factory LLM Wiki (llm-wiki++ v2.11)

Applicato il meta-prompt da `soli-multi-agents-factory` con topology **plan-only**:

- **`PATTERN.md`** — contratto universale agent-agnostic (5 layer, 8 ruoli, 8 operazioni, 12 regole inviolabili)
- **`factory.config.yaml`** — configurazione: topology plan-only, routing human, scheduler per ingest/lint/query/sync
- **`raw/`** (L1) — 46 file sincronizzati (AGENTS.md + AI_LOG.md + README.md) da 16 repo, con `.extraction-manifest.json` e `cross-project-index.md`
- **`wiki/`** (L2) — 25 pagine wiki create via 4 ingest paralleli: 16 source pages (una per repo), 6 concept pages (design-system-solids, rag-pipeline, deployment-patterns, supabase-integration, cross-repo-webhooks, pwa-patterns), 3 entity pages (vercel, supabase, anthropic-claude)
- **`management/`** (L3) — scaffold kanban, roadmap, questions
- **`design_&_architecture/`** (L4) — scaffold api_specs, db_schemas, decisions
- **`memory/`** — scaffold episodic, semantic, procedural
- **Cursor adapter** — 9 rules (`.cursor/rules/`) implementano i ruoli PATTERN, 13 skills (`.cursor/skills/`) implementano le procedure canoniche

#### Hub applicativo (Fase 1-3)

**Fase 1 — Wiki Navigator:**
- `lib/wiki/reader.ts` — lettura filesystem wiki/, parsing frontmatter con gray-matter, ricerca full-text
- `lib/wiki/render.ts` — rendering remark + remark-gfm + remark-html con risoluzione `[[wikilink]]` e formattazione citazioni `[^src:]`
- `/wiki` — indice navigabile raggruppato per tipo (source, concept, entity, synthesis)
- `/wiki/[...slug]` — viewer singola pagina con breadcrumb, badge frontmatter, markdown renderizzato
- Componenti: WikiPageCard, WikiPageViewer, WikiBreadcrumb, WikiSearch, WikiStatusBadge

**Fase 2 — Task Manager Cross-Progetto:**
- `listAllTodos()` — query aggregata pm_todos + pm_projects con filtri progetto/stato/priorita
- `lib/kanban/reader.ts` — parser EP/US/TSK markdown da management/kanban/
- `/tasks` — vista unificata con tab Operativi (Supabase) e Strategici (kanban factory)
- Vista lista e board kanban (colonne open/in_progress/done)
- Server actions: `createKanbanTaskAction`, `updateKanbanStatusAction`
- Componenti: TaskFilters, CrossProjectTaskBoard, CrossProjectTaskCard, KanbanSection, KanbanItemCard

**Fase 3 — Direttive e Submodule:**
- `lib/github/writer.ts` — `createFileInRepo()` via GitHub Contents API PUT
- `lib/actions/directives.ts` — `createDirectiveAction` (crea `directives/DIR-*.md` nel repo target)
- Tab "Direttive" in `/projects/[slug]` con DirectiveForm
- Documentazione setup submodule e convenzione directives in AGENTS.md

**Altre modifiche:**
- AppHeader aggiornato: link Wiki + Task al posto dei placeholder Chat/Settings
- `@tailwindcss/typography` aggiunto per prose styling wiki
- Dipendenze: gray-matter, remark, remark-gfm, remark-html
- AGENTS.md aggiornato con architettura hub, key files, submodule setup, directives convention

### Verifiche

- `npm run type-check` ✅
- `npm run lint` ✅
- `npm test` ✅ (32 test, 10 file)
- Commit: `643073a` (147 file, ~14k righe)

### Decisioni architetturali

- **Wiki su filesystem, non su Supabase**: le pagine wiki vivono come file .md nel repo; la UI le legge dal filesystem lato server. Questo mantiene la wiki editabile dagli agenti (via git) e consultabile dall'app.
- **Due sorgenti task**: i todo operativi restano in Supabase (pm_todos), i task strategici sono file markdown nel kanban. La UI li unifica sotto `/tasks` con tab separati.
- **Direttive via GitHub API**: per scrivere nei repo verticali senza submodule inverso, si usa la Contents API. Il repo target processa i file tramite il suo flusso locale.
- **Topology plan-only**: nessun L5 (code generation); il factory produce piano e documentazione per consumo umano.
