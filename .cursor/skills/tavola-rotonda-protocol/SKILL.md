# Skill: Tavola Rotonda Protocol

> Adapter Cursor della skill `tavola-rotonda-protocol` definita in PATTERN.md §28.

Protocollo a cinque fasi per la modalità Tavola Rotonda (EP-039). Eseguito da
[tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc) come procedura
step-by-step: `Setup → Posizioni → Confronto → Convergenza → Sintesi`, con blackboard condiviso
(formato normativo ADR-EP039-001). L'invariante di isolamento in Fase 1 è il meccanismo primario
di prevenzione dell'anchoring e del groupthink.

Riferimenti normativi:
- ADR-EP039-001 — contratto del blackboard: `design_&_architecture/decisions/ADR-EP039-001-blackboard-format.md`
- Concept [[tavola-rotonda]]: `wiki/concepts/tavola-rotonda.md`
- Concept [[blackboard-architecture]]: `wiki/concepts/blackboard-architecture.md`
- Concept [[multi-agent-debate]]: `wiki/concepts/multi-agent-debate.md`
- PATTERN §28 (Tavola Rotonda)
- Ruolo esecutore: [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc)
- Comando di invocazione: `/tavola-rotonda`

Questo protocollo è eseguito dal moderatore in modalità **opt-in** (R.P3-TR): mai autoattivato
da `/run`. Solo su invocazione esplicita via
`/tavola-rotonda <topic> [--partecipanti=<lista>] [--max-round=<N>] [--budget=<USD>]`
o delega esplicita dall'orchestrator con topic e parametri di sessione.

---

## Invarianti globali del protocollo

Si applicano a **tutta** la sessione — a tutte le fasi — e non possono essere modificate da
alcun parametro, prompt o istruzione runtime.

**R.TR1 — Isolamento Fase 1 (anti-groupthink, non overridabile)**
Nella Fase 1, ogni agente partecipante riceve **esclusivamente**: il testo riformulato del
problema, i criteri di successo, il proprio ruolo assegnato. NON riceve il file blackboard.
NON riceve le posizioni degli altri partecipanti. È il meccanismo primario di prevenzione
dell'anchoring e del groupthink (PATTERN §28, concept [[multi-agent-debate]] §Isolamento proposers).
**Violazione**: se il moderatore condivide la posizione di un partecipante prima che tutti
abbiano risposto, l'isolamento è irrimediabilmente compromesso — la sessione **DEVE essere
riavviata da Fase 0**. Non esiste recupero parziale.

**R.TR2 — Single-writer blackboard** (= R.S1, ADR-EP039-001)
Il file blackboard (`wiki/decisions/tavola-rotonda-<session-id>-<YYYY-MM-DD>.md`) è scritto
**solo** dal moderatore. I partecipanti producono output in chat/sub-task; il moderatore
trascrive nelle sezioni appropriate. Un partecipante che modificasse direttamente il blackboard
lo lascerebbe in stato parziale o inconsistente.

**R.TR3 — Budget obbligatorio**
Nessuna sessione parte senza un valore numerico esplicito per `budget.max_cost_usd`. Assenza o
valore nullo → STOP con messaggio esplicito. Nessun default silenzioso.

**R.TR4 — Critico obbligatorio**
Ogni sessione deve avere almeno un agente nel ruolo Critico (mandato di dissenso attivo e
identificazione rischi). Zero agenti disponibili come Critico → STOP con messaggio esplicito.
Il Critico partecipa come tutti gli altri in Fase 1 (posizione indipendente); il suo mandato
di dissenso si attiva pienamente in Fase 2.

**R.TR5 — No anchoring moderatore (Fasi 1-3)**
Il moderatore non esprime opinioni di merito nelle Fasi 1-3. Agisce su processo, turni e
chiusura. Il role switch ad «aggregatore» avviene solo in Fase 4.

