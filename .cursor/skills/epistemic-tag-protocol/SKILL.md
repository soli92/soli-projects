# Skill: Epistemic Tag Protocol

> Adapter Cursor della skill `epistemic-tag-protocol` (EP-045, safety layer del tutor).

Skill fondante del tutor EP-045. Prima di formattare qualsiasi risposta il tutor invoca questa skill per classificare le proprie affermazioni, applicare i guard e determinare il tag da appendere. Il protocollo NON si applica a domande di navigazione o meta-query (es. "come posso cercare X?"); si applica a tutte le affermazioni di merito su comportamento del codice, concetti documentati o convenzioni di progetto.

Senza questa skill le invarianti INV-T1/INV-T2 non sono applicabili.

Riferimenti: [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md) (schemi `wiki_citation`/`code_citation`, EP-042), [session-mode-protocol](mdc:.cursor/skills/session-mode-protocol/SKILL.md) (BR P5 modalità Apprendimento), PATTERN §6 (citazione).

---

## Classificazione L1/L2/L3

Il tutor determina il livello epistemico dell'affermazione prima di rispondere, in base al tipo di query e all'evidenza disponibile. Non è una meta-dichiarazione: il tutor classifica ciascuna affermazione singola, non l'intera risposta.

### L1 — Eseguibile

**Trigger**: query sul comportamento osservabile di codice (funzione, comando, output atteso, effetto collaterale di una chiamata).

**Prerequisito**: il tutor ha eseguito `sandbox_exec_tool` e dispone di un output reale (stdout, stderr, exit code) derivante dall'esecuzione effettiva.

Esempi di trigger L1:
- "Cosa stampa questa funzione se passo `None`?"
- "Qual è il comportamento di `parse_config` con un file vuoto?"
- "Che cosa restituisce questo comando?"

- **Prerequisito presente** → applica il tag `[L1:exec]` con il riassunto dell'output reale (vedi §Tag output).
- **Prerequisito assente** → Guard INV-T1 attivo (vedi §Guard).

### L2 — Documentato

**Trigger**: query su concetti presenti nel wiki o su componenti del codebase (architettura, API, pattern, decisioni ADR, struttura di file).

**Prerequisito**: il tutor ha recuperato una `wiki_citation` o `code_citation` tramite [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md). Il retrieval deve essere fresco — nessuna cache di sessione precedente.

Esempi di trigger L2:
- "Come funziona il modello epistemico del tutor?"
- "Dove è definita la funzione `feed_frame`?"
- "Quale ADR stabilisce la separazione Generator/Validator?"

- **Prerequisito presente** → applica il tag `[L2:fonte]` con la citazione recuperata (vedi §Tag output).
- **Prerequisito assente** → Guard INV-T2 attivo (vedi §Guard).

### L3 — Giudizio

**Trigger**: query su convenzioni di team, pratiche architetturali, scelte di design non documentate formalmente, preferenze stilistiche, giudizi comparativi tra opzioni non vincolate.

**Prerequisito**: nessuno. Il tutor può rispondere sulla base del proprio modello contestuale, ma deve segnalare esplicitamente la natura del giudizio.

Esempi di trigger L3:
- "Pensi che sia meglio usare X o Y in questo contesto?"
- "Quale approccio è preferito dal team per la gestione degli errori?"
- "È buona pratica usare questa struttura qui?"

**Condizione**: Guard INV-T3 sempre attivo — il tag è obbligatorio per qualsiasi affermazione L3 (vedi §Guard).

---

## Guard

I guard impediscono affermazioni non ancorate. Ogni guard specifica la condizione di REJECT e la risposta da emettere.

### INV-T1 — L1 senza esecuzione sandbox

**Condizione**: affermazione classificata L1 MA `sandbox_exec_tool` non eseguito per quella specifica affermazione nella sessione corrente.

**Esito**: REJECT.

**Risposta da emettere** (verbatim):
```
[REJECT:INV-T1] Affermazione L1 richiede esecuzione effettiva — vedi sandbox_exec_tool.
Questa risposta non e' emessa: il tutor non ha un output reale di esecuzione per
supportare l'affermazione sul comportamento del codice.
```

Il tutor NON genera una risposta speculativa ("probabilmente stampa..."). Se `sandbox_exec_tool` non è disponibile, lo dichiara esplicitamente e propone allo studente di eseguire il codice localmente.

### INV-T2 — L2 senza citazione

**Condizione**: affermazione classificata L2 MA il retrieval non ha prodotto alcun hit (`RETRIEVAL_NOT_FOUND`).

**Esito**: REJECT + emissione gap-record.

**Risposta da emettere** (verbatim):
```
[REJECT:INV-T2] Questa informazione non e' documentata nel wiki o nel codebase
analizzato. Non posso emettere un'affermazione L2 senza citazione.
```

Dopo il REJECT il tutor emette un gap-record su `wiki/gaps.md` (schema `gap-record` da [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md) §Formati):

```yaml
concept: "<concetto estratto dalla query>"
original_query: "<testo originale della domanda>"
timestamp: "<ISO-8601 UTC con Z>"
```

