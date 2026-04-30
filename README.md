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

## Stato

**Scaffold iniziale** — configurazione infrastrutturale completata (Next.js 16, SoliDS, Supabase, CI).  
La logica applicativa (dashboard, agente, schema DB) è in sviluppo.  
Vedi il **WEEKLY_LOG di soli-prof** per il progresso della sessione corrente.

## Link correlati

- [soli-prof](https://github.com/soli92/soli-prof) — AI tutor + sistema RAG (knowledge base condivisa)
- [soli-agent](https://github.com/soli92/soli-agent) — agente di sviluppo Soli

## Licenza

MIT © [soli92](https://github.com/soli92)
