# Soli Dome

Portale personale per aprire le tue app da un’unica home: ricerca, categorie, preferiti e modal per aggiungere link. UI dark con stile glass / vetro.

Contesto operativo per assistenti AI: **[`AGENTS.md`](./AGENTS.md)**. Soli Dome è in [**Soli Prof** RAG `CORPUS_REPOS`](https://github.com/soli92/soli-prof); un `push` può notificare re-ingest (webhook). Stesso stack di test **Vitest** invariato.

## Avvio

Richiede **Node.js 22+** (vedi `engines` in `package.json` e **`.nvmrc`**). Il file **`.npmrc`** forza `registry=https://registry.npmjs.org/` e `tag=latest` per install coerenti.

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Personalizzare le app

Modifica [`src/data/apps.ts`](./src/data/apps.ts): ogni voce ha `id`, `name`, `description`, `url`, `icon`, `category`, `color`, opzionale `pinned` per i preferiti. Tra le app “Mie App” compaiono ad es. Casa Mia, Soli Prof, Soli Dungeon Master e **Health, Wand and Fire** (`https://health-wand-and-fire.vercel.app/`).

È presente anche un test sui dati in [`src/data/apps.test.ts`](./src/data/apps.test.ts).

## Test

| Comando | Descrizione |
|---------|-------------|
| `npm run test` | Vitest (unit, **happy-dom**, pool `threads`; include `src/solids-package.test.ts` per range SoliDS) |
| `npm run test:watch` | Vitest in watch |
| `npm run test:coverage` | Con copertura |
| `npm run test:e2e` | Playwright |
| `npm run test:all` | Unit + e2e |

## Stack

- **Next.js** 16, **React** 19, **TypeScript**
- **Tailwind CSS** + **`@soli92/solids` ^1.14.1** (token e preset); **Google Fonts** in `src/app/layout.tsx` (linee guida SoliDS 1.14.1)
- **Lucide React** (icone)
- **Vitest** + Testing Library, **Playwright** (e2e)

## Branding e PWA

- Manifest gestito da App Router in `src/app/manifest.ts` (endpoint runtime `/manifest.webmanifest`)
- Metadata/icona app in `src/app/layout.tsx`, con asset importati da `@soli92/solids/brand-assets`
- Header e fallback di caricamento allineati al brand Soli (`src/components/SoliBrandLogo.tsx`, `src/components/SoliLogoLoader.tsx`)

## Lint

```bash
npm run lint
```

## Build produzione

```bash
npm run build
npm start
```

## CI e changelog

Questo repo **non** include al momento workflow GitHub Actions nel tree: test e build si eseguono in locale o sul provider di deploy (es. Vercel). **Changelog** automatico non configurato; la storia è in Git.

---

Portale e contenuti: uso personale.