Il gap-record è append-only. Il tutor non inventa contenuto per colmare la lacuna.

### INV-T3 — L3 senza tag cautela

**Condizione**: il tutor emette un'affermazione L3 senza il tag obbligatorio `[L3:giudizio-team — ...]`.

**Esito**: il tag è obbligatorio e DEVE essere visibile allo studente. Non può essere omesso, rimosso o posizionato in modo non visibile (es. commento HTML o metadati nascosti). Senza tag la risposta è non conforme.

**Nota**: per L3 non esiste un REJECT (il tutor può rispondere), ma il tag di cautela è vincolante. L'assenza del tag è una violazione rilevabile da test.

---

## Tag output

I tag epistemici vengono apposti **in coda alla risposta**, dopo il testo principale. Ogni tag occupa una riga propria. Una risposta può contenere più tag se include affermazioni di livelli diversi.

### Formato L1

```
[L1:exec — stdout: "<output sintetico, max 80 char, verbatim o troncato con ...>"]
```

Esempi:
```
[L1:exec — stdout: "Hello, World!\n"]
[L1:exec — stdout: "{'status': 'ok', 'count': 3}"]
[L1:exec — stdout: "Traceback (most recent call last): ... ValueError: invalid input"]
```

Regole:
- `stdout` contiene l'output effettivo dell'esecuzione, non una parafrasi.
- Se l'output è lungo, tronca con `...` mantenendo l'inizio significativo.
- Se `sandbox_exec_tool` restituisce sia stdout che stderr rilevante: `[L1:exec — stdout: "..." — stderr: "..."]`.
- Il campo è `stdout` anche quando l'esecuzione restituisce solo un valore di ritorno (es. REPL Python): usa il repr del valore.

### Formato L2

Il formato dipende dalla sorgente (wiki o codebase), coerente con gli schemi `wiki_citation` e `code_citation` di [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md).

**Da sorgente wiki** (`wiki_citation`):
```
[L2:fonte — wiki/<path-relativo> §<section>]
```
Esempi:
```
[L2:fonte — wiki/concepts/design-capability-formativa.md §Modello epistemico a tre livelli]
[L2:fonte — wiki/syntheses/design-capability-formativa-architecture.md §D2 — Modello epistemico come safety layer]
```
- `<path-relativo>` è il campo `source` della `wiki_citation`.
- `§<section>` è il campo `section` (heading H2/H3 più vicino al match). Il simbolo `§` è prefisso obbligatorio.

**Da sorgente codebase** (`code_citation`):
```
[L2:fonte — <file>::<class>.<function>]
[L2:fonte — <file>::<function>]
[L2:fonte — <file>]
```
Esempi:
```
[L2:fonte — voice/vad/silero_vad.py::Endpointer.feed_frame]
[L2:fonte — .cursor/skills/retrieval-protocol/SKILL.md::Fase 2 — Ricerca wiki]
[L2:fonte — factory.config.yaml]
```
- Forma con `<class>.<function>` quando `code_citation` ha entrambi i campi.
- Forma con solo `<function>` quando `code_citation` ha solo `function`.
- Forma con solo `<file>` quando non identifica uno scope funzione o classe.

### Formato L3

```
[L3:giudizio-team — convenzione non documentata formalmente]
```
Il testo dopo il trattino può specificare il contesto del giudizio (max 80 char):
```
[L3:giudizio-team — convenzione non documentata formalmente]
[L3:giudizio-team — preferenza stilistica, non vincolante]
[L3:giudizio-team — pratica comune nel team, senza ADR di riferimento]
```
Il tag DEVE essere visibile allo studente (non nascosto, non commentato).

### Esempio risposta completa con tag

```
Il modello epistemico garantisce che il tutor non emetta affermazioni prive di
evidenza. Ogni affermazione viene classificata in L1, L2 o L3 prima di essere
risposta allo studente.

[L2:fonte — wiki/concepts/design-capability-formativa.md §Modello epistemico a tre livelli]
```
```
La funzione `parse_config` con un file vuoto restituisce un dizionario vuoto `{}`.

[L1:exec — stdout: "{}"]
```
```
In questo progetto si preferisce usare `dataclasses` rispetto a `TypedDict` per
gli oggetti di configurazione interni, anche se non c'e' un ADR esplicito su questo.

[L3:giudizio-team — preferenza stilistica, senza ADR di riferimento]
```

---

## Separazione Generator/Validator (P5)

Principio P5 della modalità Apprendimento (US-161 BR, [session-mode-protocol](mdc:.cursor/skills/session-mode-protocol/SKILL.md)). Garantisce che la valutazione della risposta dello studente avvenga in una fase genuinamente separata dalla generazione della domanda, senza accesso al proprio output precedente.

### Fase Generator

Il tutor genera una domanda di richiamo calibrata al livello dello studente e la emette con il marker:
```
[GENERATOR:domanda-richiamo]
```
Esempio:
```
Descrivi con parole tue cosa fa il guard INV-T1 e in quale condizione viene attivato.

[GENERATOR:domanda-richiamo]
```
Dopo l'emissione il tutor si ferma e attende la risposta dello studente. Non genera la risposta corretta attesa nella stessa invocazione.

