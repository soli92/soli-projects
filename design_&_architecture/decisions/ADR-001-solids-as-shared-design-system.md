---
id: ADR-001
title: "@soli92/solids come design system condiviso"
status: accepted
date: 2026-05-25
wiki_pages: [design-system-solids, solids]
epic: EP-001
---
# ADR-001 — @soli92/solids come design system condiviso

## Contesto

L'ecosistema soli92 comprende 10+ applicazioni web con necessità di coerenza visiva: token colore, tipografia, spaziatura, componenti base [^src: raw/solids-agents.md §Repo].

## Decisione

Adottare `@soli92/solids` come unico design system, distribuito via npm con Tailwind preset, CSS variables, e registry shadcn/ui. Tutti i consumer dichiarano range `^1.14.1`.

## Conseguenze

- **Pro:** coerenza visiva, riduzione duplicazione, temi condivisi (light/dark + custom).
- **Contro:** singolo punto di rottura se una release introduce breaking change; necessario test di range su ogni consumer.
- **Mitigazione:** test `solids-package.test` in ogni repo consumer; CI che verifica build dopo aggiornamento.

## Alternative considerate

1. **Tailwind config condiviso senza pacchetto npm:** meno overhead, ma nessun versionamento e difficile sincronizzare token.
2. **CSS custom properties senza preset:** flessibile ma senza l'integrazione Tailwind che semplifica l'adozione.
