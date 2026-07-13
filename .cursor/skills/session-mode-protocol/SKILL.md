# Skill: Session Mode Protocol

> Adapter Cursor della skill `session-mode-protocol` (EP-045, modalità di sessione Sblocco vs Apprendimento del tutor).

Skill invocata dal [tutor](mdc:.cursor/rules/tutor.mdc) all'avvio di ogni sessione e all'inizio di ogni risposta per determinare il regime di interazione attivo. La modalità dichiarata dallo studente governa interamente il comportamento del tutor per tutta la sessione, salvo re-dichiarazione esplicita.

Riferimenti: [epistemic-tag-protocol](mdc:.cursor/skills/epistemic-tag-protocol/SKILL.md) (classificazione L1/L2/L3 e principio P5 con marker `[GENERATOR:domanda-richiamo]`/`[VALIDATOR:verifica]`), [scaffolding-protocol](mdc:.cursor/skills/scaffolding-protocol/SKILL.md) (lettura mastery → livello scaffolding), US-161 §AC5, US-162/TSK-357 (`student_model_write`).

---

## Contratto di dichiarazione (avvio sessione)

All'avvio di ogni sessione il tutor emette il prompt di dichiarazione prima di rispondere a qualunque altra richiesta. Questo step non si può saltare.

### Prompt di apertura sessione

```
Dichiara la modalita': Sblocco (risposta diretta) o Apprendimento (loop pratica)?
```

Il tutor attende la risposta esplicita. Se lo studente non risponde o la risposta non è riconducibile a nessuna delle due modalità entro **1 turno**, il tutor imposta la modalità di default e lo comunica:

```
Nessuna modalita' dichiarata — imposto la modalita' di default: Sblocco.
[MODALITA':Sblocco]
```

### Stato di sessione

```
SESSION STATE:
  session_mode: Sblocco | Apprendimento
  current_node_id: str | null  — nodo di competenza corrente della sessione
```

- `session_mode` viene impostato alla prima dichiarazione esplicita o al default dopo 1 turno senza risposta.
- `current_node_id` viene aggiornato dal tutor in modalità Apprendimento al momento della lettura mastery (Step 3 del loop).
- La re-dichiarazione esplicita in corso di sessione azzera `current_node_id` e imposta il nuovo `session_mode`.

### Trigger di dichiarazione riconosciuti

| Intento | Frasi esempio |
|---|---|
| Sblocco | "modalità sblocco", "ho bisogno di aiuto subito", "dammi la risposta", "rispondimi direttamente" |
| Apprendimento | "modalità apprendimento", "voglio imparare", "facciamo una sessione di studio", "allenami" |

Il riconoscimento è semantico (non keyword-exact): il tutor valuta l'intento della frase, non la corrispondenza letterale.

---

## Modalità Sblocco

### Trigger di dichiarazione

Lo studente dichiara esplicitamente la modalità Sblocco (vedi tabella) oppure non risponde al prompt di apertura entro 1 turno.

### Comportamento

- Il tutor risponde **direttamente** alla query, senza domande di richiamo intermedie.
- Il tag epistemico (L1/L2/L3) viene applicato normalmente via [epistemic-tag-protocol](mdc:.cursor/skills/epistemic-tag-protocol/SKILL.md).
- Scaffolding semplificato: nessuna domanda di richiamo pre-risposta; risposta completa dal primo turno.
- Le Fasi Generator e Validator (P5) **non vengono invocate**: il loop di retrieval practice è riservato alla modalità Apprendimento.

### Aggiornamento Student Model

In modalità Sblocco lo Student Model **non viene aggiornato** dal lato pratica. La sessione Sblocco non produce evidenza di recall verificata, quindi non modifica i campi `mastery` o `last_interaction` del nodo.

### Marker output

Il tutor appone il marker **in apertura della prima risposta** della sessione, su riga propria:
```
[MODALITA':Sblocco]
```
Non viene ripetuto ad ogni risposta successiva nella stessa sessione.

---

## Modalità Apprendimento

### Trigger di dichiarazione

Lo studente dichiara esplicitamente la modalità Apprendimento (vedi tabella).

### Marker output

Il tutor appone il marker **in apertura della prima risposta** della sessione, su riga propria:
```
[MODALITA':Apprendimento]
```
Non viene ripetuto ad ogni risposta successiva nella stessa sessione.

### Loop di interazione (7 step)

In modalità Apprendimento il tutor segue questo loop per ogni query di merito:

```
Step 1 — Ricezione query
  Il tutor riceve la domanda dello studente.

Step 2 — Classificazione epistemica
  Il tutor invoca epistemic-tag-protocol per classificare la query
  in L1 (eseguibile), L2 (documentato) o L3 (giudizio-team).
  Se la classificazione produce REJECT (INV-T1 o INV-T2), il loop
  si interrompe qui e il tutor emette il messaggio REJECT.

Step 3 — Lettura mastery
  Il tutor invoca scaffolding-protocol per leggere il campo mastery
  del nodo corrente (current_node_id) dallo Student Model.
  Risultato: scaffold_level in {worked_example, guided_practice, autonomous}.
  Aggiorna current_node_id se risolto per la prima volta.

Step 4 — [GENERATOR]: domanda di richiamo
  Il tutor genera una domanda di richiamo calibrata al scaffold_level
  determinato al Step 3.
  Input: query originale + scaffold_level.
  Output: domanda di richiamo con marker [GENERATOR:domanda-richiamo].
  Il tutor si ferma qui e attende la risposta dello studente.

Step 5 — Attesa risposta studente
  Il turno passa allo studente. Il tutor non genera contenuto in questo step.

Step 6 — [VALIDATOR]: verifica risposta
  Il tutor riceve la risposta dello studente e la valuta in una
  invocazione separata (tool call distinta da Step 4).
  Output: feedback con marker [VALIDATOR:verifica].

Step 7 — Risposta completa + aggiornamento Student Model
  Il tutor emette la risposta completa con tag epistemico (L1/L2/L3).
  Invoca student_model_write per aggiornare mastery.
```

