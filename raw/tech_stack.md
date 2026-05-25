# Tech Stack — Ecosistema soli92

> Vincoli tecnologici cross-progetto. Fonte di verità per l'Architect (PATTERN §11).

## Stack comune

| Area | Tecnologia | Note |
|------|-----------|------|
| **Runtime** | Node.js 22+ | `.nvmrc` in tutti i repo |
| **Package manager** | npm | `package-lock.json` committato |
| **Design system** | `@soli92/solids` ^1.14.1 | CSS + Tailwind preset; temi via `data-theme` |
| **Font stack** | Inter, DM Sans, JetBrains Mono | + Source Serif 4 / Space Grotesk per temi fantasy/cyberpunk |
| **Hosting** | Vercel (frontend/fullstack), Render (backend puri) | Auto-deploy da `main` |
| **CI** | GitHub Actions | lint + type-check + test + build |
| **LLM** | Anthropic Claude (Haiku/Sonnet/Opus) | Via `@anthropic-ai/sdk` |
| **Vector store** | Supabase pgvector (Voyage embeddings) | Usato da soli-prof RAG |

## Stack per progetto

| Progetto | Frontend | Backend | DB | Note |
|----------|----------|---------|-----|------|
| soli-agent | Next.js 16 | API Routes (SSE) | Redis (Upstash) | PWA, model routing, sub-agent |
| soli-prof | Next.js 16 | API Routes | Supabase pgvector | RAG multi-corpus, Generative UI |
| soli-projects | Next.js 16 | API Routes | Supabase | KB centralizzata + portfolio |
| soli-platform | — | Express (ESM) | PostgreSQL | Monorepo: auth, notification, gateway |
| solids | — | — | — | Design system: token, CSS, Storybook |
| Koollector | Expo (React Native) | Express + Apollo GraphQL | PostgreSQL | Monorepo npm workspaces |
| soli-dome | Next.js 16 | — | — | Portale app links, PWA |
| pippify | CRA + Next.js 16 | Express 5 | Supabase + R2 | YouTube player |
| bachelor-party-claudiano | Vite + React 18 | — | Supabase | Tema 90s-party, PWA |
| casa-mia-fe | Next.js 14 | — | — | WebSocket verso BE |
| casa-mia-be | — | Express (ESM) | PostgreSQL (Prisma) | JWT, S3, WebSocket |
| soli-dm-fe | Next.js 15 | — | Supabase Auth | D&D frontend, PWA |
| soli-dm-be | — | Express 4 (TS) | Supabase | D&D API, wiki SRD |
| llm-wiki-template | — | — | — | Template Obsidian LLM wiki |
| soli-obsidian-vault | — | — | — | Vault Obsidian personale |
| soli-multi-agents-factory | — | — | — | Meta-framework agentico |

## Vincoli inviolabili

- **`@soli92/solids` ^1.14.1**: tutti i frontend lo usano come preset Tailwind
- **Node 22+**: tutti i repo
- **npm** (non yarn/pnpm): lockfile `package-lock.json`
- **TypeScript strict**: dove presente
- **Vercel auto-deploy da `main`**: frontend e fullstack
