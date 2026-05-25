# Soli Projects

Portale web per la gestione cross-progetto dei repository soli92: aggrega stato, idee, todo e debito tecnico con un agente Claude dedicato.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **UI** | Tailwind CSS + `@soli92/solids` ^1.14.1 (token / preset); font Google (Inter, DM Sans, JetBrains Mono) |
| **LLM** | Anthropic Claude (via `@anthropic-ai/sdk`) |
| **Database** | Supabase (schema condiviso con soli-prof, tabelle dedicate senza prefisso) |
| **Hosting** | Vercel (deploy automatico da `main`) |
| **Test** | Vitest 3 |

## Setup locale

```bash
# 1. Clona
git clone https://github.com/soli92/soli-projects
cd soli-projects

# 2. Installa dipendenze (@soli92/solids è pubblico su npm, nessun token necessario)
npm install

# 3. Configura variabili d'ambiente
cp .env.example .env.local
# Compila .env.local con le tue chiavi (vedi .env.example per dettagli)
# In particolare per l'accesso:
# - SOLI_PROJECTS_PASSWORD
# - SOLI_PROJECTS_SESSION_SECRET

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
```

## Schema database

- Le tabelle di Soli Projects vivono nello stesso progetto Supabase di soli-prof, con prefisso `pm_`.
- Le migration sono in `sql/` e vanno applicate manualmente via Supabase SQL Editor (o psql).
- File migration:
  - `sql/001_init_pm_schema.sql`
  - `sql/002_seed_projects.sql`

## Stato

**Scaffold iniziale** — configurazione infrastrutturale completata (Next.js 16, SoliDS, Supabase, CI).  
Fase 1.A completata: schema DB + seed + librerie backend + test.  
Fase 1.B completata: dashboard + detail pages SSR.
Fase 2.A completata: auth single-user con cookie HMAC (`/login`, middleware, logout).
Fase 2.B completata: CRUD ideas + todos con server actions.
Detail page con tab `Overview` / `Idee` / `Todo` via searchParam.
Validation input con Zod.

Stato operativo corrente:

- Configurazione ESLint flat (`eslint.config.mjs`) allineata a Next 16.
- `package-lock.json` presente per workflow CI basato su `npm ci`.
- Verifiche locali eseguite con esito positivo: `npm run lint`, `npm run type-check`, `npm test`, `npm run build`.
- Deploy Vercel pubblico in verifica post-push.

Dettaglio sessioni:

- [AI_LOG.md](./AI_LOG.md) — memoria AI-assisted.
- [WEEKLY_LOG.md](./WEEKLY_LOG.md) — avanzamento settimanale del repo.

## Link correlati

- [soli-prof](https://github.com/soli92/soli-prof) — AI tutor + sistema RAG (knowledge base condivisa)
- [soli-agent](https://github.com/soli92/soli-agent) — agente di sviluppo Soli

## Licenza

MIT © [soli92](https://github.com/soli92)
