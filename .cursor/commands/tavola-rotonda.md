# /tavola-rotonda — sessione di deliberazione multi-agente (EP-039)

Avvia una sessione Tavola Rotonda multi-agente (EP-039, PATTERN §28). Parsa topic e flag, verifica
la config, e dispatcha al ruolo [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc)
che esegue le 5 fasi del protocollo (Setup → Posizioni → Confronto → Convergenza → Sintesi). Gated
su `tavola_rotonda.enabled` (R.P3-TR opt-in totale).

---

## Sintassi

```
/tavola-rotonda <topic>
/tavola-rotonda <topic> --partecipanti=<agent1>,<agent2>,...
/tavola-rotonda <topic> --max-round=<N>
/tavola-rotonda <topic> --partecipanti=<a>,<b> --max-round=<N> --budget=<USD>
```

| Flag | Tipo | Default | Descrizione |
|---|---|---|---|
| `<topic>` | obbligatorio | — | Questione o decisione da deliberare (max 120 caratteri) |
| `--partecipanti=<lista>` | opzionale | da config | Slug agenti separati da virgola (es. `be-dev,lead-architect`) |
| `--max-round=<N>` | opzionale | `4` (hardcoded) | Numero massimo di round di convergenza |
| `--budget=<USD>` | opzionale | da config | Tetto di costo USD per la sessione (es. `2.00`) |

---

## Procedura

### Step 0 — Gate `tavola_rotonda.enabled` (precondizione assoluta)

Leggi (@-mention) `factory.config.yaml` e controlla il flag:

```
SE factory.config.yaml.tavola_rotonda.enabled == false (default R.P3-TR):
  STOP — non invocare l'agente, non creare file, nessun side-effect.
  Emetti in chat:
    "Tavola Rotonda non abilitata. Aggiungi `tavola_rotonda.enabled: true` +
     `budget.max_cost_usd` in factory.config.yaml"
```

Non emettere un STOP silenzioso: il messaggio deve essere esplicito e orientare l'azione. Se
`tavola_rotonda.enabled: true`, prosegui.

### Step 1 — Parse argomenti

Estrai:
- `topic` — prima stringa non-flag (obbligatoria); se assente, STOP:
  ```
  [/tavola-rotonda] Topic mancante.

  Utilizzo: /tavola-rotonda <topic> [--partecipanti=<a>,<b>] [--max-round=<N>] [--budget=<USD>]

  Esempi:
    /tavola-rotonda "Quale pattern di caching adottare per l'API?"
    /tavola-rotonda "Architettura auth" --partecipanti=be-dev,lead-architect
    /tavola-rotonda "DB sharding strategy" --max-round=3 --budget=3.00

  Fornisci un topic che descriva la questione da deliberare.
  ```
- `flag_partecipanti` — valore di `--partecipanti` (stringa CSV) o `null`.
- `flag_max_round` — valore di `--max-round` (intero) o `null`.
- `flag_budget` — valore di `--budget` (float USD) o `null`.

Validazioni:
- `--max-round` intero ≥ 1. Non valido → STOP: «Valore --max-round non valido: <v>. Deve essere un intero ≥ 1.»
- `--budget` float > 0. Non valido → STOP: «Valore --budget non valido: <v>. Deve essere un numero positivo (es. 2.00).»
- `topic` ≤ 120 caratteri. Più lungo → tronca a 120 e segnala: «[/tavola-rotonda] Topic troncato a 120 caratteri.»

### Step 2 — Risoluzione parametri (ordine di precedenza)

**`partecipanti`** (lista agenti):
1. Se `flag_partecipanti` valorizzato → usa i valori CSV splittati (override one-shot).
2. Altrimenti leggi `factory.config.yaml.tavola_rotonda.partecipanti`.
3. Se entrambe producono lista vuota → **STOP** (gate partecipanti): «Specifica almeno 2
   partecipanti con `--partecipanti=<a>,<b>` o nella config.»

**`max_round`** (intero): flag → `factory.config.yaml.tavola_rotonda.max_round` → default `4`.

**`budget_max_cost_usd`** (float USD):
1. Se `flag_budget` valorizzato → usa quel valore (override one-shot).
2. Altrimenti leggi `factory.config.yaml.tavola_rotonda.budget.max_cost_usd`.
3. Se `null` / `~` / assente → **STOP** (gate budget):
   ```
   STOP — Sessione Tavola Rotonda non avviata.
   Motivo: budget.max_cost_usd non definito (INV-TR-3).
   Azione richiesta: definire un tetto di costo prima di procedere, aggiungendo
   a factory.config.yaml:
       tavola_rotonda:
         budget:
           max_cost_usd: <valore-USD>   # es. 2.00
   oppure passa il budget inline: /tavola-rotonda <topic> --budget=2.00
   ```

**`critico`** (bool/slug): `factory.config.yaml.tavola_rotonda.critico.enabled` → default `true`.
**`topologia`** (stringa): `factory.config.yaml.tavola_rotonda.topologia` → default `lavagna`.

Dopo la risoluzione, verifica la cardinalità: se la lista partecipanti ha < 2 agenti → **STOP**
(gate partecipanti). Segnala in chat i valori risolti:
```
[/tavola-rotonda] Parametri risolti:
  topic:        <topic>
  partecipanti: <lista> (fonte: flag|config)
  max_round:    <N> (fonte: flag|config|default)
  budget_usd:   <USD> (fonte: flag|config)
  critico:      <true|false>
  topologia:    <lavagna|grafo_completo>
```

