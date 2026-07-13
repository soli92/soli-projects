# Skill: Backend Resolver

> Adapter Cursor della skill `backend-resolver` definita in PATTERN.md §26 (candidato, Prototype Generation Layer, EP-035).

Pura funzione di risoluzione: dato l'intent utente e la configurazione `prototyping:` in
`factory.config.yaml`, ritorna il **backend selezionato** insieme al marker esplicito di
esito (`BACKEND_RESOLVED`, `BACKEND_DEGRADED`, oppure `BACKEND_UNAVAILABLE_STRICT`). È la
**single source of truth**: [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md)
(Fase 0) e `/prototype-status` la invocano entrambi, così non esistono due logiche di
risoluzione divergenti.

**Read-only (INV-2)**: non esegue OAuth, non modifica file di config, non fa checkout, non
scrive su filesystem. Solo legge config, frontmatter e lo stato osservabile degli MCP server.
Nessun side-effect.

**Precondizione `prototyping.enabled`**: se `prototyping.enabled: false` (default R.P3), la
skill non viene invocata da nessun protocollo — nessun comportamento visibile. La factory è
identica a flag spento (backward compat totale, INV-5).

## Input

- `intent` — esigenza utente, una stringa tra:
  - `"preview veloce"` (o `"preview veloce condivisibile"`)
  - `"componente production-ready"`
  - `"file di design editabile"`
  - `"auto"` — lascia decidere al resolver senza preferenza espressa
  - oppure il backend esplicitato direttamente (`"html"`, `"react"`, `"figma"`, `"penpot"`)
- `prototyping_config` — blocco `prototyping:` di `factory.config.yaml`:
  - `backend` — `auto | html | react | figma | penpot`
  - `fallback_chain` — lista ordinata di backend, es. `[figma, penpot, react, html]`
  - `degrade_policy` — `notify` (default) | `strict`

## Output

```yaml
selected_backend: <html | react | figma | penpot>
marker: <BACKEND_RESOLVED | BACKEND_DEGRADED | BACKEND_UNAVAILABLE_STRICT>
preferred_backend: <backend>          # backend richiesto da asse1
degraded_from: <backend | null>       # non-null solo se BACKEND_DEGRADED
reason: <stringa motivo>              # es. "MCP figma non autenticato"
asse1_match: <backend | null>         # backend che asse1 avrebbe scelto, null se auto
asse2_probes: {figma: bool, penpot: bool, react: bool, html: true}
```

## Step 1 — Guard `prototyping.enabled`

Verifica che `prototyping.enabled: true`. Se `false`:

- Non procedere. Emetti nessun output.
- Il caller ([prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) / `/prototype-status`) mostra:
  `[backend-resolver] Skipped: prototyping.enabled: false (R.P3 default off)`

## Step 2 — ASSE 1: Intent → backend preferito

Mappa l'intent al backend preferito:

| Intent (stringa utente o alias) | Backend preferito (ASSE 1) |
|---|---|
| `"preview veloce"` / `"preview veloce condivisibile"` | `html` |
| `"componente production-ready"` | `react` |
| `"file di design editabile"` | `figma` (poi `penpot` come alternativa paritaria) |
| `"auto"` | nessuna preferenza — percorre la `fallback_chain` in ordine |
| backend esplicito (`"html"`, `"react"`, `"figma"`, `"penpot"`) | il backend dichiarato |

Se `prototyping_config.backend` è un valore esplicito diverso da `auto`, usa quello come
`preferred_backend` (override sul parametro `intent`). Se `backend: auto`, usa la mappa
applicata all'`intent` ricevuto.

Nota: `"file di design editabile"` preferisce `figma` ma accetta `penpot` come equivalente.
Il resolver controlla `figma` prima se precede `penpot` nella `fallback_chain`; viceversa se
`penpot` è prima.

Output: `preferred_backend` (scelta di ASSE 1, o `null` se `auto` puro senza preferenza).

## Step 3 — ASSE 2: Availability probe a runtime

Per ciascun backend nella `fallback_chain`, esegui il probe read-only (nessun side-effect):

