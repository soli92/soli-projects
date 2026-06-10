# Skill: Dev Handoff

> Adapter Cursor della skill `dev-handoff` definita in PATTERN.md §3 — entry su `wiki/log.md` a chiusura di un TSK consumato da un dev-agent.

Append-only su `wiki/log.md` quando un dev-agent completa un TSK (`in-progress` → `done`). Invocata da [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) (Fase 5), prima di [vcs-handoff](mdc:.cursor/skills/vcs-handoff/SKILL.md).

## Formato entry

```markdown
## YYYY-MM-DD HH:MM — develop TSK-ZZZ
**Agente:** <be-dev|fe-dev|db-dev|qa-dev>
**TSK:** [[../management/kanban/EP-XXX-<slug>/US-YYY-<slug>/TSK-ZZZ]]
**Layer:** <be|fe|db|qa>
**Code path:** . (monorepo)
**Files touched:** <count> (lista compatta solo se ≤ 5; altrimenti "vedi commit")
**Commit:** <hash short>
**DoD:** <pass | partial — descrivi>
**Note:** <free-form, max 2-3 righe; segnala blocker non-bloccanti rilevati>
```

## Esempi

### Caso normale (DoD pass)

```markdown
## 2026-06-10 14:32 — develop TSK-042
**Agente:** be-dev
**TSK:** [[../management/kanban/EP-003-auth/US-012-login/TSK-042]]
**Layer:** be
**Code path:** . (monorepo)
**Files touched:** 3 (lib/auth/session.ts, app/api/login/route.ts, lib/supabase/server.ts)
**Commit:** a1b2c3d
**DoD:** pass — type-check, lint, test verdi
**Note:** Service role usato solo lato server (route handler).
```

### Caso FE

```markdown
## 2026-06-10 16:10 — develop TSK-043
**Agente:** fe-dev
**TSK:** [[../management/kanban/EP-003-auth/US-012-login/TSK-043]]
**Layer:** fe
**Code path:** . (monorepo)
**Files touched:** 2 (app/login/page.tsx, components/login-form.tsx)
**Commit:** e4f5g6h
**DoD:** pass — type-check, lint, test verdi
**Note:** Componenti @soli92/solids + Tailwind.
```

### Caso DoD parziale (blocker)

```markdown
## 2026-06-10 18:00 — develop TSK-044 (PARTIAL)
**Agente:** db-dev
**TSK:** [[../management/kanban/EP-003-auth/US-012-login/TSK-044]]
**Layer:** db
**Code path:** . (monorepo)
**Files touched:** 1 (sql/004_add_pm_session.sql)
**Commit:** —
**DoD:** partial — test integration non disponibile (fixture Supabase mancante)
**Note:** Status TSK resta `in-progress`. Apro gap "missing-db-test-fixture" in wiki/gaps.md.
```

## Regole

- **Append-only**: mai editare entry passate (PATTERN §7 r.5).
- **Una entry per TSK chiuso**. Per correggere, append nuova entry con marker `## YYYY-MM-DD HH:MM — develop TSK-ZZZ (correction)`.
- **Mai citare il codice prodotto** direttamente in `wiki/log.md` (rumore). Cita il TSK; chi vuole il codice apre il commit / il file.
- **Coerenza con [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md)**: l'entry si scrive SOLO se `status: done` o `status: in-progress (partial)`. Mai per TSK in fase di gate.

## Cross-reference

- Cita: [wiki-log-entry](mdc:.cursor/skills/wiki-log-entry/SKILL.md) (formato generale log entries).
- Invocata da: [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) (Fase 5).
- Skill parallela: [vcs-handoff](mdc:.cursor/skills/vcs-handoff/SKILL.md) (coordinamento commit).