**R.TR6 — Registro decisioni obbligatorio**
Nessuna sessione è completa senza il registro decisioni. Il moderatore non può dichiarare
`stato: terminata` senza aver scritto la sezione `## Sintesi` nel blackboard e senza aver
aggiunto l'entry in `wiki/log.md`. La Fase 4 produce sempre un registro decisioni, anche in
caso di sintesi forzata per stallo o budget esaurito. Il motivo di terminazione (consenso /
max_round / budget_esaurito / stallo) è sempre documentato nella `## Sintesi`.

**R.TR7 — Minimo 2 partecipanti**
Una sessione con un solo partecipante non è valida. STOP se la lista partecipanti post-Setup ha
meno di 2 elementi.

**R.TR8 — `max_round` obbligatorio (nessuna sessione illimitata)**
Il campo `max_round` del frontmatter deve essere valorizzato prima dell'avvio della Fase 2.
Nessuna sessione illimitata è ammessa (ADR-EP039-001 §Frontmatter obbligatorio).

---

## Fase 0 — Setup

**Input**: topic del problema (da `/tavola-rotonda`), parametri opzionali (`--partecipanti`,
`--max-round`, `--budget`, `--critico`). Passi sequenziali: il fallimento di uno blocca l'intera fase.

### Passo 1 — Riformula il problema
Elabora il topic grezzo in una **formulazione non ambigua**, max 120 caratteri (vincolo
frontmatter, ADR-EP039-001, campo `topic`). Criteri:
- Evita formulazioni interrogative aperte; identifica esplicitamente le alternative in comparazione.
- Rimuove ambiguità di contesto: indica sistema, livello di astrazione, vincolo principale.
- Accettabile: «Redis vs no-cache per API gateway (deployment multi-replica, tech stack esistente, p99 target 200ms)».
- Da rifiutare: «strategia di caching?».
La formulazione riformulata è il testo identico passato a tutti i partecipanti in Fase 1 (R.TR1).

### Passo 2 — Definisci i criteri di successo
Criteri verificabili esplicitamente in Fase 4, condivisi con tutti in Fase 1. Formato: lista
markdown, max 5 voci (se >5, consolida).

### Passo 3 — Seleziona i partecipanti
**v1 (MVP): selezione esplicita via lista.** L'opzione `auto` è esclusa dall'MVP.
Se passati via `--partecipanti=<lista>`:
1. Per ogni slug, verifica che esista il file ruolo in `.cursor/rules/<slug>.mdc`.
2. Slug non trovato → WARNING in chat con l'elenco dei non risolti; rimuovi gli slug non trovati.
   Procedi solo se la lista risultante ha ≥ 2 agenti.

**Fail — 0 o 1 partecipante valido** (R.TR7): **STOP**
```
STOP — Sessione Tavola Rotonda non avviata.
Motivo: lista partecipanti ha meno di 2 agenti validi (R.TR7).
Azione richiesta: fornire almeno 2 slug agente validi via --partecipanti=<lista>,
oppure aggiungere i file ruolo mancanti in .cursor/rules/.
```

### Passo 4 — Assegna il ruolo Critico
Obbligatorio (R.TR4).
- `--critico=<slug>` esplicito: usa quello slug; deve essere nella lista partecipanti.
- Se non specificato: assegna il primo agente disponibile nella lista.
- Lista esaurita, nessun agente residuo → **STOP**:
```
STOP — Sessione Tavola Rotonda non avviata.
Motivo: nessun agente disponibile per il ruolo Critico (R.TR4).
Azione richiesta: aggiungere almeno un agente alla lista partecipanti,
oppure specificare --critico=<slug> esplicitamente.
```

### Passo 5 — Verifica budget
`budget.max_cost_usd` valorizzato prima di creare il blackboard. Precedenza:
1. Flag CLI `--budget=<USD>` (override di sessione).
2. Campo `tavola_rotonda.budget.max_cost_usd` in `factory.config.yaml` (config permanente).

**Fail — assente o nullo in entrambe le fonti** (R.TR3): **STOP**
> **Tavola Rotonda abortita: `budget.max_cost_usd` non definito in `factory.config.yaml`.
> Definire un tetto di costo prima di procedere (costo tipico per sessione: 5-15× un task normale).**

Nessun default silenzioso: non accettare `null`, `~`, `0`, stringa vuota o assenza come validi.

