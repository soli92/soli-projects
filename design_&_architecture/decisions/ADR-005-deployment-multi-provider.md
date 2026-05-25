---
id: ADR-005
title: Deploy multi-provider (Vercel, Render, Oracle ARM)
status: accepted
date: 2026-05-25
wiki_pages: [deployment-patterns, vercel]
epic: EP-004
---
# ADR-005 — Deploy multi-provider

## Contesto

L'ecosistema include frontend Next.js, backend Express, e servizi Docker. Nessun singolo provider copre tutti i casi d'uso in modo ottimale [^src: raw/soli-platform-agents.md §Repo].

## Decisione

- **Vercel:** frontend Next.js (auto-deploy da main, preview per PR).
- **Render:** backend Express (soli-dm-be, potenzialmente casa-mia-be).
- **Oracle ARM free tier:** soli-platform Docker compose (servizi auth, notification, gateway).

## Conseguenze

- **Pro:** ogni workload sul provider più adatto; free tier dove possibile.
- **Contro:** frammentazione ops, 3 dashboard, health check non unificati.
- **Mitigazione:** runbook per provider (TSK-034/035/036); health check standardizzati (TSK-031).

## Alternative considerate

1. **Tutto su Vercel:** semplice ma serverless non adatto a long-running backend o Docker.
2. **Tutto su AWS/GCP:** potente ma overkill e costi per progetto personale.
