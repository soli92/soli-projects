# WEEKLY_LOG — soli-projects

Registro settimanale delle attivita' principali sul repo, con focus su decisioni e stato operativo.

---

## Settimana 2026-04-28 / 2026-05-03

### 2026-04-30 — Bootstrap e hardening iniziale

- Creato scaffold Next.js 16 + React 19 + TypeScript strict con SoliDS `^1.14.1`.
- Aggiunte basi operative: `README.md`, `AGENTS.md`, `AGENT.md`, `AI_LOG.md`, workflow CI, `.env.example`.
- Allineata la configurazione ESLint al formato flat ESM (`eslint.config.mjs`) in compatibilita' con Next 16.
- Aggiunto `package-lock.json` per supportare `npm ci` in GitHub Actions.
- Risolto blocco build aggiungendo `tailwindcss-animate` richiesto dal preset SoliDS.
- Verifica locale completata: `lint`, `type-check`, `test`, `build` tutti verdi.
- Deploy Vercel da verificare dopo push su `main` e completamento CI.
