---
type: lint
created: 2026-06-25
updated: 2026-06-25
sources: [soli-prof/lib/rag-service/config.ts, soli-projects/factory.config.yaml]
status: draft
related_task: TSK-022
epic: EP-003
us: US-008
---
# Corpus Coverage Audit — 2026-06-25

> Confronto tra i repository dichiarati in `factory.config.yaml` (cross_project_repos) e quelli effettivamente indicizzati in `CORPUS_REPOS` (`lib/rag-service/config.ts` in soli-prof).
> **Stato: code update pending** — TSK-022 in-progress, il fix verrà applicato in soli-prof.

---

## Tabella di confronto

### Repo in `factory.config.yaml` → `cross_project_repos` (17 voci)

| Repo | ai_logs | agents_md | repo_configs | Note |
|------|---------|-----------|--------------|------|
| soli-agent | ✅ | ✅ | ✅ | — |
| soli-prof | ✅ | ✅ | ✅ | — |
| soli-projects | ✅ | ✅ | ✅ | — |
| soli-platform | ✅ | ✅ | ✅ | — |
| Koollector | ✅ | ✅ | ✅ | — |
| soli-dome | ✅ | ✅ | ✅ | — |
| pippify | ✅ | ✅ | ✅ | — |
| bachelor-party-claudiano | ✅ | ✅ | ✅ | — |
| casa-mia-fe | ✅ | ✅ | ✅ | — |
| casa-mia-be | ✅ | ✅ | ✅ | — |
| soli-dm-fe | ✅ | ✅ | ✅ | — |
| soli-dm-be | ✅ | ✅ | ✅ | — |
| solids | ✅ | ✅ | ✅ | — |
| **soli-boy** | ❌ | ❌ | ❌ | Agentic Factory v2.19, ha AGENTS.md → pertinente |
| **soli-multi-agents-factory** | ❌ | ❌ | ❌ | Meta-framework agentico, ha AGENTS.md → pertinente |
| **llm-wiki-template** | ❌ | ❌ | ❌ | Template wiki, AGENTS.md minimo → borderline |
| **soli-obsidian-vault** | ❌ | ❌ | ❌ | Vault personale, no AI_LOG.md/AGENTS.md rilevante → non pertinente |

### Repo in `CORPUS_REPOS` ma **non** in `factory.config.yaml`

| Repo | Presenza in CORPUS_REPOS | Note |
|------|--------------------------|------|
| **health-wand-and-fire** | ✅ ai_logs, agents_md, repo_configs | Non nella lista cross_project_repos di factory.config.yaml → incongruenza |

---

## Gap identificati

### Gap 1: repo presenti in factory.config.yaml ma assenti da CORPUS_REPOS

**soli-boy**
- Ruolo: emulatore multipiattaforma GB/GBC/GBA + arcade (web/desktop/mobile), Agentic Factory llm-wiki++ v2.19
- Ha AGENTS.md: sì (confermato da ingest 2026-06-10, source page `wiki/sources/soli-boy.md`)
- Ha AI_LOG.md: sconosciuto (non verificato nelle sorgenti raw) → da verificare
- Pertinenza per `agents_md`: **alta** (Agentic Factory con adapter .claude/ + .cursor/)
- Pertinenza per `ai_logs`: **media** (da verificare se il file esiste e ha contenuto utile)
- Pertinenza per `repo_configs`: **media** (stack Next.js/Electron, ha package.json/tsconfig)
- **Raccomandazione: aggiungere a `agents_md` con certezza; aggiungere ad `ai_logs` e `repo_configs` previa verifica**

**soli-multi-agents-factory**
- Ruolo: meta-framework agentico, llm-wiki++ pattern source-of-truth
- Ha AGENTS.md: sì (meta-framework, sicuramente documentato)
- Ha AI_LOG.md: da verificare (factory attiva, probabile)
- Pertinenza per `agents_md`: **alta** (è il repo che definisce il pattern AGENTS.md)
- Pertinenza per `ai_logs`: **alta** (factory molto attiva)
- Pertinenza per `repo_configs`: **alta** (pattern config rilevante per tutti i repo)
- **Raccomandazione: aggiungere a tutti e tre i corpora**

