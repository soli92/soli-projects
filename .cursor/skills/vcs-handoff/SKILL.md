# Skill: VCS Handoff

> Adapter Cursor della skill `vcs-handoff` definita in PATTERN.md §15 — coordina il commit del codice prodotto da un dev-agent con la topologia VCS del progetto. Gate umano obbligatorio per ogni scrittura VCS.

Invocata da [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) (Fase 5), DOPO [dev-handoff](mdc:.cursor/skills/dev-handoff/SKILL.md) (entry su `wiki/log.md`).

**Topologia VCS del progetto soli-projects:** `monorepo`, single-committer su `main`, **commit per-task**, **mai push automatici** (gate umano).

## Fase 0 — Pre-condizioni

1. Leggi (@-mention) `factory.config.yaml`. Conferma `vcs.mode: monorepo`, `code_path: "."`.
2. Verifica coerenza: `code_path` relativo dentro al repo (`.`). Se incoerente → STOP e segnala in chat.
3. Verifica branch: si committa su `main` (single-committer). Se HEAD detached → STOP e segnala.

## Fase 1 — Procedura (mode: monorepo)

1. `git status` nel repo (terminal embedded).
2. Se nessun cambiamento sotto `code_path` → STOP, segnala "develop senza modifiche" (raro ma possibile).
3. Stagea solo i file pertinenti al TSK (scope del ruolo): `git add <files-del-TSK>`. Mai `git add .` indiscriminato se ci sono modifiche fuori scope.
4. Proponi il messaggio di commit (un commit per-task):
   ```
   feat(<layer>): <TSK title sintetizzato>

   TSK-ZZZ: <link relativo al TSK>
   <eventuale DoD partial note>
   ```
   Per layer non-feature usa il type appropriato (`fix`, `chore`, `test` per qa-dev, `feat`/`chore` per db-dev migration).
5. **Gate umano** → mostra il diff staged + il messaggio proposto, chiedi OK.
6. Su OK: `git commit -m <messaggio>`. **Nessun push automatico.**

## Fase 2 — Log entry (estensione di dev-handoff)

Append a `wiki/log.md` (la stessa entry di [dev-handoff](mdc:.cursor/skills/dev-handoff/SKILL.md), estesa con info VCS):

```markdown
## YYYY-MM-DD HH:MM — develop TSK-ZZZ
**Agente:** <be-dev|fe-dev|db-dev|qa-dev>
**TSK:** [[../management/kanban/.../TSK-ZZZ]]
**Layer:** <be|fe|db|qa>
**Code path:** . (monorepo)
**VCS mode:** monorepo
**Branch:** main
**Commit:** <hash-short o "n/a">
**Files touched:** <count>
**DoD:** <pass | partial>
**Note:** <free-form>
```

## Vincoli inviolabili (PATTERN §7 r.14)

- **Mai `git push`** senza conferma esplicita dell'utente, mai automatico.
- **Mai `--force`**, `--no-verify`, `--amend` (preferisci nuovi commit).
- **Mai cambiare branch** nel repo (`git checkout <other-branch>`): l'utente decide su quale branch si trova prima di invocare il dev-agent. Single-committer su `main`.
- **Un commit per-task**: mai accorpare più TSK in un commit, mai spezzare un TSK senza passare dal TPM.
- **Gate umano su ogni commit**: mostra sempre diff + messaggio e attendi OK.

## Errori comuni

- **HEAD detached** → STOP, l'utente deve fare checkout di un branch prima.
- **`code_path` non esiste** → STOP, segnala (non dovrebbe accadere con `code_path: "."`).
- **Conflitti staged** nel repo → STOP, non si committa sopra conflitti aperti.
- **Modifiche fuori scope** nello staging area → STOP, stagea solo i file del TSK corrente.

## Cross-reference

- Invocata da: [dev-protocol](mdc:.cursor/skills/dev-protocol/SKILL.md) (Fase 5).
- Skill parallela: [dev-handoff](mdc:.cursor/skills/dev-handoff/SKILL.md) (entry log, eseguita prima).
