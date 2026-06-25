---
type: runbook
created: 2026-06-25
topic: deploy-render
---
# Runbook: Deploy Render — Backend Express soli92

> Deploy dei backend Express dell'ecosistema soli92 su Render (soli-dm-be, casa-mia-be).

## Pre-requisiti

- Account Render collegato al repository GitHub `soli92/<repo>`.
- File `render.yaml` presente nella root del repo (o servizio configurato manualmente nel dashboard).
- `npm run build` passa localmente senza errori (deve generare `dist/index.js` o equivalente).
- Variabili d'ambiente configurate nel dashboard Render prima del primo deploy.

## Struttura `render.yaml` consigliata

```yaml
services:
  - type: web
    name: <service-name>          # es. soli-dm-be, casa-mia-be
    env: node
    buildCommand: npm ci && npm run build
    startCommand: node dist/index.js
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000             # Render espone internamente su 10000 per default
```

Note:
- **`buildCommand`:** `npm ci` garantisce install deterministico da `package-lock.json`. Seguito da `npm run build` che compila TypeScript in `dist/`.
- **`startCommand`:** puntare al file compilato in `dist/`, non al sorgente TypeScript.
- **`healthCheckPath`:** Render pinga questo path ogni ~10 minuti per verificare che il servizio sia up. Il backend deve rispondere HTTP 200.
- **`autoDeploy: true`:** ogni push su `main` (o il branch configurato in Render) avvia un deploy automatico.
- **Root directory:** lasciare vuota (root del repo). Non impostare una subdirectory a meno che il servizio non stia in un monorepo — altrimenti i path `dist/` non coincidono.

### Endpoint `/health` minimo

Ogni backend Express deve esporre:

```typescript
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Variabili d'ambiente

Le variabili si configurano in:
**Render Dashboard → [Servizio] → Environment → Add Variable**

Oppure nel `render.yaml` sotto `envVars` con riferimento a secret Render:

```yaml
envVars:
  - key: DATABASE_URL
    sync: false   # valore inserito manualmente nel dashboard, non in chiaro nel YAML
  - key: SUPABASE_URL
    sync: false
  - key: JWT_SECRET
    sync: false
```

> Non committare mai valori secret nel `render.yaml`. Usare `sync: false` per variabili che richiedono input manuale, oppure gruppi di variabili condivisi (Render → Environment Groups).

## Deploy automatico (flusso standard)

1. Assicurati che la CI passi localmente:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
2. Push su `main`:
   ```bash
   git push origin main
   ```
3. Render rileva il push e avvia il deploy automatico (se `autoDeploy: true`).
4. Segui il progresso: **Render Dashboard → [Servizio] → Events**.
5. Attendi lo stato **Live** (build ~2–4 minuti per backend Express tipici).
6. Verifica endpoint health: `curl https://<service>.onrender.com/health`.

## Deploy manuale

### Via dashboard

Render Dashboard → [Servizio] → **Manual Deploy** → **Deploy latest commit**.

### Via deploy hook (casa-mia-be)

casa-mia-be usa un webhook Render per il deploy da GitHub Actions:

```bash
# Trigger manuale deploy hook
curl -fsS -X POST "$RENDER_DEPLOY_HOOK"
```

Il deploy hook URL si trova in: Render Dashboard → [Servizio] → Settings → **Deploy Hook**.

### Via Render CLI

```bash
# Installare CLI
npm i -g @render-oss/cli

# Login
render login

# Deploy
render deploys create <service-id>
```

## Cold start mitigation (free tier)

Il free tier Render spegne i servizi dopo 15 minuti di inattività. Al primo accesso dopo il cooldown, il cold start richiede ~30 secondi.

**Opzioni per mitigare:**

1. **Piano paid (Starter $7/mese):** nessun cold start, servizio sempre attivo.

2. **Cron ping gratuito (GitHub Actions):** aggiungere un job scheduled che pinga `/health` ogni 14 minuti:
   ```yaml
   # In .github/workflows/keep-alive.yml
   name: Keep alive
   on:
     schedule:
       - cron: '*/14 * * * *'
   jobs:
     ping:
       runs-on: ubuntu-latest
       steps:
         - run: curl -fsS https://<service>.onrender.com/health || true
   ```

3. **UptimeRobot free tier:** configurare un monitor HTTP con intervallo 5 minuti.

> Nota: il ping periodico mantiene il servizio attivo ma non conta come "request con risposta" per Render — non incorre in costi aggiuntivi sul free tier.

## Rollback

Render mantiene la storia di tutti i deploy:

1. Vai a **Render Dashboard → [Servizio] → Events**.
2. Individua il deploy precedente funzionante (identificato da commit hash e timestamp).
3. Clicca **Redeploy** sul deploy target.
4. Render re-deploya quell'esatto commit senza rebuild.

In alternativa, fai revert del commit su `main` e aspetta l'auto-deploy:
```bash
git revert HEAD
git push origin main
```

## Troubleshooting comune

| Sintomo | Causa probabile | Fix |
|---------|----------------|-----|
| Build fallisce su `npm run build` | Dipendenze mancanti in `dependencies` (vs `devDependencies`) | Spostare `typescript`, `@types/*` in `dependencies` o usare `npm ci --include=dev` |
| `dist/index.js` non trovato | Path `startCommand` sbagliato | Verificare output `tsc` in `tsconfig.json` (`outDir`) |
| Cold start lento | Free tier, servizio in sleep | Aggiungere cron ping, o upgrade al piano Starter |
| Variabili mancanti | Env vars non configurate in dashboard | Render Dashboard → Environment → verifica che tutte le variabili siano presenti |
| Health check fallisce | Endpoint `/health` non esposto | Aggiungere route `GET /health` prima di avviare il server |

## Riferimenti

- [[deployment-patterns]] — architettura deploy ecosistema soli92
- [[soli-dm-be]] — backend D&D su Render
- [[casa-mia-be]] — backend Casa Mia su Render
- [[uptime-monitoring]] — monitoring e health check
