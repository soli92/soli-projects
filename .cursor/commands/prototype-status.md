# /prototype-status — snapshot read-only del Prototype Generation Layer (EP-035)

Mostra uno **snapshot read-only** del Prototype Generation Layer (EP-035, PATTERN §26 candidato):
legge il blocco `prototyping:` di `factory.config.yaml`, invoca
[backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) in modalità dry-run (nessun prototipo generato,
nessun probe distruttivo) e stampa:

- backend configurato e `fallback_chain` attiva
- per ciascun tier della chain: stato di disponibilità (AVAILABLE / UNAVAILABLE) e motivo
- backend che verrebbe selezionato per intent `"auto"` nel contesto corrente
- marker `BACKEND_RESOLVED` o `BACKEND_DEGRADED` (o `BACKEND_UNAVAILABLE_STRICT` se `degrade_policy: strict` e il preferito non è disponibile)

**Read-only assoluto**: non esegue OAuth, non modifica `factory.config.yaml`, non scrive su
filesystem, non genera artefatti. Analogo funzionale di `/vcs-status` (EP-034) applicato al dominio
di prototipazione.

Funziona **anche a `prototyping.enabled: false`** (default R.P3): emette la nota che il layer è
spento con le istruzioni per abilitarlo. Esecuzione esplicita = volontà esplicita, come `/vcs-status`.

## Utilizzo

```
/prototype-status
```

Nessun argomento obbligatorio. Senza argomenti per design: è uno snapshot globale del layer, non
filtra per backend specifico.

## Comportamento

### Fase 0 — Leggi `factory.config.yaml`

Leggi il blocco `prototyping:`. Campi attesi:

```yaml
prototyping:
  enabled: true | false          # master switch (R.P3 default false)
  backend: auto | html | react | figma | penpot
  fallback_chain: [...]          # lista ordinata backend
  degrade_policy: notify | strict
```

Se il blocco è assente o `enabled: false`, vai direttamente alla sezione **Output a layer spento**.

### Fase 1 — Invoca `backend-resolver` in modalità dry-run

Invoca [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) con:
- `intent: "auto"` — il caso più informativo per lo snapshot (mostra quale backend verrebbe scelto senza preferenza espressa, percorrendo la `fallback_chain` in ordine)
- `prototyping_config` — il blocco `prototyping:` letto in Fase 0

Il resolver esegue:
- **ASSE 1**: nessuna preferenza (`auto`) — `preferred_backend: null`
- **ASSE 2**: probe di disponibilità read-only per ciascun backend nella `fallback_chain` (figma: MCP raggiungibile + autenticato; penpot: MCP raggiungibile; react: `stack-detector` su code_paths; html: sempre true — invariante INV-1)

Il resolver non genera prototipi, non esegue OAuth, non fa checkout (INV-2 read-only).

### Fase 2 — Produci output

Formatta il risultato come tabella + summary marker.

## Output a layer abilitato (`prototyping.enabled: true`)

```
PROTOTYPE STATUS (EP-035)
=========================
Layer:           ENABLED
Backend config:  auto
Degrade policy:  notify
Fallback chain:  [figma, penpot, react, html]

DISPONIBILITA' BACKEND (ASSE 2)
backend   tier  stato        motivo
figma     T2    UNAVAILABLE  MCP figma non autenticato — sessione OAuth assente
penpot    T3    UNAVAILABLE  MCP penpot non raggiungibile — istanza non configurata
react     T1    UNAVAILABLE  stack-detector non trova framework FE in nessun code_path
html      T0    AVAILABLE    fallback terminale (sempre disponibile, INV-1)

RISOLUZIONE (intent: auto)
BACKEND_DEGRADED: figma→html (MCP figma non autenticato — sessione OAuth assente)
Backend selezionato: html

REMEDIATION
  Per abilitare figma: autentica il connettore Figma MCP (OAuth)
  Per abilitare penpot: configura e avvia un'istanza Penpot + MCP server
  Per abilitare react:  aggiungi un code_path con framework FE (Next.js, React, ecc.)
```

Se il preferito è disponibile (nessun degrado), il marker è `BACKEND_RESOLVED`:

```
RISOLUZIONE (intent: auto)
BACKEND_RESOLVED: react
Backend selezionato: react
```

Se `degrade_policy: strict` e il preferito non è disponibile:

```
RISOLUZIONE (intent: auto)
BACKEND_UNAVAILABLE_STRICT: figma (MCP figma non autenticato — degrade_policy: strict richiede il backend preferito)
Azione richiesta: autentica il connettore Figma MCP oppure abbassa degrade_policy a notify
```

## Output a layer spento (`prototyping.enabled: false` o blocco assente)

```
PROTOTYPE STATUS (EP-035)
=========================
Layer:    DISABLED  (prototyping.enabled: false — default R.P3)
Nessun backend disponibile — il layer è spento.

Per abilitare il Prototype Generation Layer:
  1. Aggiungi il blocco a factory.config.yaml:
       prototyping:
         enabled: true
         backend: auto
         fallback_chain: [figma, penpot, react, html]
         degrade_policy: notify
  2. Esegui /prototype-status per verificare la disponibilità dei backend.
  3. Esegui /prototype <descrizione> per generare il primo prototipo.
```

Il comportamento a `enabled: false` non produce side-effect nel normale flusso factory (INV-5,
backward compat totale).

## Note

- La colonna `tier` segue la definizione in `wiki/concepts/backend-adaptive-prototyping.md`: T0=html, T1=react, T2=figma, T3=penpot.
- Il probe ASSE 2 per `react` usa `stack-detector` (skill v2.12) in modalità read-only.
- I probe MCP (`figma`, `penpot`) non eseguono OAuth — se il server non è autenticato, lo stato è UNAVAILABLE senza blocco (INV-2).
- `html` è sempre AVAILABLE — invariante INV-1 del layer EP-035.
- Cross-link: skill [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md), `stack-detector`, PATTERN §26 «Prototype Generation Layer» (candidato); analogia strutturale con `/vcs-status` (EP-034) e `/compression show` (v2.14).