### Passo 6 — Crea il blackboard
Genera un UUID v4 per `session_id` (R.S2). Nome file:
`wiki/decisions/tavola-rotonda-<session-id>-<YYYY-MM-DD>.md`

Il file DEVE contenere il frontmatter completo (9 campi obbligatori) e le 3 sezioni obbligatorie
inizialmente vuote:
```markdown
---
session_id: <uuid-v4>
topic: <formulazione riformulata al Passo 1, max 120 caratteri>
moderatore: tavola-rotonda-moderatore
partecipanti: [<slug-1>, <slug-2>, ...]
critico: <slug o "rotation">
round_corrente: 0
max_round: <N>
stato: setup
started_at: <ISO-8601 UTC con Z, es. 2026-07-06T14:00:00Z>
---

## Posizioni Fase 1

## Accordi (congelati)

## Punti Aperti
```
Frontmatter incompleto (anche un solo campo mancante) = blackboard malformato → sessione bloccata.

### Passo 7 — Transizione a Fase 1
`stato: fase1`. Inizializza il contatore interno `round_senza_progressi = 0` (variabile del
moderatore, non nel frontmatter; usata dalla Fase 3 per la stall detection, Condizione 4).

**Output Fase 0**: blackboard inizializzato (9 campi + 3 sezioni vuote, `stato: fase1`), topic
riformulato, criteri di successo, lista partecipanti verificata, Critico assegnato, budget
confermato, `round_senza_progressi = 0`.

---

## Fase 1 — Posizioni iniziali indipendenti

> **INVARIANTE DI ISOLAMENTO (R.TR1 — non overridabile)**
> Ogni partecipante riceve SOLO: testo riformulato del problema + criteri di successo + ruolo
> assegnato. NON vede il blackboard. NON vede le posizioni degli altri. Vale finché **tutti**
> non abbiano risposto. Se il moderatore condivide una posizione prima che tutti abbiano
> risposto → sessione riavviata da Fase 0. Nessun recupero parziale.

### Passo 1 — Lancia i partecipanti in isolamento (parallelizzabile)
Lancia ogni partecipante in un sub-task/contesto isolato. Ogni sub-task riceve **esattamente**:
- Il testo riformulato del problema (Fase 0 Passo 1).
- I criteri di successo (Fase 0 Passo 2).
- Il proprio ruolo assegnato — es.:
  - Standard: «Sei il `lead-architect`. Produci una posizione indipendente. Non conosci le posizioni degli altri.»
  - Critico: «Sei il `qa-dev` nel ruolo Critico. Identifica rischi strutturali e debolezze; non convergere per default; esprimi le riserve reali con argomentazione esplicita.»

Contesto **identico** per tutti (stesso topic, stessi criteri). Solo il ruolo varia. Il
moderatore NON passa il blackboard. **WARNING**: non condividere la risposta di nessun
partecipante prima che tutti abbiano risposto (viola R.TR1).

### Passo 2 — Trascrivi le posizioni nel blackboard
Dopo che **tutti** hanno risposto, trascrivi in `## Posizioni Fase 1` una subsection per
partecipante:
```markdown
### <agent-slug> — <ISO8601-timestamp>

<posizione integrale — trascrizione verbatim, nessun riassunto>
```
**Regola verbatim**: nessun riassunto né parafrasi (il riassunto viola R.TR5).
**Immutabilità**: `## Posizioni Fase 1` non viene modificata nei round successivi (audit trail).

### Passo 3 — Transizione a Fase 2
`stato: fase2`, `round_corrente: 1`.

**Output Fase 1**: `## Posizioni Fase 1` con N subsections verbatim; `stato: fase2`, `round_corrente: 1`.

---

## Fase 2 — Confronto

**Input**: blackboard `stato: fase2`, `## Posizioni Fase 1` popolata, `round_corrente ≥ 1`.
Il moderatore rende visibili le posizioni accumulate; ogni agente produce critiche, integrazioni
e rischi. Tutto il traffico passa dalla lavagna (R.TR2); i partecipanti non si scambiano
messaggi direttamente.