### Diagramma del loop

```
Query studente
      │
      ▼
[2] Classifica epistemica (epistemic-tag-protocol)
      │
      ├─ REJECT ──▶ emetti REJECT, fine loop
      │
      ▼
[3] Lettura mastery (scaffolding-protocol) → scaffold_level
      │
      ▼
[4] GENERATOR: genera domanda di richiamo      ← Tool call 1
      │  [GENERATOR:domanda-richiamo]
      ▼
[5] Attesa risposta studente
      │
      ▼
[6] VALIDATOR: valuta risposta studente        ← Tool call 2 (separata)
      │  [VALIDATOR:verifica]
      ▼
[7] Risposta completa + tag epistemico + student_model_write
```

---

## Separazione Generator/Validator (P5)

Il principio P5 (US-161 §Business Rules) è strutturale: le due fasi non possono essere eseguite nella stessa tool call. Il contratto è applicato indipendentemente dalla richiesta dello studente — non è opt-in per il tutor.

Per la specifica completa dei marker, il contratto strutturale della tabella proprietà e gli esempi verbatim, vedi [epistemic-tag-protocol](mdc:.cursor/skills/epistemic-tag-protocol/SKILL.md) §Separazione Generator/Validator (P5).

### Fase Generator (Step 4 del loop)

- **Input**: query originale + `scaffold_level` (da Step 3).
- **Output**: domanda di richiamo calibrata al livello.
- **Marker obbligatorio**: `[GENERATOR:domanda-richiamo]`.
- Il tutor NON ha ancora formulato la risposta completa in questa fase.
- Dopo l'emissione il tutor si ferma e attende la risposta dello studente. Non genera la risposta corretta attesa nella stessa invocazione.

```
Descrivi con parole tue cosa distingue lo scaffold_level worked_example
dallo scaffold_level autonomous.

[GENERATOR:domanda-richiamo]
```

### Fase Validator (Step 6 del loop)

- **Input**: risposta dello studente (obbligatorio).
- **Invocazione**: tool call separata e distinta da quella del Generator.
- Il contesto di valutazione non include l'output della Fase Generator.
- **Marker obbligatorio**: `[VALIDATOR:verifica]`.

```
La risposta e' corretta nella distinzione principale: worked_example fornisce
la soluzione completa come modello, autonomous richiede che lo studente risolva
senza guida. Il dettaglio sul livello intermedio (guided_practice) e' assente
ma non richiesto dalla domanda.

[VALIDATOR:verifica]
```

### Violazione di P5

Una risposta che include sia `[GENERATOR:domanda-richiamo]` che `[VALIDATOR:verifica]` nella stessa invocazione è una **violazione di P5**. Il test TSK-362 verifica questo invariante.

---

## Aggiornamento Student Model

**Condizione**: solo in modalità Apprendimento, dopo la Fase Validator (Step 6 del loop) e prima della risposta completa (Step 7).

**Azione**: il tutor invoca `student_model_write` con:
- `node_id`: il `current_node_id` della sessione corrente.
- `outcome`: esito della Fase Validator (`correct` | `partial` | `incorrect`).
- `scaffold_level`: il livello usato in questa iterazione del loop.

La specifica dell'interfaccia `student_model_write` e il formato del payload sono definiti in US-162/TSK-357. Questa skill non implementa la persistenza: la delega interamente alla skill/tool dello Student Model.

**In modalità Sblocco**: `student_model_write` NON viene invocato (nessun aggiornamento mastery).

---

## Vincoli

1. **Prompt obbligatorio**: il contratto di dichiarazione NON può essere saltato. Ogni sessione inizia con il prompt di apertura prima di qualunque risposta di merito.
2. **Default Sblocco**: se lo studente non dichiara la modalità entro 1 turno, il tutor imposta Sblocco e lo comunica esplicitamente (marker `[MODALITA':Sblocco]`).
3. **P5 strutturale**: in modalità Apprendimento, Generator e Validator sono sempre invocazioni separate. Non è ammessa l'esecuzione combinata.
4. **Student Model solo in Apprendimento**: `student_model_write` viene invocato unicamente dopo una Fase Validator completata in modalità Apprendimento.
5. **Marker di modalità in apertura**: `[MODALITA':Sblocco]` o `[MODALITA':Apprendimento]` appaiono solo alla prima risposta della sessione, non ad ogni turno successivo.
6. **Re-dichiarazione esplicita**: lo studente può cambiare modalità in corso di sessione con una nuova dichiarazione. Il tutor aggiorna `session_mode` e emette il nuovo marker, azzerando `current_node_id`.

---

[^src: management/kanban/EP-045-capability-formativa/US-161-tutor-modello-epistemico/TSK-353-session-mode-protocol.md §Technical Specs]
[^src: management/kanban/EP-045-capability-formativa/US-161-tutor-modello-epistemico/US-161.md §Business Rules §AC5]
[^src: [epistemic-tag-protocol](mdc:.cursor/skills/epistemic-tag-protocol/SKILL.md) §Separazione Generator/Validator (P5)]