**llm-wiki-template**
- Ruolo: template wiki Obsidian per il pattern llm-wiki++
- Ha AGENTS.md: probabile (template, ma minimo)
- Ha AI_LOG.md: improbabile (template statico, non un repo attivo)
- Pertinenza per `agents_md`: **borderline** (AGENTS.md presente ma minimale, valore di retrieval basso)
- Pertinenza per `ai_logs`: **bassa** (template statico)
- Pertinenza per `repo_configs`: **bassa** (nessuna logica applicativa)
- **Raccomandazione: non aggiungere a CORPUS_REPOS — overhead senza valore retrieval**

**soli-obsidian-vault**
- Ruolo: vault personale Obsidian (note, diario, knowledge base personale)
- Ha AGENTS.md: improbabile (vault personale, non un repo di codice)
- Ha AI_LOG.md: improbabile
- Pertinenza per qualsiasi corpus: **nulla** — il vault non ha struttura tecnica indicizzabile
- **Raccomandazione: escludere da CORPUS_REPOS** (confermato dalla policy: perimetro RAG = repo soli92 di codice)

### Gap 2: health-wand-and-fire in CORPUS_REPOS ma non in factory.config.yaml

`health-wand-and-fire` è presente in tutti e tre i corpora di `CORPUS_REPOS` ma **non** compare nella lista `cross_project_repos` di `factory.config.yaml`. Possibili cause:

- Il repo e stato rimosso dalla KB per qualche motivo (deprecato? archiviato?)
- E stato aggiunto a CORPUS_REPOS prima che venisse aggiornato factory.config.yaml
- E una svista di sincronizzazione tra le due liste

**Raccomandazione:** verificare lo stato del repo `health-wand-and-fire` su GitHub. Se attivo → aggiungerlo a `cross_project_repos` in factory.config.yaml. Se archiviato/deprecato → rimuoverlo da `CORPUS_REPOS`.

---

## Valutazione pertinenza sintesi

| Repo | Aggiungere a CORPUS_REPOS? | Corpus target | Motivo |
|------|---------------------------|---------------|--------|
| soli-boy | **Si** | agents_md, ai_logs (se esiste), repo_configs | Agentic Factory attiva con AGENTS.md rilevante |
| soli-multi-agents-factory | **Si** | agents_md, ai_logs, repo_configs | Meta-framework centrale dell'ecosistema |
| llm-wiki-template | **No** | — | Template statico, basso valore retrieval |
| soli-obsidian-vault | **No** | — | Vault personale, nessun contenuto tecnico indicizzabile |
| health-wand-and-fire | **Verificare** | gia presente in tutti e tre | Incongruenza con factory.config.yaml → allineare |

---

## Stato e prossimi passi

**TSK-022 status: in-progress** — il code update e pianificato in soli-prof.

Azioni necessarie:
1. Verificare se `soli-boy/AI_LOG.md` esiste e ha contenuto utile
2. Verificare stato repo `health-wand-and-fire` (attivo o archiviato?)
3. Aggiungere `soli-boy` e `soli-multi-agents-factory` a `CORPUS_REPOS` in `lib/rag-service/config.ts` (soli-prof)
4. Aggiungere `health-wand-and-fire` a `factory.config.yaml` cross_project_repos (oppure rimuoverlo da CORPUS_REPOS se deprecato)
5. Dopo il code update: eseguire TSK-024 (dry-run ingest per i nuovi repo)
6. Dopo l'ingest: eseguire TSK-023 (setup webhook per i nuovi repo via `scripts/setup-webhooks.sh`)

---

## Riferimenti

- `lib/rag-service/config.ts` (soli-prof) — `CORPUS_REPOS` lista corrente
- `factory.config.yaml` (soli-projects) — `cross_project_repos` lista corrente (17 voci)
- `wiki/sources/soli-boy.md` — source page con nota su CORPUS_REPOS come open question
- TSK-024 — dry-run ingest dopo aggiunta nuovi repo
- TSK-023 — validazione webhook push
- US-008 — Estensione e validazione corpus indicizzati
