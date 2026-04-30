# 🤖 AGENTS.md — Operative Context for AI Assistants

**Soli Projects** is a Next.js 16 web app for cross-project management of soli92 repositories, with a dedicated Claude AI agent. This document describes architecture, conventions, and operative context for AI assistants (Cursor, Soli Agent, others).

## Project overview

### What is it?
A **personal portfolio + AI copilot** that aggregates state, ideas, todos, and technical debt across the 13 soli92 repositories. Includes a dedicated Claude-powered chat agent for project management.

### Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 (strict) |
| **Styling** | Tailwind CSS 3.4 + `@soli92/solids` **^1.14.1** preset + CSS variables; font stack in `app/layout.tsx` |
| **LLM** | Anthropic Claude (via `@anthropic-ai/sdk`) |
| **Database** | Supabase — shared project with soli-prof, **dedicated tables** (no prefix; soli-prof uses `rag_*` namespace) |
| **Deployment** | Vercel (auto-deploy from `main`) |
| **Testing** | Vitest 3, jsdom environment |

### GitHub Repo
- **Owner**: soli92
- **Visibility**: Public
- **Default branch**: `main`
- **URL**: https://github.com/soli92/soli-projects
- **Docs**: README.md, AI_LOG.md, AGENTS.md, AGENT.md (redirect)

---

## Directory structure

```
soli-projects/
├── app/
│   ├── page.tsx               # Home — placeholder "Coming soon"
│   ├── layout.tsx             # Root layout, metadata, Google Fonts, SoliDS CSS
│   └── globals.css            # Tailwind directives + SoliDS CSS import
├── components/                # (empty scaffold — UI components go here)
├── lib/
│   └── solids-package.test.ts # Validation test: @soli92/solids range check
├── .github/
│   └── workflows/
│       └── ci.yml             # CI: lint + type-check + test + build
├── .env.example               # Env vars template (annotated)
├── .npmrc                     # npm registry + tag=latest
├── .nvmrc                     # Node 22
├── .gitignore                 # Standard Next.js + .env.local + .vercel
├── package.json               # Dependencies, scripts
├── tsconfig.json              # TypeScript (strict, ES2022, preserve jsx)
├── tailwind.config.ts         # Tailwind + SoliDS preset
├── postcss.config.mjs         # PostCSS (ESM)
├── next.config.ts             # Next.js config (minimal)
├── eslint.config.mjs          # Flat config (Next 16 compatible)
├── vitest.config.ts           # Vitest (jsdom, alias @)
├── README.md                  # Project docs (Italian)
├── AGENTS.md                  # This file — main operative context
├── AGENT.md                   # Redirect → AGENTS.md
├── AI_LOG.md                  # AI-assisted development memory (Italian)
└── LICENSE                    # MIT
```

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config)
npm run type-check   # tsc --noEmit
npm test             # Vitest run (CI mode)
npm run test:watch   # Vitest watch mode
```

---

## Key files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page — scaffold placeholder, uses SoliDS tokens via Tailwind classes |
| `app/layout.tsx` | Root layout — metadata, Google Fonts (Inter, DM Sans, JetBrains Mono), SoliDS CSS import |
| `app/globals.css` | Tailwind base/components/utilities + SoliDS CSS |
| `lib/solids-package.test.ts` | Validates `@soli92/solids` dependency range in package.json |
| `tailwind.config.ts` | SoliDS Tailwind preset — enables `bg-background`, `text-foreground`, etc. |
| `lib/` | Future home for: supabase client, anthropic client, project-logic utilities |
| `components/` | Future home for: UI components, project cards, agent chat UI |

---

## Soli Prof integration

This repository will be **added to `CORPUS_REPOS`** in [soli-prof](https://github.com/soli92/soli-prof) RAG knowledge base, indexing `AI_LOG.md`, `AGENTS.md`, and config files.

A **GitHub push webhook** pointing to `https://soli-prof.vercel.app/api/webhooks/github` must be configured for automatic re-ingest on push (event: `push`, content type: `json`, signed with `GITHUB_WEBHOOK_SECRET`). See `scripts/setup-webhooks.sh` in soli-prof for setup instructions.

---

## Supabase schema

- Shares the same Supabase project as soli-prof
- soli-prof occupies the `rag_*` table namespace
- soli-projects uses **unprefixed table names** in a dedicated namespace (to be defined in the product implementation phase)
- Connection: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only); `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-side)

---

## Code conventions

### Language
- **UI strings and docs**: Italian (`README.md`, `AI_LOG.md`, user-facing text)
- **Code, types, comments, AGENTS.md**: English

### File naming
- Components: PascalCase `.tsx` (e.g. `ProjectCard.tsx`)
- Utilities/lib: kebab-case `.ts` (e.g. `supabase-client.ts`)
- Routes: Next.js App Router conventions (`app/*/page.tsx`, `app/*/route.ts`)

### TypeScript
- Strictly `strict: true`
- Explicit types for function params and return values
- No `any` without justified comment

### React + Next.js
- App Router — server components by default
- `"use client"` only for interactive components
- No styled-components; use Tailwind + SoliDS tokens

### Tailwind / SoliDS
- Use semantic tokens when available: `bg-background`, `text-foreground`, `text-muted-foreground`, etc.
- Mobile-first responsive: `md:`, `lg:` breakpoints

---

## CI / GitHub Actions

Workflow: `.github/workflows/ci.yml`
- Trigger: push to `main`, pull_request
- Node 22 on ubuntu-latest
- Steps: checkout → setup-node (cache npm) → npm ci → lint → type-check → test → build

---

## Links

- **GitHub**: https://github.com/soli92/soli-projects
- **Live**: https://soli-projects.vercel.app
- **soli-prof**: https://github.com/soli92/soli-prof (RAG + knowledge base)
- **soli-agent**: https://github.com/soli92/soli-agent (Soli dev agent)
- **@soli92/solids**: https://www.npmjs.com/package/@soli92/solids
