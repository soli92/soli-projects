# Pippify

Monorepo con tre superfici: **Next.js** (estrazione YouTube via API), **Create React App** (player + libreria + upload) e **Express** (auth, tracce, playlist, storage R2, import YouTube lato server).

Uso personale: rispetta **copyright** e [Termini di servizio di YouTube](https://www.youtube.com/t/terms).

Contesto operativo per assistenti AI: **[`AGENTS.md`](./AGENTS.md)**. Il monorepo è in [**Soli Prof** RAG `CORPUS_REPOS`](https://github.com/soli92/soli-prof): un `push` su GitHub può attivare re-ingest lato Soli (webhook, vedi Soli Prof `AGENTS.md`); i test locali **non** dipendono.

## Componenti

| Cartella | Stack | Avvio | Ruolo |
|----------|--------|--------|--------|
| **root** (`src/`) | Next 16 + React 19 | `npm install` → `npm run dev` | UI `YoutubePanel`, `POST /api/youtube` (metadati + URL stream), Vitest + **happy-dom** |
| **`frontend/`** | CRA + Howler | `cd frontend && npm start` | App autenticata: brani, playlist, upload file; **YouTube** (link + upload `cookies.txt`) dalla sezione dedicata |
| **`backend/`** | Express 5 | `cd backend && npm start` | JWT, Supabase, Cloudflare R2, `POST /api/tracks/import-youtube` |

Variabili: root [`.env.example`](./.env.example) (limiti API Next e, in coda, riferimento a `UPLOAD_MAX_FILE_BYTES` per il backend). CRA: `REACT_APP_API_URL` verso il backend (es. `http://localhost:3001/api`).

## Ambiente di sviluppo

- **Node.js 22+** (file **`.nvmrc`** nella root). Vite / Vitest / ESLint recenti richiedono almeno 20.19+ o 22.x patch aggiornate.
- **`.npmrc`** in root: `registry=https://registry.npmjs.org/` e `tag=latest` (evita conflitti con un `~/.npmrc` aziendale che forza un dist-tag custom).
- **Lint (root Next)**: Next 16 non espone più `next lint`; si usa **`eslint`** con [`eslint.config.cjs`](./eslint.config.cjs) (`npm run lint`).
- **Test root**: configurazione Vitest in [`vitest.config.mts`](./vitest.config.mts); ambiente DOM **happy-dom** (compatibile con Vitest 4 / toolchain ESM).

## Next (root)

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) — documentazione comportamento API in `README` e test in `src/**/*.test.ts`.

### Test (Vitest)

```bash
npm run test        # watch
npm run test:run    # CI
```

Coprono `lib/youtube`, `lib/server` (rate limit, timeout), `useYoutubeExtract`, `POST /api/youtube` (mock `@distube/ytdl-core`).

### Env API YouTube (Next)

- `YOUTUBE_RATE_LIMIT_MAX`, `YOUTUBE_RATE_LIMIT_WINDOW_MS`, `YOUTUBE_GETINFO_TIMEOUT_MS`, `YOUTUBE_BODY_MAX_CHARS`
- `YOUTUBE_COOKIES_PATH` (o `YOUTUBE_COOKIES_JSON`): cookie youtube.com in JSON per ridurre **403** su `getInfo` / URL stream — vedi [`backend/README.md`](./backend/README.md)
- `YOUTUBE_RATE_LIMIT_MAX=0` disattiva il rate limit (solo sperimentazione)

## Backend

Dettagli route e env: [`backend/README.md`](./backend/README.md).

```bash
cd backend && npm ci && npm start
```

- **`src/app.js`** — app Express (usata dai test)
- **`src/server.js`** — `dotenv` + `listen`
- **`src/index.js`** — entry produzione

### Test backend (Jest + Supertest)

```bash
cd backend && npm run test:run
```

Env opzionali import YouTube: `YOUTUBE_IMPORT_MAX_BYTES`, `YOUTUBE_IMPORT_TIMEOUT_MS`, **`YOUTUBE_USER_COOKIES_DIR`**, **`YOUTUBE_COOKIES_UPLOAD_MAX_BYTES`**. **`yt-dlp`** usa **`--cookies`** dal file per-utente (se caricato via API) o da **`YOUTUBE_COOKIES_PATH`**. Non esiste un’API Google ufficiale per il download audio come file: vedi [`backend/README.md`](./backend/README.md) (*API ufficiali e alternative*). Upload file: `UPLOAD_MAX_FILE_BYTES` (vedi sotto).

### Upload file: sicurezza e limiti

L’endpoint `POST /api/tracks/upload` (backend) applica:

- **Dimensione massima** configurabile con `UPLOAD_MAX_FILE_BYTES` (default 100 MiB), allineata al limite Multer in memoria.
- **Whitelist** di estensioni e MIME plausibili, più **verifica della firma binaria** (magic bytes) sul buffer: il `Content-Type` salvato su R2 deriva dal tipo rilevato, non solo dall’header inviato dal client.
- **Nome oggetto** sanitizzato (`basename`, caratteri sicuri) per evitare path traversal.

Formati tipici supportati: MP3, M4A/AAC, FLAC, OGG/Opus, WebM audio, WAV, AIFF, CAF. Dettagli e tabella route in [`backend/README.md`](./backend/README.md).

L’import **Da link YouTube** verifica che lo stream scaricato sia riconosciuto come contenitore audio atteso (webm / mp4 / mpeg) prima di salvarlo.

## Frontend (CRA)

Vedi [`frontend/README.md`](./frontend/README.md). Il client usa **`@soli92/solids` ^1.14.1** con migrazione branding Soli (asset dedicati `logo.svg`, `favicon.svg`, `apple-touch-icon.svg`, simbolo `soli-symbol.svg`, loader brandizzato nei punti di attesa principali).

In tab **Upload**: dropzone audio e pulsante **Importa da YouTube** → schermata con istruzioni per esportare `cookies.txt` (Netscape), upload sul backend (`GET/POST/DELETE /api/tracks/youtube-cookies`) e import da link (`POST /api/tracks/import-youtube`). Le validazioni del browser sono solo di comodità: **l’autorità resta il server**.

## CI

[`.github/workflows/ci.yml`](./github/workflows/ci.yml): job **next** (`test:run`, `lint`, `build`) e job **backend** (`npm run test:run` in `backend/`), entrambi su **Node 22**.

### Changelog / release

Non c’è oggi un flusso CI che aggiorni **CHANGELOG.md** o crei release semver automatiche: le modifiche sono nella history Git. Per automatizzare (versioni npm del package root, note di release) si può valutare **semantic-release**, **Changesets** o **Release Please** in un secondo momento.

## Dipendenze YouTube

- **Next e backend** usano **`@distube/ytdl-core`** (fork mantenuto). Aggiornala se YouTube cambia formato.
- Se compare **`Failed to find any playable formats`**: il codice passa a `getInfo` i client **`WEB`** + `WEB_EMBEDDED` / `IOS` / `ANDROID` / `TV` così da usare anche `player_response` della pagina watch. Alcuni video restano comunque bloccati (età, regione, live-only).

