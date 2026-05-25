# Koollector

Monorepo **npm workspaces** con:

- **`apps/api`** — GraphQL (Apollo Server 5) + Express 5 + WebSocket (`graphql-ws`) + **PostgreSQL** (`pg`). Porta **4000**, path **`/graphql`**.
- **`apps/mobile`** — Expo (React Native) + Expo Router + SQLite locale (`expo-sqlite`) + Apollo Client (HTTP + WS) per sync **push/pull** verso l’API.

Contesto operativo per assistenti AI: **[`AGENTS.md`](./AGENTS.md)**, con **[`AI_LOG.md`](./AI_LOG.md)** per le note di sviluppo. [Soli Prof](https://github.com/soli92/soli-prof) elenca questo monorepo in RAG; webhook su `push` (documentazione in Soli Prof `AGENTS.md`).

## Prerequisiti

- **Node.js 22+** (file **`.nvmrc`** nella root; Expo / Metro richiedono spesso patch recenti di Node 20+ o 22 LTS).
- **`.npmrc`** in root: registry npm pubblico e `tag=latest` (evita dist-tag ereditati dal profilo utente).
- Docker (per Postgres locale) oppure un’istanza Postgres raggiungibile
- Per la mobile: Expo CLI / ambiente iOS o Android

## Setup database (consigliato: Docker)

Dalla root del repo:

```bash
npm run db:up
```

Al **primo** avvio del volume, Postgres esegue in ordine:

1. `scripts/db-init.sql` — tabelle `users`, `collections`, `collection_members`, `sync_events`, `changes`
2. `scripts/seed-dev.sql` — utente e collezione demo con UUID fissi (utili per test manuali)

Connection string (default):

`postgresql://koollector:koollector@localhost:5432/koollector`

Per **resettare** DB e rieseguire gli script di init:

```bash
npm run db:reset
```

## API

```bash
cp apps/api/.env.example apps/api/.env
# Modifica DATABASE_URL se usi un Postgres diverso

npm run dev:api
```

Endpoint: `http://localhost:4000/graphql`  
WebSocket subscriptions: `ws://localhost:4000/graphql`

### Schema GraphQL (sync)

Allineato a `apps/mobile/src/graphql/sync.gql.ts`:

- **`Query.health`** — verifica che l’API risponda e il DB sia raggiungibile
- **`Query.pullChanges`** — legge `changes` dopo `sinceCursor` per le `collectionIds` richieste
- **`Mutation.pushEvents`** — registra `sync_events` (idempotente su `event_id`) e appende righe in `changes`
- **`Subscription.ping`** — heartbeat ogni ~2s (utile per provare il link WS dal client)

## Mobile

```bash
npm install
npm run dev:mobile
```

In `apps/mobile/src/graphql/client.ts` imposta **`DEV_HOST`**:

- Simulatore iOS: spesso `localhost`
- Emulatore Android: `10.0.2.2`
- Device fisico: IP LAN del Mac (es. `192.168.1.x`)

### SQLite locale

`apps/mobile/src/db/db.ts` definisce `collections`, `cursor_store`, `owned_cards`, `outbox` (una sola tabella outbox, schema sync).  
Se avevi installato una build precedente con lo schema `outbox` errato, in sviluppo **cancella i dati dell’app** o cambia nome file DB in `openDatabaseAsync(...)`.

## Sviluppo full stack

Terminale 1 — DB (se usi Docker):

```bash
npm run db:up
```

Terminale 2 — API + Expo:

```bash
npm run dev
```

## Script root (riepilogo)

| Script | Azione |
|--------|--------|
| `npm run dev` | API + mobile in parallelo (`concurrently`) |
| `npm run dev:api` | Solo `apps/api` |
| `npm run dev:mobile` | Solo Expo (`apps/mobile`) |
| `npm run db:up` / `db:down` / `db:reset` | Docker Compose Postgres |
| `npm run typecheck:api` | `tsc` sull’API |

## Struttura workspace

Solo `apps/*` (non esiste una cartella `packages/` condivisa al momento).

## CI e changelog

Non sono definiti workflow GitHub Actions in questo repo: esegui `typecheck:api` e test manuali come da script. Nessun **CHANGELOG** generato automaticamente; usa commit chiari o aggiungi in futuro Changesets / semantic-release se serve.

## Licenza

Vedi `LICENSE`.
