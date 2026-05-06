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
