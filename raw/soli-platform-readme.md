# soli-platform

Monorepo per i servizi comuni della suite: **`soli-auth`** (JWT da **[Neon Auth](https://neon.com/docs/auth/overview)** di default), **`soli-notification`** (API + coda Redis/BullMQ) e opzionale **`soli-gateway`** (endpoint in-house per il worker).

**Architettura e risorse centralizzate** (componenti, Neon, Redis, GHCR, CI/CD, env, sicurezza): vedi **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**. Per riprendere il lavoro o dare contesto a un assistente: **[`AGENTS.md`](./AGENTS.md)**.

**Indicizzazione RAG (Soli Prof)**: i package / doc di alcuni moduli possono finire in **soli-prof**; un webhook `push` sui repo in [`CORPUS_REPOS`](https://github.com/soli92/soli-prof/blob/main/lib/rag-service/config.ts) notifica re-ingest ([`/api/webhooks/github`](https://soli-prof.vercel.app/api/webhooks/github), HMAC). Dettagli: [soli-prof `AGENTS.md` — RAG / webhook](https://github.com/soli92/soli-prof/blob/main/AGENTS.md). I test in questo monorepo **non** dipendono da quel flusso.

**Configurazione servizi terzi (Neon, Upstash, SES, FCM, Twilio, webhook):** guida **[`docs/THIRD_PARTY_SETUP.md`](./docs/THIRD_PARTY_SETUP.md)**. Dopo aver compilato il `.env`: **`npm run check:env`** (stesso effetto di **`npm run check:dev`**) — stato senza segreti. Con API + worker avviati e variabili **`E2E_*`** opzionali: **`npm run e2e:smoke`** (health, `/v1/me`, accodamento notifiche).

## Requisiti

- **Node.js 22+** (LTS); in repo sono presenti **`.nvmrc`** (`22`) e **`engines`** nel `package.json`.
- Docker (solo Redis in locale)

### Tooling npm

Il file **`.npmrc`** in root imposta `registry=https://registry.npmjs.org/` e `tag=latest`, così install e `npm view` non ereditano un dist-tag aziendale errato dal `~/.npmrc` globale.

### Test automatici (Vitest)

- **`npm run test`** — watch durante lo sviluppo.
- **`npm run test:ci`** — esecuzione singola (come in CI).

Coprono **`soli-lib`** (OIDC, JWT), **`soli-auth`** (`loadConfig` / DB opzionale), **`soli-notification`** (Redis URL, config worker, `deliver`), **`soli-gateway`** (schema + `dispatch`). **Non** inviano email/push/SMS reali. Dettaglio: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (§5, sottosezione *Test automatici*).

## Avvio locale

```bash
# Se non esiste già: cp .env.example .env — oppure modifica il file .env in root (placeholder per incollare da Neon)
# Compila NEON_AUTH_BASE_URL e DATABASE_URL dalla console Neon; Redis: docker compose up -d
docker compose up -d
npm install
npm run lint
npm run test:ci
npm run build
```

Terminale API auth:

```bash
npm run dev:auth
```

Terminale API notifiche + worker (+ gateway in-house se usi `SOLI_NOTIFICATION_GATEWAY_URL`):

```bash
npm run dev:gateway
npm run dev:notification
npm run dev:notification-worker
```

Porte predefinite: `soli-auth` **3001**, `soli-notification` **3002**, `soli-gateway` **4005** (`SOLI_GATEWAY_PORT`).

### JWT Neon Auth da CLI (senza app frontend)

1. Prima volta: crea utente (email/password come richiesto da Neon Auth, min. 8 caratteri password):

   ```bash
   npm run neon:sign-up -- "Il tuo nome"
   ```

   (Chiederà email e password se non sono in `.env` come `NEON_AUTH_EMAIL` / `NEON_AUTH_PASSWORD`.)

2. Ottieni il token e prova `soli-auth`:

   ```bash
   TOKEN=$(node --env-file=.env scripts/neon-auth-jwt.mjs)
   curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3001/v1/me
   ```

Lo script `scripts/neon-auth-jwt.mjs` fa sign-in poi, se `access_token` non è un JWT (token di sessione opaco), prova gli endpoint Better Auth tipo `/token` con Cookie/Bearer. Serve il **plugin JWT** attivo lato Neon Auth.

## Endpoint

| Servizio | Path | Note |
|----------|------|------|
| soli-auth | `GET /health`, `GET /health/ready` | Senza token |
| soli-auth | `GET /v1/me` | Bearer; con `DATABASE_URL` risponde anche `identity` (`identity_link` in Neon) |
| soli-notification | `GET /health`, `GET /health/ready` | Ready verifica Redis |
| soli-notification | `POST /v1/notifications` | Bearer + body JSON; header opzionale `Idempotency-Key`; vedi sotto **Payload notifiche** |
| soli-gateway | `GET /health`, `GET /v1/stats`, `POST /v1/deliver` | Solo worker (`SOLI_NOTIFICATION_GATEWAY_URL`); opz. Bearer = `SOLI_NOTIFICATION_GATEWAY_SECRET`; dispatch per canale in `dispatch.ts` |

## Pacchetti

- **`soli-lib`** — validazione JWT via JWKS con **`jose`** (RS256 tipo Supabase, EdDSA tipo Neon Auth).
- **`soli-auth`** — `GET /v1/me` con JWT; se **`DATABASE_URL`** è impostata fa upsert su **`soli_auth.identity_link`** e scrive **`audit_log`** (`v1_me`).
- **`soli-notification`** — accoda job `deliver`; il worker può usare **`SOLI_NOTIFICATION_GATEWAY_URL`** (POST verso **`soli-gateway`** o un tuo servizio compatibile) oppure **SES**, **FCM**, **Twilio** o webhook **`in_app`**. Con **`DATABASE_URL`** persiste in **`soli_notification.delivery_attempt`**.
- **`soli-gateway`** — **`POST /v1/deliver`** (worker) con dispatch per canale in **`dispatch.ts`** (hook email/push/sms/in_app); **`GET /v1/stats`** conteggi; **`GET /health`**.

### Payload `POST /v1/notifications`

Body: `{ "channel", "templateId", "to", "payload?" }`.

| `channel` | `to` | `payload` (campi usati) |
|-----------|------|-------------------------|
| `email` | indirizzo | `subject` o `title` (oggetto), `body` o `text`, opz. `html` |
| `push` | token dispositivo FCM | `title`, `body` o `text`; altre chiavi → `data` stringata |
| `sms` | E.164 | `body` o `text` (obbligatorio) |
| `in_app` | id utente / routing | pass-through nel JSON del webhook insieme a `templateId` |

Variabili worker: vedi [`.env.example`](./.env.example) (blocco *Worker: provider reali*).

## Database — Neon (Postgres dedicato)

**soli-platform** assume **Neon Auth** come IdP dei token verso `soli-auth` / `soli-notification`: variabile **`NEON_AUTH_BASE_URL`** (derivazione automatica di issuer, audience e JWKS in `soli-lib`). **Pippify** e altre app devono usare il client Neon (`authClient.token()`, ecc.) per chiamare queste API. IdP alternativi (es. Supabase): solo **`OIDC_*`**, senza `NEON_AUTH_BASE_URL`. Dettagli: **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** (§5, §10).

1. Crea un progetto in [Neon Console](https://console.neon.tech).
2. Applica [`db/migrations/0001_soli_platform_schemas.sql`](./db/migrations/0001_soli_platform_schemas.sql) (SQL Editor in Neon). Istruzioni in [`db/migrations/README.md`](./db/migrations/README.md).
3. Imposta **`DATABASE_URL`** dalla dashboard (connection string **pooled** preferibile per molti worker; `sslmode=require`). Vedi [`.env.example`](./.env.example).

**Schemi Postgres**

| Schema | Contenuto |
|--------|-----------|
| `soli_auth` | `identity_link` (issuer + `sub` → tenant/metadata interni), `audit_log`, `service_api_key` (hash, non secret in chiaro) |
| `soli_notification` | `template`, `recipient_preferences`, `delivery_attempt` (storico; dedup resta anche su Redis/BullMQ) |

Questo **Postgres** (`DATABASE_URL`) è per dati **soli-platform** (`soli_auth`, `soli_notification`); l’**auth utente** è **Neon Auth** (stesso vendor, spesso stesso progetto Neon dell’app). **`soli-auth`** e il **worker** notifiche usano `pg` quando `DATABASE_URL` è impostata (`identity_link` / `audit_log` e `delivery_attempt`).

## Produzione

**Deploy su server con immagini GHCR:** guida in **[`deploy/README.md`](deploy/README.md)**; per **Oracle Cloud Free Tier + Docker + Caddy (TLS)** vedi **[`deploy/ORACLE_FREE_TIER.md`](deploy/ORACLE_FREE_TIER.md)**.

In alternativa, build locale: `npm run build` e avvio `node dist/index.js` (e `worker-entry.js` per il worker) con le stesse variabili; dietro reverse proxy con TLS e rate limit.

### Immagini container

- `Dockerfile.soli-auth` — porta **3001**, `NEON_AUTH_BASE_URL` (o `OIDC_*`), `SOLI_AUTH_PORT`; opz. **`DATABASE_URL`** per `identity_link` / `audit_log`.
- `Dockerfile.soli-notification` — porta **3002**, API con stesse variabili IdP + `REDIS_URL`; **worker** richiede **`REDIS_URL`** e opzionalmente **`DATABASE_URL`** (stesso URI Neon della root `.env`), comando  
  `node packages/soli-notification/dist/worker-entry.js`.
- `Dockerfile.soli-gateway` — porta **4005**, `SOLI_GATEWAY_PORT`, **`SOLI_NOTIFICATION_GATEWAY_SECRET`** (consigliato in prod), `NODE_ENV=production`; vedi `docs/THIRD_PARTY_SETUP.md` §2bis.

Build esempio:

```bash
docker build -f Dockerfile.soli-auth -t soli-platform-auth:local .
docker build -f Dockerfile.soli-notification -t soli-platform-notification:local .
docker build -f Dockerfile.soli-gateway -t soli-platform-gateway:local .
```

### CI/CD (GitHub Actions)

Flusso completo (CI, GHCR, release, **checklist deploy** su VM/Railway): **[docs/CI_CD.md](docs/CI_CD.md)**.

- **CI** (`.github/workflows/ci.yml`), **Node 22**:
  - **Lint, test, build**: `npm ci` → `npm run lint` (ESLint) → `npm run test:ci` (Vitest) → `npm run build`.
  - **Docker (verifica)**: `docker compose config` su **`deploy/docker-compose.prod.yml`** (con env di esempio) + build delle tre immagini **senza push**.
- **Publish su GHCR** (`.github/workflows/publish-containers.yml`): dopo **CI** verde su **`push`** a **`main`**, push immagini `:main` e `:<sha>`; opzionale job **deploy SSH** (`.github/workflows/deploy-ssh.yml`) se configurati i segreti `DEPLOY_*` e `DEPLOY_AUTO` non è `false`.
- **Publish su release** (`.github/workflows/publish-containers-release.yml`): alla **pubblicazione** di una **GitHub Release**, push con `:latest` e tag semver; stesso deploy SSH opzionale.
- **Deploy manuale** (`.github/workflows/deploy.yml`): **workflow_dispatch** per rieseguire solo pull + compose sul server con tag a scelta.
- **Dependabot** (`.github/dependabot.yml`): aggiornamenti settimanali per **npm** e **GitHub Actions**.

La prima volta i pacchetti GHCR possono essere privati: GitHub → Packages → visibilità / collegamento al repo.

Il **deploy** sul server non è in CI: dopo il pull da GHCR segui **[`deploy/README.md`](deploy/README.md)** (e opz. **[`deploy/ORACLE_FREE_TIER.md`](deploy/ORACLE_FREE_TIER.md)**). Per Kubernetes, Cloud Run, ECS, ecc. riusa le stesse immagini; manifest non inclusi.

### Changelog e release

**Non** c’è un CHANGELOG.md automatico nel repo: le **GitHub Release** (con note manuali) attivano il workflow di publish semver sulle immagini. Per un CHANGELOG generato da commit si può aggiungere in seguito **semantic-release** o **Release Please**.