### Step 3 — Validazione agenti partecipanti

Per ogni slug in `partecipanti`, verifica che il file ruolo esista: `.cursor/rules/<slug>.mdc`. Se
uno slug non ha un file corrispondente: STOP — «Agente non trovato: <slug>. Verifica che
`.cursor/rules/<slug>.mdc` esista prima di procedere.»

### Step 4 — Invocazione `tavola-rotonda-moderatore`

Lancia il ruolo [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc)
passando:
```yaml
topic: <topic>
partecipanti: [<slug-1>, <slug-2>, ...]
critico: <true|false>
max_round: <N>
budget:
  max_cost_usd: <USD>
topologia: <lavagna|grafo_completo>
```

Esegue le 5 fasi del protocollo:

| Fase | Nome | Azione |
|---|---|---|
| 0 | Setup | Valida parametri, crea blackboard in `wiki/decisions/`, assegna Critico |
| 1 | Posizioni | Lancia partecipanti in isolamento, trascrive posizioni iniziali |
| 2 | Confronto | Rende visibili le posizioni, round di critiche e integrazioni |
| 3 | Convergenza | Loop: estrae accordi, aggiorna Punti Aperti, verifica stop |
| 4 | Sintesi | Produce registro decisioni, aggiorna blackboard, log entry |

### Step 5 — Output post-sessione

**Esito positivo (sessione completata)**:
```
/tavola-rotonda — completata
=============================
Topic:        <topic>
Sessione:     <session-id>
Partecipanti: <lista>
Round:        <N completati> / <max_round>
Motivo stop:  consenso | max_round | budget_esaurito | stallo

Registro decisioni: wiki/decisions/tavola-rotonda-<session-id>-<YYYY-MM-DD>.md
Log entry:          wiki/log.md (entry develop aggiunta)
```

**Esito con sintesi forzata** (stallo, budget o max_round): riepilogo positivo + nota:
```
Nota: sessione terminata per <motivo>. La sintesi riflette il massimo
      consenso raggiunto — i Punti Aperti residui sono documentati nel
      registro decisioni.
```

**Esito con STOP** (gate o errore):
```
/tavola-rotonda — STOP
=======================
Step <N> — <motivo del blocco>
Azione richiesta: <descrizione azione>
```

---

## Esempi d'uso

```bash
# Delibera su un tema architetturale con config defaults
/tavola-rotonda "Quale pattern di caching adottare per l'API?"

# Specifica i partecipanti inline (override one-shot della config)
/tavola-rotonda "Architettura auth" --partecipanti=be-dev,lead-architect,qa-dev

# Limita i round e imposta il budget esplicitamente
/tavola-rotonda "DB sharding strategy" --max-round=3 --budget=3.00

# Sessione completa con tutti i flag
/tavola-rotonda "Adottare GraphQL o REST?" --partecipanti=be-dev,fe-dev,lead-architect --max-round=5 --budget=5.00
```

---

## Vincoli

- **Gate `tavola_rotonda.enabled`** (Step 0): il comando non procede e non è silenzioso a flag
  spento — emette un errore esplicito con le istruzioni di attivazione (R.P3-TR).
- **Budget obbligatorio** (Step 2, INV-TR-3): nessuna sessione parte senza un valore numerico per
  `budget.max_cost_usd`. Fail sempre esplicito, mai silenzioso.
- **Almeno 2 partecipanti** (Step 2): diversità strutturale minima. 1 solo partecipante è un errore esplicito.
- **Override one-shot**: `--partecipanti`, `--max-round` e `--budget` non modificano
  `factory.config.yaml`. Per cambiare la config in modo persistente, edita direttamente il file.
- **No auto-eval**: il comando non esprime giudizi qualitativi sulla decisione emergente. La
  valutazione è delegata al registro decisioni prodotto dall'agente.
- **Topic max 120 caratteri**: limite coerente con il frontmatter del blackboard (ADR-EP039-001).

---

## Prerequisiti

- `factory.config.yaml.tavola_rotonda.enabled: true` (gate principale, Step 0).
- `factory.config.yaml.tavola_rotonda.budget.max_cost_usd` valorizzato (INV-TR-3), oppure flag
  `--budget=<USD>` inline.
- Almeno 2 agenti nella lista `partecipanti` (config o `--partecipanti`).
- File ruolo [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc) presente.
- I file ruolo per ogni partecipante esistenti in `.cursor/rules/`.

Sezione `tavola_rotonda:` minima in `factory.config.yaml`:
```yaml
tavola_rotonda:
  enabled: true
  partecipanti: [be-dev, lead-architect]   # oppure specifica con --partecipanti
  max_round: 4
  budget:
    max_cost_usd: 2.00
```

---

## Cross-link

- **Ruolo invocato**: [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc) (EP-039)
- **Skill eseguita**: [tavola-rotonda-protocol](mdc:.cursor/skills/tavola-rotonda-protocol/SKILL.md) (EP-039 US-139)
- **ADR normativo blackboard**: `design_&_architecture/decisions/ADR-EP039-001-blackboard-format.md`
- **Config gate**: `factory.config.yaml` blocco `tavola_rotonda:` (R.P3-TR)
- **PATTERN §28** — Tavola Rotonda multi-agente (EP-039)
- **Concept** [[tavola-rotonda]]: `wiki/concepts/tavola-rotonda.md`
