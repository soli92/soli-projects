---
type: runbook
created: 2026-06-25
topic: deploy-vercel
---
# Runbook: Deploy Vercel — Frontend soli92

> Deploy dei progetti frontend/fullstack dell'ecosistema soli92 su Vercel (auto-deploy da `main`).

## Pre-requisiti

- Accesso al repo GitHub `soli92/<progetto>` con permessi di push su `main`
- Account Vercel collegato al repo (già configurato per ogni progetto del team)
- Per deploy manuale da CLI: `VERCEL_TOKEN` disponibile (opzionale, raramente usato)
- Node 22+ installato in locale
- `npm run build` passa localmente senza errori

## Step

### Deploy automatico (flusso standard)

1. Assicurati che la CI passi in locale prima del push:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```
2. Fai merge del branch su `main` (tramite PR o push diretto su `main` se single-committer):
   ```bash
   git push origin main
   ```
3. Vercel rileva automaticamente il push su `main` e avvia il deploy.
4. Segui il progresso su [vercel.com](https://vercel.com) → dashboard del progetto → scheda **Deployments**.
5. Attendi l'indicatore verde **Ready** (tipicamente 1–3 minuti per build Next.js 16).

### Deploy manuale da CLI (fallback)

Se serve un deploy immediato senza aspettare la CI automatica:

```bash
npm run build
vercel --prod
```

Richiede `VERCEL_TOKEN` in `.env.local` o login interattivo (`vercel login`).

### Variabili d'ambiente

Le variabili d'ambiente devono essere configurate nel dashboard Vercel prima del primo deploy. Percorso: **Vercel → Project Settings → Environment Variables**.

Esempio variabili per `soli-prof`:

| Variabile | Ambito |
|-----------|--------|
| `ANTHROPIC_API_KEY` | Production, Preview, Development |
| `VOYAGE_API_KEY` | Production |
| `SUPABASE_URL` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |
| `GITHUB_TOKEN` | Production |
| `RAG_API_KEY` | Production |
| `GITHUB_WEBHOOK_SECRET` | Production |
| `ADMIN_PAGE_PASSWORD` | Production |

> ⚠️ Da verificare: l'elenco completo delle variabili richieste per ogni progetto dipende dal repo specifico. Consultare sempre il `.env.example` del progetto target.

## Verifica post-operazione

1. Apri l'URL di produzione del progetto (es. `https://soli-projects.vercel.app`, `https://soli-prof.vercel.app`).
2. Verifica che la pagina risponda con HTTP 200.
3. Per progetti con API: verifica almeno un endpoint chiave (es. `POST /api/chat` per soli-prof).
4. Per soli-prof: verifica che il pannello `/admin` sia accessibile e che un re-ingest manuale non riporti errori.
5. Controlla i **Function Logs** in Vercel dashboard per eventuali errori runtime post-deploy.

## Rollback

Vercel mantiene la history completa dei deploy:

1. Vai a **Vercel → Project → Deployments**.
2. Individua il deploy precedente funzionante.
3. Clicca sui tre punti (`...`) → **Promote to Production**.
4. Il deploy precedente viene promosso immediatamente senza rebuild.

In alternativa, fai revert del commit su `main` e aspetta il deploy automatico:
```bash
git revert HEAD
git push origin main
```

## Riferimenti

- [[deployment-patterns]] — architettura deploy ecosistema soli92
- [[vercel]] — entità piattaforma Vercel
- [[soli-prof]] — esempio di configurazione variabili d'ambiente
- [Vercel Dashboard](https://vercel.com)