| Backend | Probe | Disponibile se |
|---|---|---|
| `figma` | MCP server "figma" raggiungibile E autenticato (sessione OAuth attiva) | server raggiungibile AND auth valida. **Sessione non-interattiva**: se non autenticato → non disponibile (la skill non può fare OAuth — INV-2). |
| `penpot` | MCP server "penpot" raggiungibile (istanza configurata) | server raggiungibile (auth non richiesta per la sola connettività iniziale). |
| `react` | Invoca `stack-detector` sul primo `code_path` con `layers` che include `fe` | `stack-detector` trova un framework FE (react, vue, svelte, next, ecc.). **Se `code_paths: []` o nessun code_path ha layer `fe`**: `stack-detector` non viene invocato → probe `false` (UNAVAILABLE) → degrado con `BACKEND_DEGRADED: react→html (nessun code_path configurato — stack-detector non invocato)`. |
| `html` | Nessun probe — sempre disponibile | **SEMPRE true** (fallback terminale, INV-1). |

**Nota provider-agnostic**: la logica MCP-specifica (auth Figma, connettività Penpot) è
delegata ai rispettivi `*-mapping` (figma-mapping, penpot-mapping). Il resolver riceve dal
caller solo il risultato booleano del probe; non conosce i dettagli MCP.

Output: `asse2_probes` — mappa `{backend: bool}` per ogni backend nella chain (più `html: true`).

## Step 4 — Risoluzione: percorri la `fallback_chain`

Percorri la `fallback_chain` nell'ordine dichiarato. Per ciascun backend:

