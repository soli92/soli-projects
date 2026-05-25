# Cross-Project Index — Sorgenti da sincronizzare

> Questo file elenca i repository soli92 e i file sorgente da copiare in `raw/` per l'ingest nella wiki.
> Usato dal ruolo Sync (`.cursor/rules/sync-docs.mdc`).

## Istruzioni sync

Per ogni repo nel workspace, copiare in `raw/`:
- `AGENTS.md` → `raw/<repo>-agents.md`
- `AI_LOG.md` → `raw/<repo>-ai-log.md` (se presente)
- `README.md` → `raw/<repo>-readme.md`

## Repository e path locali

| Repo | Path workspace | AGENTS.md | AI_LOG.md | README.md |
|------|---------------|-----------|-----------|-----------|
| soli-agent | `../soli-agent/` | yes | yes | yes |
| soli-prof | `../soli-prof/` | yes | yes | yes |
| soli-projects | `./` (self) | yes | yes | yes |
| soli-platform | `../soli-platform/` | yes | yes | yes |
| solids | `../solids/solids/` | yes | yes | yes |
| Koollector | `../Koollector/` | yes | yes | yes |
| soli-dome | `../soli-dome/` | yes | yes | yes |
| pippify | `../pippify/` | yes | yes | yes |
| bachelor-party-claudiano | `../bachelor-party-claudiano/` | yes | yes | yes |
| casa-mia-fe | `../casa-mia-fe/` | yes | yes | yes |
| casa-mia-be | `../casa-mia-be/` | yes | yes | yes |
| soli-dm-fe | `../soli-dm-fe/` | yes | yes | yes |
| soli-dm-be | `../soli-dm-be/` | yes | yes | yes |
| llm-wiki-template | `../llm-wiki-template/` | yes | — | yes |
| soli-obsidian-vault | `../soli-obsidian-vault/` | yes | — | — |
| soli-multi-agents-factory | `../soli-multi-agents-factory/` | — | — | yes |

## Note

- I file in `raw/` sono **copie** delle sorgenti, non symlink. L'immutabilità di L1 si riferisce alla copia, non all'originale.
- Aggiornare `raw/` quando un repo ha aggiornamenti significativi a AGENTS.md o AI_LOG.md.
- Il wiki-keeper ingerisce da `raw/`, mai direttamente dai repo.