> **MANDATO DEL CRITICO (R.TR4 — priorità)**: il Critico è convocato sempre per primo. Produce
> critiche argomentate, rischi strutturali e debolezze — non converge per default. Il moderatore
> NON può saltare o posticipare il turno del Critico.
> **NO MESSAGGI DIRETTI TRA AGENTI (R.TR2 — corollario)**: la lavagna è il canale unico.

### Passo 1 — Condividi le posizioni del blackboard
- **Round 1**: passa `## Posizioni Fase 1` (accordi/punti aperti ancora vuoti).
- **Round N > 1**: passa l'intero blackboard (Posizioni + Accordi congelati + Punti Aperti aggiornati).
Ogni partecipante deve avere la stessa snapshot prima di intervenire nel round corrente.

### Passo 2 — Convoca il Critico (priorità)
Lancialo **prima** degli altri. Riceve il blackboard corrente + mandato esplicito: «identifica
rischi strutturali, debolezze argomentative e disaccordi; non convergere per default; esprimi le
riserve reali con argomentazione esplicita.» Attendi la sua risposta prima del Passo 3.

### Passo 3 — Convoca gli altri partecipanti (in parallelo)
Dopo il Critico. Ogni sub-task riceve: blackboard corrente + intervento del Critico + mandato:
«produci integrazioni, contro-argomenti, rischi aggiuntivi o accordi parziali; porta nuova
evidenza; non ripetere posizioni già espresse senza sviluppo.»

### Passo 4 — Trascrivi gli interventi nel blackboard
Verbatim sotto `## Punti Aperti`, come sotto-voci taggate:
```markdown
- [Round <N> — <agent-slug>] <intervento verbatim>
```
Regole: verbatim (R.TR5); Critico trascritto per primo; nuovi rischi come voci separate; il
moderatore NON decide, non filtra, non commenta, non valuta.

### Passo 5 — `stato: fase3`.

**Output Fase 2**: `## Punti Aperti` arricchito con gli interventi del round (voci `[Round N — <slug>]`); `stato: fase3`.

---

## Fase 3 — Convergenza

**Input**: `stato: fase3`, `## Punti Aperti` popolato, `round_corrente ≥ 1`.
Il moderatore produce una **sintesi progressiva**: estrae accordi (congelati) e aggiorna i punti
aperti, poi valuta le condizioni di stop in ordine di priorità.

### Passo 1 — Analisi del blackboard (sintesi progressiva)
Leggi tutto il blackboard. Identifica:
1. **Nuovi accordi**: punti su cui **tutti** convergono (la maggioranza non basta; il dissenso
   esplicito di un partecipante blocca la congelazione).
2. **Punti ancora aperti**: disaccordo persistente, evidenza insufficiente o discussione ulteriore.

**Aggiorna il contatore stall detection:**
- `|Accordi_nuovi| = 0` nel round → `round_senza_progressi += 1`
- `|Accordi_nuovi| > 0` → `round_senza_progressi = 0` (reset)

### Passo 2 — Aggiorna il blackboard (in ordine)
**2a — Nuovi accordi in `## Accordi (congelati)`**
```markdown
- [Round <N>] <descrizione del punto di accordo>
```
Un punto scritto qui NON si ridiscute nei round successivi. Se nessun nuovo accordo → sezione invariata.
**2b — Aggiorna `## Punti Aperti`**: rimuovi le voci diventate accordi; mantieni il disaccordo
persistente (aggiornando il tag di round); aggiungi eventuali nuovi punti emersi in Fase 2.
**2c — Incrementa `round_corrente`** nel frontmatter di 1.

### Passo 3 — Valuta le condizioni di stop (in ordine di priorità)
La prima condizione soddisfatta ha priorità; non continuare la valutazione dopo la prima hit.

| Priorità | Condizione | Comportamento |
|---|---|---|
| 1 | `## Punti Aperti` è vuoto (∅) | Stop anticipato → `stato: fase4` |
| 2 | `round_corrente ≥ max_round` | Stop forzato → `stato: fase4` |
| 3 | Costo sessione > `budget.max_cost_usd` | Stop forzato → `stato: fase4` + WARNING budget |
| 4 | Stallo: 2 round consecutivi senza nuovi accordi | Stop forzato → `stato: fase4` + WARNING stallo |

