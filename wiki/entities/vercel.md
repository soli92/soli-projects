---
type: entity-product
created: 2026-05-25
updated: 2026-05-25
sources: [tech_stack.md, soli-prof-agents.md, soli-agent-agents.md, soli-dm-fe-agents.md, soli-dome-agents.md, soli-projects-agents.md]
status: draft
---
# Vercel

> Piattaforma di hosting e deployment per tutti i progetti frontend e fullstack dell'ecosistema soli92.

## Usage in ecosystem

Vercel e la piattaforma di deploy primaria per i progetti frontend e fullstack, con auto-deploy automatico dal branch `main` [^src: raw/tech_stack.md §Stack comune].

| Progetto | Tipo | URL produzione |
|----------|------|---------------|
| [[soli-agent]] | Next.js 16 fullstack | — |
| [[soli-prof]] | Next.js 16 fullstack | soli-prof.vercel.app |
| [[soli-projects]] | Next.js 16 fullstack | soli-projects.vercel.app |
| [[soli-dome]] | Next.js 16 frontend | — |
| [[soli-dm-fe]] | Next.js 15 frontend | soli-dm-fe.vercel.app |
| [[casa-mia-fe]] | Next.js 14 frontend | — |

- **CI/CD**: GitHub Actions fa lint + type-check + test + build; Vercel gestisce il deploy automatico [^src: raw/soli-prof-agents.md §CI/CD]
- **Secrets**: `VERCEL_TOKEN` e le chiavi API (es. `ANTHROPIC_API_KEY`) vanno in Vercel Project Settings > Environment Variables [^src: raw/soli-prof-agents.md §Setup Vercel]
- **maxDuration**: le route SSE streaming (es. chat di soli-prof) usano runtime Node con `maxDuration` 60 per stabilita [^src: raw/soli-prof-agents.md §Known edge cases]
- **Preview deploys**: soli-dm-fe supporta preview Vercel con CORS configurabile via `CORS_ALLOW_VERCEL_PREVIEW` nel backend [^src: raw/soli-dm-fe-agents.md §Variabili d'ambiente]
- **Base URL fallback**: soli-agent usa `NEXT_PUBLIC_BASE_URL -> BASE_URL -> https://${VERCEL_URL}` [^src: raw/soli-agent-agents.md §Sub-agent roles]

## Connections

- Related: [[deployment-patterns]] — Vercel come componente chiave della strategia di deploy
- Related: [[cross-repo-webhooks]] — il webhook receiver di soli-prof vive su Vercel
- Related: [[supabase-integration]] — i progetti Vercel si connettono a Supabase come database
- Related: [[pwa-patterns]] — le PWA sono servite da Vercel