1. Controlla `asse2_probes[backend]` — se `false`, salta al successivo.
2. Se `preferred_backend` è valorizzato:
   - Se il backend corrente **coincide** con `preferred_backend` (o è equivalente accettabile
     per l'intent "file di design editabile") → **selezionato**.
   - Se diverso ma disponibile → candidato di degrado (usato solo se il preferito non è disponibile).
3. Se `preferred_backend` è `null` (intent `"auto"` puro) → il primo backend disponibile è il selezionato.

Algoritmo completo:

```
selected = null
preferred_available = false

PER OGNI backend IN fallback_chain:
  SE asse2_probes[backend] == true:
    SE preferred_backend == null:
      selected = backend        # auto puro: primo disponibile
      BREAK
    SE backend == preferred_backend (o equivalente per "file di design editabile"):
      selected = backend
      preferred_available = true
      BREAK
    SE selected == null:
      selected = backend        # primo alternativo disponibile (potenziale degrado) — no BREAK

SE preferred_backend != null E preferred_available == false:
  → degrado (Step 5)
```

`html` è sempre l'ultimo elemento nella `fallback_chain` per contratto (INV-1). Se manca,
viene aggiunto implicitamente in fondo.

## Step 5 — Emissione marker

Ogni percorso emette un marker esplicito — mai fallimento silenzioso (INV-2).

### `BACKEND_RESOLVED`

Il backend preferito (ASSE 1) è disponibile (ASSE 2) — nessun degrado.

```
BACKEND_RESOLVED: <backend>
```

Esempio: `BACKEND_RESOLVED: react`

### `BACKEND_DEGRADED`

Il preferito non è disponibile — il resolver ha scelto il successivo disponibile nella chain.
Applicabile solo se `degrade_policy: notify` (default).

```
BACKEND_DEGRADED: <preferito>→<selezionato> (<motivo>)
```

Esempi:

```
BACKEND_DEGRADED: figma→html (MCP figma non autenticato — sessione OAuth assente)
BACKEND_DEGRADED: react→html (stack-detector non trova framework FE in nessun code_path)
BACKEND_DEGRADED: penpot→react (MCP penpot non raggiungibile — istanza non configurata)
```

Il motivo deve essere leggibile e orientativo. Dopo il marker il resolver procede con il
backend selezionato (non si blocca). Il suggerimento di remediation è opzionale ed è
responsabilità del caller.

### `BACKEND_UNAVAILABLE_STRICT`

Applicabile solo se `degrade_policy: strict` E il preferito non è disponibile. Il resolver
non sceglie un alternativo — STOP con gate umano.

```
BACKEND_UNAVAILABLE_STRICT: <preferito> (<motivo>)
```

Esempio:

```
BACKEND_UNAVAILABLE_STRICT: figma (MCP figma non autenticato — degrade_policy: strict richiede il backend preferito)
```

Il caller interrompe e presenta il gate umano: (a) autenticare il backend e rilanciare,
(b) abbassare `degrade_policy: notify`, (c) cambiare `backend:` nella config.

### Nessun backend disponibile (caso degenere)

Solo se `html` non è nella `fallback_chain` e tutti gli altri sono indisponibili (violazione INV-1):

```
BACKEND_UNAVAILABLE_STRICT: (tutti i backend della fallback_chain non disponibili — html assente dalla chain: violazione INV-1)
```

È un errore di configurazione: il caller lo segnala all'utente.

## Vincoli

- **Read-only (INV-2)**: mai OAuth, mai modificare `factory.config.yaml`, mai `git checkout`.
- **Mai fallimento silenzioso**: ogni percorso emette un marker esplicito.
- **`html` sempre disponibile (INV-1)**: `html: true` in `asse2_probes` sempre; mai probe per `html`; se manca dalla chain, aggiunto implicitamente in fondo.
- **Determinismo**: stesso input (intent + config + stato MCP) → stesso output.
- **Provider-agnostic**: la logica MCP-specifica è nei `*-mapping`; il resolver riceve solo booleani.

## Esempi di risoluzione

### Esempio 1 — preview veloce, html always-on

```
intent: "preview veloce" · backend: auto · fallback_chain: [figma, penpot, react, html] · degrade_policy: notify
→ ASSE 1: preferito = html
→ ASSE 2: html = true (sempre)
→ BACKEND_RESOLVED: html
```

### Esempio 2 — componente production-ready, FE stack presente

```
intent: "componente production-ready" · backend: auto · fallback_chain: [figma, penpot, react, html] · degrade_policy: notify
→ ASSE 1: preferito = react
→ ASSE 2: react = true (stack-detector trova Next.js in code_paths)
→ BACKEND_RESOLVED: react
```

### Esempio 2b — componente production-ready, code_paths vuoto (meta-framework reflexivo)

```
intent: "componente production-ready" · backend: auto · fallback_chain: [react, html] · degrade_policy: notify · code_paths: []
→ ASSE 1: preferito = react
→ ASSE 2: react = false (code_paths vuoto — stack-detector non invocato → UNAVAILABLE); html = true
→ Selezione: html (primo disponibile — degrado)
→ BACKEND_DEGRADED: react→html (nessun code_path configurato — stack-detector non invocato)
```

### Esempio 3 — file di design editabile, Figma MCP non autenticato

```
intent: "file di design editabile" · backend: auto · fallback_chain: [figma, penpot, react, html] · degrade_policy: notify
→ ASSE 1: preferito = figma (primo nella chain tra figma|penpot)
→ ASSE 2: figma = false, penpot = false, react = false, html = true
→ Selezione: html (degrado)
→ BACKEND_DEGRADED: figma→html (MCP figma non autenticato — sessione OAuth assente)
```

### Esempio 4 — backend figma esplicito, strict policy, MCP assente

```
intent: "figma" · backend: figma · fallback_chain: [figma, html] · degrade_policy: strict
→ ASSE 1: preferito = figma (backend esplicito)
→ ASSE 2: figma = false (MCP non autenticato)
→ degrade_policy: strict → STOP
→ BACKEND_UNAVAILABLE_STRICT: figma (MCP figma non autenticato — degrade_policy: strict richiede il backend preferito)
```

### Esempio 5 — auto puro, penpot disponibile

```
intent: "auto" · backend: auto · fallback_chain: [penpot, react, html] · degrade_policy: notify
→ ASSE 1: preferito = null (auto puro)
→ ASSE 2: penpot = true, react = false, html = true
→ Selezione: penpot (primo disponibile nella chain)
→ BACKEND_RESOLVED: penpot
```

## Cross-link

- PATTERN §26 «Prototype Generation Layer» (candidato) — config block `prototyping:`.
- Consumatori: [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 0, `/prototype-status`.
- Analogia strutturale: `branch-resolver` (EP-034, PATTERN §15) — stesso pattern di risoluzione adattiva con marker espliciti; `publisher-protocol` (v2.10) — stesso split provider-agnostic + `*-mapping` provider-specific.
- Dipendenze read-only: `stack-detector` (probe ASSE 2 per `react`), `figma-mapping` + `penpot-mapping` (dettagli probe MCP — passati come booleani dal caller).
- [react-mapping](mdc:.cursor/skills/react-mapping/SKILL.md) (EP-035 US-124) — skill provider-specific per il backend `react`, invocata da [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 2 quando `selected_backend == react`. In un meta-framework `code_paths: []` non viene mai invocata (probe ASSE 2 = `false` → degrado a `html`).
- Invarianti EP-035: INV-1 (`html` sempre disponibile), INV-2 (read-only, mai bloccare su MCP non autenticato), INV-5 (default off R.P3).
- Fonti: `wiki/concepts/backend-adaptive-prototyping.md`, `wiki/concepts/prototype-generation-capability.md`, `wiki/sources/2026-07-01-prototype-generation-capability.md §Resolver`.