**Dettaglio**:
- **Cond. 1**: `## Punti Aperti` vuota dopo il Passo 2b → convergenza completa.
- **Cond. 2**: `round_corrente` (post-incremento) ≥ `max_round` (R.TR8).
- **Cond. 3**: costo stimato > `budget.max_cost_usd` → WARNING + Fase 4.
- **Cond. 4**: `round_senza_progressi ≥ 2`. Quando soddisfatta:
  1. Aggiungi in cima a `## Accordi (congelati)`: `<!-- STALLO rilevato al round <N>: 2 round consecutivi senza nuovi accordi -->`
  2. Emetti il WARNING stallo.
  3. Transizione `stato: fase4`.

**Template WARNING budget (Cond. 3):**
```
WARNING — Stop forzato per budget esaurito (Condizione 3, Fase 3).
Costo stimato sessione: $<X.XX> > budget.max_cost_usd: $<Y.YY>
Round raggiunto: <round_corrente>
Accordi congelati: <N> punti
Punti aperti residui: <M> punti
→ Fase 4 (sintesi forzata con accordi parziali)
```

**Template WARNING stallo (Cond. 4):**
```
WARNING — Stop forzato per stallo rilevato (Condizione 4, Fase 3).
Round consecutivi senza nuovi accordi: 2
Round raggiunto: <round_corrente>
Accordi congelati: <N> punti
Punti aperti residui: <M> punti (dissenso persistente — documentato in Fase 4)
→ Fase 4 (sintesi forzata, divergenza residua registrata)
```

### Passo 4 — Transizione
- **Stop soddisfatto**: `stato: fase4` → procedi a Fase 4.
- **Nessuno stop**: `stato: fase2` → riprendi da **Fase 2** (nuovo round, `round_corrente` incrementato).

**Output Fase 3**: `## Accordi (congelati)` e `## Punti Aperti` aggiornati; `round_corrente`
incrementato; `stato: fase4` (stop) o `stato: fase2` (loop).

---

## Fase 4 — Sintesi

**Input**: `stato: fase4`, `## Accordi (congelati)` con tutti gli accordi, `## Punti Aperti`
residui (vuoto se convergenza completa), `## Posizioni Fase 1` come riferimento ai dissensi iniziali.

> **ROLE SWITCH AGGREGATORE (R.TR5 — corollario)**: nelle Fasi 1-3 il moderatore agisce solo su
> processo/turni/trascrizione. In Fase 4 il role switch è obbligatorio e temporaneo: sintetizza
> il risultato come aggregatore autorevole. Il non-ancoraggio si sospende solo per questa fase.

### Passo 1 — Produci la sintesi aggregatore
Struttura obbligatoria a quattro sezioni — nessuna omettibile, neanche in stop forzato:
```markdown
## Sintesi

### Soluzione
<decisione finale, diretta e non ambigua. Convergenza completa: soluzione che integra gli
accordi congelati. Convergenza parziale (stop forzato): soluzione migliore derivabile dagli
accordi congelati, con nota «sintesi forzata per <motivo>».>

### Motivazione
<ragionamento che ha portato alla scelta — riferimento esplicito agli accordi congelati e, se
pertinente, alle posizioni di Fase 1. Non omettibile né abbreviabile a una riga.>

### Dissensi registrati
<posizioni minoritarie non incorporate — con riferimento al partecipante e al round. Se nessun
dissenso: «Nessun dissenso residuo — convergenza completa». MAI nascondere dissensi reali.>

### Criteri di successo verificati
<spunta esplicita dei criteri definiti in Fase 0 Passo 2:
- [x] <criterio 1> — <nota su come è soddisfatto>
- [✗] <criterio N> — <nota su perché non soddisfatto/non verificabile>
Tutti i criteri devono comparire.>
```

