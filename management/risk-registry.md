---
type: risk-registry
status: draft
created: 2026-06-10
updated: 2026-06-10
append_only: true
---

# Risk Registry — append-only

Output persistente delle invocazioni `/premortem` (pattern Premortem, operazione
opzionale PATTERN §3, v2.16). Ogni run di `/premortem` può — **opt-in, mai in
autonomia** (R.P1) — appendere qui una sezione pre-mortem con il proprio Risk
Registry classificato.

**Natura del file**: **append-only**. Le sezioni esistenti non vengono mai
riscritte né cancellate; si aggiungono solo nuove sezioni in coda. Le revisioni di
un rischio si fanno aggiornando la colonna `Decision` in un nuovo append datato,
non sovrascrivendo la riga storica.

**Write-restriction**: scrivono qui **solo** il PM o l'output di `/premortem`
(skill `premortem-protocol`). Mai un dev-agent o il code-reviewer direttamente.

## Schema canonico — tabella a 9 colonne

Ogni sezione pre-mortem contiene un header di conteggio + una tabella con queste 9
colonne, in quest'ordine:

`# | Risk | Category | Tier | Urgency | Evidence | Mitigation | Owner | Decision`

| Colonna | Significato |
|---|---|
| `#` | Indice progressivo del rischio nella sezione |
| `Risk` | Descrizione sintetica del rischio (1 frase) |
| `Category` | Una delle 5 categorie di failure: `Execution \| External \| People \| Technical \| Assumptions` |
| `Tier` | Classificazione: `Tiger \| Paper Tiger \| Elephant` (vedi sotto) |
| `Urgency` | Solo per i Tiger: `LB` (Launch-Blocking) \| `FF` (Fast-Follow) \| `Track`. Altrimenti `—` |
| `Evidence` | Su cosa si fonda il rischio (dato, precedente, assenza di dato) |
| `Mitigation` | Azione concreta di mitigazione (o `nessuna` se Paper Tiger dismissed) |
| `Owner` | Handle responsabile (`@user`, team) o `—` |
| `Decision` | Stato corrente: `open \| accepted \| mitigated \| dismissed` |

### Tier ammessi (tassonomia Tigers / Paper Tigers / Elephants)

- **Tiger** — rischio reale e affrontabile. Sotto-classificato per urgency:
  - `LB` (**Launch-Blocking**) — blocca il rilascio finché non mitigato.
  - `FF` (**Fast-Follow**) — non blocca il lancio ma va affrontato subito dopo.
  - `Track` — reale ma a bassa urgenza, da monitorare.
- **Paper Tiger** — sembra spaventoso ma all'analisi è gestito/improbabile. Spesso
  `Decision: dismissed` con evidenza del perché non preoccupa.
- **Elephant** — il rischio nella stanza che nessuno nomina: spesso `People` o
  `Assumptions`, alto impatto, scomodo da affrontare. Nominarlo è metà del lavoro.

### Stati di `Decision`

- `open` — rischio identificato, nessuna decisione presa.
- `accepted` — rischio accettato consapevolmente (si procede comunque).
- `mitigated` — mitigazione applicata, rischio ridotto.
- `dismissed` — rischio scartato dopo analisi (tipico dei Paper Tiger).

## Sezioni pre-mortem

<!-- Append output di /premortem qui -->
