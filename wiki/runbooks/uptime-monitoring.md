---
type: runbook
created: 2026-06-25
topic: uptime-monitoring
---
# Runbook: Uptime Monitoring — soli92

> Documentazione degli strumenti disponibili per monitorare uptime e latenza dei servizi dell'ecosistema soli92.

## Strumenti disponibili

### 1. Vercel Analytics + Logs

**Tipo:** Integrato, zero config per i progetti già su Vercel.

- **Accesso:** Vercel Dashboard → progetto → scheda **Analytics** (Web Vitals, latency) e **Logs** (runtime errors, request logs).
- **Cosa monitora:** HTTP response times, error rates, edge function latency, Core Web Vitals.
- **Limit free tier:** Logs conservati 1 giorno (free), 30 giorni (Pro). Analytics permanenti.
- **Setup:** Nessuno. Abilitato automaticamente su ogni deploy Vercel.
- **Alert:** Email notifica su deployment failure (automatica). Per alert su errori runtime: configurare Vercel → Integrations → [servizio di alerting].

### 2. Render health check built-in

**Tipo:** Integrato nel piano Render, configurabile via `render.yaml`.

- **Come funziona:** Render pinga periodicamente il path configurato come `healthCheckPath`. Se il check fallisce, Render esclude l'istanza dal routing e tenta un restart.
- **Configurazione in `render.yaml`:**
  ```yaml
  services:
    - type: web
      name: <service-name>
      healthCheckPath: /health
  ```
- **Requisito:** Il backend deve esporre `GET /health` con risposta HTTP 200 (body qualsiasi, tipicamente `{ "status": "ok" }`).
- **Frequenza:** Ogni 10 minuti (configurabile nel dashboard Render → Service → Settings → Health Check).
- **Alert:** Email notifica su service down (automatica su tutti i piani Render).

### 3. Cron job esterno: GitHub Actions scheduled

**Tipo:** Custom, zero costo su GitHub Actions (repository pubblici o entro i minuti free).

Due opzioni:

**a) GitHub Actions scheduled workflow** — pinga l'endpoint `/health` ogni 30 minuti e crea una GitHub Issue se fallisce (vedi sezione Configurazione minima).

**b) UptimeRobot free tier** — 50 monitor gratuiti, check ogni 5 minuti, alert email/Slack/Telegram. Setup da [uptimerobot.com](https://uptimerobot.com).

## Servizi critici da monitorare

| Servizio | Provider | URL produzione | Endpoint health |
|---------|---------|----------------|-----------------|
| [[soli-prof]] — RAG service | Vercel | `https://soli-prof.vercel.app` | `/api/health` o verifica `GET /` |
| [[soli-agent]] — AI assistant | Vercel | `https://soli-agent.vercel.app` | `/api/health` o verifica `GET /` |
| [[soli-platform]] soli-auth | Oracle ARM | `https://<vm-ip>:8080` | `/health` |
| [[soli-platform]] soli-notification | Oracle ARM | `https://<vm-ip>:8081` | `/health` |
| [[soli-platform]] soli-gateway | Oracle ARM | `https://<vm-ip>:80` | `/health` |
| [[casa-mia-be]] — Express BE | Render | `https://casa-mia-be.onrender.com` | `/health` |
| [[soli-dm-be]] — D&D BE | Render | `https://soli-dm-be.onrender.com` | `/health` |

> Nota: gli URL Render e Oracle variano in base alla configurazione del servizio. Aggiornare questa tabella dopo ogni provisioning.

## Configurazione minima consigliata

### Render: aggiungere `healthCheckPath` in render.yaml

Per ogni backend Express su Render, aggiungere nel `render.yaml`:

```yaml
services:
  - type: web
    name: soli-dm-be
    env: node
    buildCommand: npm ci && npm run build
    startCommand: node dist/index.js
    healthCheckPath: /health
    autoDeploy: true
```

Il backend deve esporre l'endpoint:

```typescript
// Express — route health check minima
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### GitHub Actions scheduled: ping /health ogni 30 minuti

Creare `.github/workflows/uptime-check.yml` nel repo soli-projects (o in un repo dedicato):

```yaml
name: Uptime check

on:
  schedule:
    - cron: '*/30 * * * *'  # ogni 30 minuti
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        service:
          - name: soli-dm-be
            url: https://soli-dm-be.onrender.com/health
          - name: casa-mia-be
            url: https://casa-mia-be.onrender.com/health
          - name: soli-prof
            url: https://soli-prof.vercel.app/api/health

    steps:
      - name: Ping ${{ matrix.service.name }}
        id: ping
        run: |
          STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
            --max-time 10 \
            "${{ matrix.service.url }}")
          echo "status=$STATUS" >> "$GITHUB_OUTPUT"
          if [ "$STATUS" != "200" ]; then
            echo "::error::${{ matrix.service.name }} returned HTTP $STATUS"
            exit 1
          fi
          echo "${{ matrix.service.name }}: OK (HTTP $STATUS)"

      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[UPTIME] ${{ matrix.service.name }} is DOWN`,
              body: `Service **${{ matrix.service.name }}** failed health check.\n\nURL: ${{ matrix.service.url }}\n\nTime: ${new Date().toISOString()}\n\nWorkflow run: ${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
              labels: ['incident', 'uptime'],
            });
```

## Alerting

### Email

- **Vercel:** automatico su deploy failure (impostazioni profilo Vercel → Notifications).
- **Render:** automatico su service down (impostazioni account Render → Notifications).
- **GitHub Actions:** ogni workflow failure invia email all'owner del repo (impostazioni GitHub → Notifications → GitHub Actions).

### Slack webhook

Aggiungere questo step al job `check` sopra (dopo il ping fallito):

```yaml
      - name: Slack alert on failure
        if: failure()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": ":red_circle: *${{ matrix.service.name }}* is DOWN\nURL: ${{ matrix.service.url }}"
            }
```

Prerequisito: creare un Incoming Webhook Slack e salvare l'URL come secret `SLACK_WEBHOOK_URL` nel repo.

### UptimeRobot (alternativa zero-config)

1. Creare account su [uptimerobot.com](https://uptimerobot.com) (free tier: 50 monitor, check ogni 5 minuti).
2. Aggiungere un monitor HTTP(S) per ogni endpoint critico.
3. Configurare alert: email + eventuale integrazione Slack/Telegram.
4. Nessun setup nel repo richiesto.

## Riferimenti

- [[deployment-patterns]] — architettura deploy ecosistema soli92
- [[deploy-render]] — runbook deploy Render (configurazione render.yaml)
- [[deploy-oracle-arm]] — runbook provisioning Oracle ARM
- [[deploy-vercel]] — runbook deploy Vercel