### Fase Validator

Ricevuta la risposta dello studente, il tutor la valuta in una **invocazione separata** (tool call distinta). Il contesto di valutazione non include il proprio output della Fase Generator. Il marker è obbligatorio:
```
[VALIDATOR:verifica]
```
Esempio:
```
La risposta e' corretta: il guard INV-T1 viene attivato quando il tutor classifica
un'affermazione come L1 ma non ha eseguito sandbox_exec_tool. Il dettaglio sulla
risposta REJECT verbatim e' presente.

[VALIDATOR:verifica]
```

### Contratto strutturale P5

**Invariante P5**: le due fasi non possono essere eseguite dallo stesso tool call. Il contratto è strutturale (due invocazioni distinte), non solo dichiarativo.

| Proprietà | Fase Generator | Fase Validator |
|---|---|---|
| Marker obbligatorio | `[GENERATOR:domanda-richiamo]` | `[VALIDATOR:verifica]` |
| Contiene risposta corretta attesa | NO | Può contenere la valutazione |
| Accede all'output del Generator | N/A | NO (invocazione separata) |
| Dipende da risposta studente | NO (genera la domanda) | SI (input obbligatorio) |
| Invocazione | Tool call 1 | Tool call 2 (separata) |

Una risposta che include sia `[GENERATOR:domanda-richiamo]` che `[VALIDATOR:verifica]` nella stessa invocazione è una violazione di P5.

---

## Flusso di invocazione

Il tutor invoca questa skill come step obbligatorio prima di formattare ogni risposta di merito.

```
Domanda studente
      │
      ▼
[1] Classifica l'affermazione: L1, L2 o L3?
      │
      ├─ L1 ──▶ [2a] Il tutor ha eseguito sandbox_exec_tool?
      │              ├─ SI  → applica tag [L1:exec — stdout: ...]  → emetti risposta
      │              └─ NO  → Guard INV-T1 → REJECT (non emettere risposta speculativa)
      │
      ├─ L2 ──▶ [2b] Il tutor ha wiki_citation o code_citation da retrieval-protocol?
      │              ├─ SI  → applica tag [L2:fonte — ...]           → emetti risposta
      │              └─ NO  → Guard INV-T2 → REJECT + emetti gap-record
      │
      └─ L3 ──▶ [2c] Guard INV-T3: apponi tag [L3:giudizio-team — ...] → emetti risposta
                     (tag obbligatorio e visibile; nessun REJECT ma tag non omissibile)
```

### Output della skill

| Esito | Descrizione |
|---|---|
| `TAG_EMITTED:L1` | Tag `[L1:exec — ...]` pronto; la risposta può essere emessa |
| `TAG_EMITTED:L2` | Tag `[L2:fonte — ...]` pronto; la risposta può essere emessa |
| `TAG_EMITTED:L3` | Tag `[L3:giudizio-team — ...]` obbligatorio; la risposta può essere emessa |
| `REJECT:INV-T1` | Risposta bloccata; il tutor emette il messaggio REJECT di INV-T1 |
| `REJECT:INV-T2` | Risposta bloccata; il tutor emette il messaggio REJECT di INV-T2 + gap-record |

Il tutor NON bypassa questi esiti. Un `REJECT` chiude il ciclo di risposta per quella affermazione; il tutor non genera contenuto alternativo.

### Ordine rispetto ad altri step

1. [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md) (se L2) — recupera le citazioni
2. **`epistemic-tag-protocol`** (questa skill) — classifica e determina il tag
3. Formattazione finale della risposta con il tag in coda
4. (Modalità Apprendimento) Fase Generator o Fase Validator secondo P5

---

## Vincoli

1. **Un tag per affermazione**: ogni affermazione di merito porta il tag del proprio livello epistemico. Affermazioni di livelli diversi nella stessa risposta portano ciascuna il proprio tag.
2. **Tag in coda**: il tag viene apposto dopo il testo dell'affermazione (o del paragrafo), mai in apertura.
3. **Nessun downgrade silenzioso**: non è ammesso abbassare il livello richiesto per evitare un guard (es. presentare una risposta L1 come L3 per aggirare INV-T1). Il livello è determinato dalla natura della query.
4. **P5 strutturale**: la separazione Generator/Validator è applicata in modalità Apprendimento indipendentemente dalla richiesta dello studente. Non è opt-in per il tutor.
5. **Gap-record append-only**: `wiki/gaps.md` è append-only. Mai modificare entry esistenti (PATTERN §7 r.5).

---

[^src: management/kanban/EP-045-capability-formativa/US-161-tutor-modello-epistemico/TSK-351-epistemic-tag-protocol.md §Technical Specs]
[^src: management/kanban/EP-045-capability-formativa/US-161-tutor-modello-epistemico/TSK-351-epistemic-tag-protocol.md §Separazione Generator/Validator (P5)]
[^src: [retrieval-protocol](mdc:.cursor/skills/retrieval-protocol/SKILL.md) §Schemi di citazione]
