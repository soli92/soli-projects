---
name: semantic-drift-scan
description: "Esegue il semantic drift scan sulla wiki (sperimentale, EP-031 US-108). Trigger manuale — non automatico. Non è un gate di pipeline."
---

# /semantic-drift-scan

Comando sperimentale EP-031 (US-108). Esegue il semantic drift scan sull'intera
wiki confrontando ogni pagina con `pattern_section:` dichiarato vs. la sezione
corrispondente di `PATTERN.md` tramite embedding e similarità coseno.

**Trigger manuale — non automatico. Non è un gate di pipeline.**

Il check emette solo INFO; non genera mai WARNING o ERROR di lint. Non blocca
alcun flusso CI/CD, release o wave dispatch.

---

## Utilizzo

```
/semantic-drift-scan
```

Nessun argomento obbligatorio. Tutti i parametri operativi si leggono da
`factory.config.yaml` (blocco `wiki_lint.semantic_check`).

---

## Comportamento

Il comando invoca la skill `semantic-drift-scan-protocol` (5 step):

1. **Step 1 — Bootstrap check**: verifica che `wiki_lint.semantic_check.enabled: true`
   sia impostato in `factory.config.yaml`. Se `false`, STOP con messaggio esplicito.

2. **Step 2 — Discovery pagine candidate**: scansiona `wiki/**/*.md` e individua
   le pagine con `pattern_section:` nel frontmatter. Stima il costo totale.

3. **Gate di conferma costo**: se il costo stimato supera `cost_warn_usd` (default $1.00),
   si ferma e mostra la stima, chiedendo conferma esplicita ('y'/'n').

4. **Step 3 — Calcolo embedding e similarità**: per ogni pagina candidata calcola
   embedding body pagina e estratto PATTERN.md §N, poi similarità coseno.

5. **Step 4 — Produzione report**: scrive
   `<output_report_path>/wiki-lint-semantic-YYYY-MM-DD.md`.

6. **Step 5 — Log e output**: appende entry a `wiki/log.md` e restituisce sommario.

---

## Prerequisiti

1. `factory.config.yaml` — blocco `wiki_lint.semantic_check.enabled: true`
2. API key embedding (`ANTHROPIC_API_KEY` per voyage-3 o `OPENAI_API_KEY`)
3. Almeno una pagina wiki con `pattern_section: "§N"` nel frontmatter

Vedi `wiki/runbooks/semantic-drift-prerequisites.md` per la configurazione completa.

---

## Vincoli

- **Sperimentale**: soglia 0.75 richiede calibrazione empirica (US-108).
- **Solo INFO**: non altera status di TSK/EP/US, non produce ERROR o WARNING.
- **No auto-trigger**: mai invocato automaticamente da scheduler, CI/CD o `/run`.
- **Idempotenza**: scan multipli nello stesso giorno sovrascrivono il report.