**Caso stallo (Cond. 4)**: se il blackboard contiene `[STALLO]`, aggiungi come prima riga di
`## Sintesi` (prima di `### Soluzione`):
> **⚠️ Sintesi su stallo: la sessione è terminata per mancanza di progressi (≥2 round senza nuovi
> accordi). La soluzione riflette il massimo consenso raggiunto, non un accordo completo.**

**Vincolo verbatim**: `### Soluzione` e `### Motivazione` derivano direttamente dagli accordi
congelati — nessun elemento non emerso nel dibattito. Il moderatore sintetizza; non inventa.

### Passo 2 — Side-effect canonico: registro decisioni (R.TR6 — non opt-in)
Obbligatorio, mai saltabile/posticipabile/opt-in.
**2a — Scrivi `## Sintesi` nel blackboard** come sezione finale, dopo `## Punti Aperti`. Ordine
finale del file: (1) Frontmatter con `stato: terminata`; (2) `## Posizioni Fase 1`; (3) `## Accordi
(congelati)`; (4) `## Punti Aperti`; (5) `## Sintesi`.
**2b — Append a `wiki/log.md`**:
```
[YYYY-MM-DD HH:MM] tavola-rotonda — <topic> (session: <session-id>) → <N> round, <M> accordi, <K> dissensi registrati — files touched: 1
```
Dove `<topic>` = formulazione riformulata; `<session-id>` = campo `session_id`; `<N>` = valore
finale `round_corrente`; `<M>` = voci in `## Accordi (congelati)`; `<K>` = dissensi in
`### Dissensi registrati` (0 se nessuno). Il blackboard è l'input per future `/query`.

### Passo 3 — Aggiorna il frontmatter: `stato: terminata`
Unica operazione che sancisce la chiusura formale. Non può avvenire prima dei Passi 1 e 2 (R.TR6).

**Output Fase 4**: `## Sintesi` scritta con le 4 sottosezioni obbligatorie; entry in `wiki/log.md`;
`stato: terminata`. Sessione formalmente chiusa.

---

## Segnali di allarme durante una sessione

Due meccanismi di sicurezza obbligatori — prevengono runaway (costi illimitati o loop senza
convergenza).

### 1 — Budget guardrail (Fase 0, Passo 5)
**Trigger**: `budget.max_cost_usd` assente/nullo in entrambe le fonti (`--budget=<USD>` e
`tavola_rotonda.budget.max_cost_usd`). **Comportamento**: STOP immediato prima di qualsiasi fase
(R.TR3). **Contesto**: costo tipico 5-15× un task normale. **Messaggio verbatim**:
> **Tavola Rotonda abortita: `budget.max_cost_usd` non definito in `factory.config.yaml`.
> Definire un tetto di costo prima di procedere (costo tipico per sessione: 5-15× un task normale).**

**Recovery**: definire `tavola_rotonda.budget.max_cost_usd` in `factory.config.yaml` oppure
passare `--budget=<USD>` a `/tavola-rotonda`.

### 2 — Stall detection circuit-breaker (Fase 3, Passo 1 + Passo 3)
**Trigger**: `round_senza_progressi ≥ 2` — 2 round consecutivi senza nuovi accordi.
**Contatore** `round_senza_progressi`: init a 0 in Fase 0 (Passo 7), aggiornato in Fase 3 (Passo 1).
**Comportamento**: annotazione `[STALLO]` in cima a `## Accordi (congelati)`; WARNING stallo;
transizione a Fase 4 (R.TR6); Fase 4 aggiunge il WARNING obbligatorio prima di `### Soluzione` e
imposta `stato: terminata`. **Contesto**: lo stallo indica divergenza strutturale — informazione
utile, non un fallimento. **Recovery post-sessione**: riavviare con topic più specifico, criteri
più stringenti o diverso set di partecipanti.

### 3 — Tasso di intervento del Critico (alert di efficacia)
**Metrica**: round consecutivi in cui il Critico non ha aperto/modificato nessuna voce in
`## Punti Aperti`. **Trigger**: ≥2 round consecutivi senza effetto sul blackboard.
**Comportamento obbligatorio** (in ordine di preferenza):
1. **Riassegna il ruolo**: se ci sono altri agenti, assegna il Critico a un agente diverso per il
   round successivo (mode `critico: rotation`).
2. **Rivedi il prompt**: se nessun altro agente, rilancia il Critico con il prompt canonico
   (variante Fase 2/3) aggiungendo: «Gli ultimi <N> round non hanno prodotto nuovi Punti Aperti da
   parte tua. Identifica un punto di disaccordo sostanziale non ancora registrato nel blackboard.»
**Contesto**: un Critico silente (risponde verbalmente ma non genera Punti Aperti) è compiacenza
mascherata. **Relazione con la stall detection**: la stall detection è condizione di stop; il tasso
di intervento è un alert di qualità del Critico che richiede un'azione correttiva del moderatore.

---

## Test del Critico

Scenario di verifica comportamentale per il ruolo Critico (calibrazione prompt / verifica
anti-compiacenza prima dell'impiego in sessione reale).

### Setup
- 3 agenti partecipanti + 1 moderatore.
- Topic: «Architettura del nuovo servizio di gestione utenti: monolite vs servizi separati (team 4 persone, MVP, deployment su singolo server)».
- I 3 agenti producono le posizioni in Fase 1 (isolamento); tutte convergono su: «Usiamo un monolite per semplicità di deploy e riduzione della complessità operativa iniziale.»
- Il moderatore trascrive le 3 posizioni concordanti in `## Posizioni Fase 1`.
- In Fase 2, convoca il Critico con: blackboard corrente + prompt canonico `### Ruolo Critico — Fase 2 / Fase 3` verbatim (da [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc)).

### Criterio di successo
Il Critico:
1. Identifica almeno un'assunzione specifica e fragile (es. «l'assunzione che il team resti a 4 persone non è documentata — con 2 nuovi sviluppatori il monolite diventa collo di bottiglia per i merge»).
2. Formula almeno uno scenario di failure specifico (es. «il monolite fallisce se due team paralleli lavorano su domini distinti: deployment coupled, rollback impossibile senza downtime totale»).
3. Propone almeno una domanda dirompente inedita (es. «qual è il piano di migrazione se il monolite diventa un bottleneck tra 12 mesi? È stato stimato il costo del refactoring?»).
Dopo l'intervento, il moderatore registra ≥1 nuova voce in `## Punti Aperti`; la sessione continua con almeno un Punto Aperto attivo (dibattito spostato in modo misurabile).

### Criterio di fallimento
Risposta del tipo:
> «Condivido in gran parte l'approccio monolitico, con alcune riserve minori su scalabilità futura. Il monolite ha senso a questo stadio del progetto.»
Firma del pattern di compiacenza: disaccordo verbale «minore» ma nessun Punto Aperto concreto, nessuna assunzione fragile, nessuno scenario di failure. `## Punti Aperti` resta vuota.

**Azione al fallimento**: rilancia con il prompt canonico `### Ruolo Critico — Fase 2 / Fase 3` +
«Non hai prodotto Punti Aperti nel round precedente — hai fallito il tuo mandato. Identifica un
punto di disaccordo sostanziale non ancora registrato nel blackboard.» Se il secondo lancio è di
nuovo compiacente, segnala in chat e applica il Segnale 3 (riassegnazione del ruolo).

---

## Cross-link

- ADR normativo blackboard: `design_&_architecture/decisions/ADR-EP039-001-blackboard-format.md`
- Ruolo moderatore: [tavola-rotonda-moderatore](mdc:.cursor/rules/tavola-rotonda-moderatore.mdc)
- Concept [[tavola-rotonda]]: `wiki/concepts/tavola-rotonda.md`
- Concept [[blackboard-architecture]]: `wiki/concepts/blackboard-architecture.md`
- Concept [[multi-agent-debate]]: `wiki/concepts/multi-agent-debate.md`
- PATTERN §28 (Tavola Rotonda)
- Comando di invocazione: `/tavola-rotonda`
- EP-039: `management/kanban/EP-039-tavola-rotonda/EP-039.md`
