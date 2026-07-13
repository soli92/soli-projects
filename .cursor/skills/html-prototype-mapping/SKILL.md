# Skill: Html Prototype Mapping

> Adapter Cursor della skill `html-prototype-mapping` definita in PATTERN.md §26 (candidato, Prototype Generation Layer, EP-035 US-121).

Mapping **provider-specific per il backend `html` (T0)**: definisce come trasformare uno
spec/intent in un file `index.html` self-contained interattivo multi-stato. Invocata da
[prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 2. Fallback terminale
garantito (INV-1): funziona in qualsiasi ambiente, zero dipendenze esterne. Il protocollo non
conosce i dettagli di questa skill — la invoca con input strutturato e riceve in output il path
del file generato.

Riferimenti: [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) (Fase 0 invoca html come fallback
terminale), [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) (Fase 2 invoca
questa skill), `wiki/concepts/prototype-generation-capability.md §INV-6`.

## Invariante assoluta INV-6 — `single_file: true`

```
INVARIANTE INV-6 (NON OVERRIDABILE):
  backends.html.single_file: true
  → un solo file index.html
  → nessun asset esterno (no CSS separato, no JS separato, no immagini remote)
  → apribile offline in qualsiasi browser standard senza server
```

Non disabilitabile via config. Qualunque tentativo di generare asset esterni (`.css` separato,
`<link href="cdn-remoto">`, `<script src="file-esterno">`, `<img src="http://...">`) viola INV-6 e
va prevenuto in Fase 3 del protocollo.

**Unica eccezione ammessa**: la strategy `tailwind-cdn` usa `<script src="https://cdn.tailwindcss.com">`
inline nel `<head>`. È l'unico URL esterno consentito e solo se `css_strategy: tailwind-cdn`
(default). Il prototipo deve comunque essere leggibile offline tramite fallback CSS inline
`<style>`.

## Input

Ricevuto da [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 2:

```yaml
spec_source: <path>          # path al design-spec.md dell'ui-designer, oppure null
intent_text: <stringa>       # testo libero se spec_source è null
us_id: <US-NNN | null>
tsk_id: <TSK-NNN | null>
slug: <stringa>              # identificatore slug per il path di output
output_path: <path>          # prototyping.output_path di factory.config.yaml
css_strategy: <stringa>      # tailwind-cdn (default) | inline | vanilla
art_director_active: <bool>  # true se design_intelligence.art_director: true (EP-019)
art_director_tokens:         # presente solo se art_director_active: true
  palette: [...]
  font_family: "..."
  spacing_unit: "..."
  border_radius: "..."
  shadow: "..."
states_hint: [...]           # lista di stati UI richiesti dalla spec (opzionale)
```

Se `spec_source` valorizzato: leggi il file ed estrai titolo/scopo, componenti UI, stati
(default/hover/error/empty/…), layout, palette. Se `null`: usa `intent_text` come descrizione di
alto livello e genera stati di default ragionevoli.

## Output

```yaml
output_file: <output_path>/<slug>/index.html
backend: html
marker: HTML_GENERATED                         # sempre emesso a successo
single_file_verified: true                     # confermato da self-contain check
states_covered: [...]
css_strategy_used: <tailwind-cdn|inline|vanilla>
art_director_applied: <bool>
size_bytes: <int>
```

`HTML_GENERATED` è emesso solo dopo la verifica INV-6 (nessun asset esterno). In caso di
violazione durante la generazione, il generatore corregge inline prima di emettere il marker.

## Fase A — Lettura spec/intent

1. Se `spec_source` valorizzato: leggi (read-only INV-3, non modificarlo); estrai titolo
   componente/schermata, descrizione funzionale, lista stati UI, layout (griglia/colonne/aree),
   palette, tipografia, interazioni. Se il file non esiste o è vuoto: procedi con `intent_text`.
2. Se `spec_source` null/mancante: usa `intent_text`; inferisci stati di default `default`,
   `hover`, `error`, `empty`.
3. Combina `states_hint` con gli stati estratti. Deduplica. Ordine canonico: `default` → `hover`
   → `active` → `focus` → `disabled` → `error` → `empty` → `success` → stati custom dello spec.

## Fase B — Selezione strategia CSS

| Valore | Comportamento |
|---|---|
| `tailwind-cdn` (default) | `<script src="https://cdn.tailwindcss.com">` nel `<head>` + classi Tailwind. Aggiungi `<style>` minimo di fallback per uso offline. |
| `inline` | Tutti gli stili in un unico blocco `<style>` nel `<head>`. Nessun CDN. |
| `vanilla` | `<style>` con CSS vanilla (variabili CSS custom) + classi semantiche. Nessuna utility framework. Massima compatibilità. |

Se `art_director_active: true`, applica i token alla strategia:
- `palette` → variabili CSS `--color-primary`, `--color-secondary`, … in `:root`
- `font_family` → `font-family` su `body`
- `spacing_unit` → `--spacing-unit` · `border_radius` → `--radius` · `shadow` → `--shadow`

Se `false`, usa la palette di default del template (vedi §Template di base).

## Fase C — Generazione HTML

Segui il template di base. Principi guida:

1. **Self-contained**: tutto in un file; nessun import esterno eccetto Tailwind CDN se `css_strategy: tailwind-cdn`.
2. **Multi-stato con JS puro**: navigazione tra stati con un piccolo `<script>` inline. Pattern: `data-state` sull'elemento radice + listener su pulsanti/link. Nessun framework JS.
3. **Stati cliccabili**: ogni stato raggiungibile via almeno un trigger (pulsante/link/input). `error` via "Simula errore"; `success` via "Invia" o simile.
4. **Placeholder semantici**: `<!-- PLACEHOLDER: <descrizione> -->` per aree non riempibili con contenuto reale (testo dinamico, icone, immagini reali).
5. **Accessibilità base**: `lang="it"` su `<html>`, `role` ARIA sui componenti interattivi, `aria-label` sui pulsanti senza testo, `aria-live` sulle aree di feedback.
6. **No auto-valutazione (INV-4)**: il file generato non include commenti che valutano la qualità (es. "questo è un buon design"). I commenti sono solo segnaposto tecnici e documentazione.

## Fase D — Self-contain check (pre-emit)

Prima di emettere `HTML_GENERATED`, verifica:

- [ ] Nessun `<link href="http(s)://...">` eccetto Tailwind CDN se `css_strategy: tailwind-cdn`.
- [ ] Nessun `<script src="http(s)://...">` eccetto Tailwind CDN se `css_strategy: tailwind-cdn`.
- [ ] Nessun `<img src="http(s)://...">`. Immagini rappresentate con placeholder SVG inline o `background-color` + testo descrittivo.
- [ ] Nessun `@import url("http://...")` nel CSS.
- [ ] Tutti gli stati in `states_covered` raggiungibili via interazione (almeno un trigger per stato).
- [ ] Il file è un singolo file (nessun file aggiuntivo nella dir eccetto `index.html`).

Se una o più falliscono: correggi inline prima di proseguire. Non emettere `HTML_GENERATED` fino
a che tutte passano.

## Fase E — Scrittura file

Scrivi in `<output_path>/<slug>/index.html`. Crea la directory se non esiste. Path canonico:
`prototyping.output_path` + `/` + `slug` + `/index.html`. Esempio: `output_path: "output/prototypes"`
+ `slug: "login-form"` → `output/prototypes/login-form/index.html`. Emetti l'output YAML (§Output)
al caller.

## Template di base

Struttura minima che ogni prototipo HTML deve rispettare; il generatore la espande e personalizza
con il contenuto della spec.

```html
<!DOCTYPE html>
<html lang="it" data-state="default">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- PLACEHOLDER: Titolo componente/schermata --></title>

  <!-- CSS strategy: tailwind-cdn (default) — sostituire con <style> inline se inline|vanilla -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    /* Variabili CSS — art-director tokens o default */
    :root {
      --color-primary: #3B82F6;     /* blue-500 — override con art_director_tokens.palette */
      --color-secondary: #6B7280;   /* gray-500 */
      --color-error: #EF4444;       /* red-500 */
      --color-success: #10B981;     /* emerald-500 */
      --color-bg: #F9FAFB;          /* gray-50 */
      --color-surface: #FFFFFF;
      --color-text: #111827;        /* gray-900 */
      --color-text-muted: #6B7280;
      --spacing-unit: 0.25rem;      /* 4px base unit */
      --radius: 0.5rem;             /* 8px */
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      --font-family: system-ui, -apple-system, sans-serif;
    }

    /* Fallback offline minimale (se Tailwind CDN non raggiungibile) */
    body { font-family: var(--font-family); background: var(--color-bg); color: var(--color-text); margin: 0; padding: 1rem; }
    .card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
    button { cursor: pointer; border-radius: var(--radius); padding: 0.5rem 1rem; border: none; }
    input, select, textarea { border-radius: var(--radius); border: 1px solid #D1D5DB; padding: 0.5rem; width: 100%; box-sizing: border-box; }

    /* Gestione stati — visibilità condizionata a data-state */
    [data-state] .state-panel { display: none; }
    [data-state="default"] .state-default { display: block; }
    [data-state="hover"] .state-hover { display: block; }
    [data-state="active"] .state-active { display: block; }
    [data-state="error"] .state-error { display: block; }
    [data-state="empty"] .state-empty { display: block; }
    [data-state="success"] .state-success { display: block; }
    /* PLACEHOLDER: regole per stati custom definiti nella spec */

    .state-indicator { position: fixed; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.7); color: #fff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-family: monospace; }
  </style>
</head>
<body class="min-h-screen bg-gray-50">

  <div class="state-indicator" id="state-label">Stato: default</div>

  <!-- Barra navigazione stati — esporre tutti gli stati come pulsanti cliccabili -->
  <nav class="flex gap-2 flex-wrap p-4 bg-white border-b border-gray-200 sticky top-0 z-10" aria-label="Navigazione stati prototipo">
    <span class="text-xs text-gray-500 self-center font-medium mr-2">Stati:</span>
    <button onclick="setState('default')" class="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">Default</button>
    <button onclick="setState('hover')" class="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">Hover</button>
    <button onclick="setState('error')" class="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition">Error</button>
    <button onclick="setState('empty')" class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Empty</button>
    <button onclick="setState('success')" class="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition">Success</button>
    <!-- PLACEHOLDER: pulsanti per stati custom definiti nella spec -->
  </nav>

  <main class="max-w-2xl mx-auto p-6">

    <!-- STATO: default -->
    <div class="state-panel state-default card">
      <h1 class="text-2xl font-semibold text-gray-900 mb-4"><!-- PLACEHOLDER: Titolo --></h1>
      <p class="text-gray-600 mb-6"><!-- PLACEHOLDER: Descrizione o contenuto principale --></p>
      <!-- PLACEHOLDER: form, lista, card, ecc. derivati dalla spec -->
      <div class="flex gap-3">
        <button onclick="setState('active')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          <!-- PLACEHOLDER: Label CTA primaria -->
        </button>
        <button onclick="setState('error')" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Simula errore
        </button>
      </div>
    </div>

    <!-- STATO: hover (es. card in focus, pulsante hovered) -->
    <div class="state-panel state-hover card ring-2 ring-blue-400 ring-offset-2">
      <h2 class="text-lg font-medium text-gray-900 mb-2">Stato hover / focus</h2>
      <p class="text-gray-600 mb-4"><!-- PLACEHOLDER: Descrizione dello stato hover dalla spec --></p>
      <button onclick="setState('default')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
        Torna a Default
      </button>
    </div>

    <!-- STATO: error -->
    <div class="state-panel state-error card border border-red-200 bg-red-50">
      <div class="flex items-start gap-3 mb-4">
        <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h2 class="text-lg font-medium text-red-900"><!-- PLACEHOLDER: Titolo errore dalla spec --></h2>
          <p class="text-red-700 text-sm mt-1"><!-- PLACEHOLDER: Messaggio di errore dalla spec --></p>
        </div>
      </div>
      <button onclick="setState('default')" class="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition">
        Riprova
      </button>
    </div>

    <!-- STATO: empty -->
    <div class="state-panel state-empty card text-center py-12">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
      <h2 class="text-lg font-medium text-gray-900 mb-2"><!-- PLACEHOLDER: Titolo empty state dalla spec --></h2>
      <p class="text-gray-500 text-sm mb-6"><!-- PLACEHOLDER: Descrizione empty state --></p>
      <button onclick="setState('default')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        <!-- PLACEHOLDER: CTA per uscire dall'empty state -->
      </button>
    </div>

    <!-- STATO: success -->
    <div class="state-panel state-success card border border-green-200 bg-green-50 text-center py-8">
      <svg class="w-12 h-12 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
      </svg>
      <h2 class="text-xl font-semibold text-green-900 mb-2"><!-- PLACEHOLDER: Titolo success dalla spec --></h2>
      <p class="text-green-700 text-sm mb-6"><!-- PLACEHOLDER: Messaggio di conferma dalla spec --></p>
      <button onclick="setState('default')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
        <!-- PLACEHOLDER: CTA ritorno o azione successiva -->
      </button>
    </div>

    <!-- PLACEHOLDER: pannelli per stati custom definiti nella spec -->

  </main>

  <script>
    // Gestione stato prototipo — JS puro, nessun framework
    function setState(newState) {
      document.documentElement.setAttribute('data-state', newState);
      document.getElementById('state-label').textContent = 'Stato: ' + newState;
      // PLACEHOLDER: side-effect specifici per stato (es. focus su input)
    }

    // Evidenzia il pulsante dello stato attivo nella nav
    document.querySelectorAll('nav button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('nav button').forEach(function(b) { b.setAttribute('aria-current', 'false'); });
        btn.setAttribute('aria-current', 'page');
      });
    });

    setState('default');
  </script>

</body>
</html>
```

## Gestione stati interattivi — linee guida

**Principio generale**: ogni stato è un pannello `<div class="state-panel state-<nome>">`
nascosto/mostrato via CSS applicato a `[data-state="<nome>"]` su `<html>`. Il cambio avviene via
`setState('<nome>')` in JS puro.

Tipi di stato e trigger canonici:

| Stato | Trigger consigliato | Note |
|---|---|---|
| `default` | Caricamento pagina / reset | Stato iniziale |
| `hover` | Pulsante nav "Hover" o `onmouseenter` | Simula hover interattivo |
| `active` | Click su CTA primaria | Transizione immediata |
| `focus` | Pulsante nav "Focus" o `onfocus` su input | Utile per a11y review |
| `disabled` | Pulsante nav "Disabled" | Form non completato, permessi assenti |
| `loading` | Click su CTA → `setState('loading')` + timeout → `setState('success')` | Simula async |
| `error` | Pulsante "Simula errore" o validazione negativa | Mai bloccare il prototipo |
| `empty` | Pulsante nav "Empty" | Nessun dato caricato |
| `success` | Completamento azione | Conferma operazione |

**Pattern multi-step (wizard/stepper)**: stati `step-1`…`step-N`; ogni pannello ha "Avanti" →
`setState('step-N+1')` e "Indietro" → `setState('step-N-1')`; l'ultimo step ha "Conferma" →
`setState('success')`.

**Pattern form con validazione inline**: `default` (vuoto con placeholder); `filling`
(parzialmente compilato, opzionale); `error` (messaggi inline sotto i campi, classe `text-red-600`
su `<p role="alert">`); `success` (conferma, form nascosto).

**Simulazione async (loading state)**:

```javascript
setState('loading');
setTimeout(function() { setState('success'); }, 1500);
// PLACEHOLDER: adattare il timeout al contesto della spec
```

## Vincoli

- **INV-6 (NON OVERRIDABILE)**: `single_file: true` — un solo file, nessun asset esterno, apribile offline. Verificato in Fase D prima dell'emit.
- **INV-3**: read-only verso `spec_source` — mai modificato.
- **INV-4**: no self-eval — il file generato non include commenti che valutano la qualità.
- **INV-1**: fallback terminale — deve sempre produrre output valido indipendentemente dall'ambiente. Nessun prerequisito esterno.
- **Nessun framework JS**: solo JS vanilla inline. Nessun import di librerie (React, Vue, Alpine.js, …).
- **Path output**: sempre in `<prototyping.output_path>/<slug>/index.html`.
- **Placeholder espliciti**: i commenti `<!-- PLACEHOLDER: ... -->` sono il contratto di estensibilità del template. Il generatore LI SOSTITUISCE con contenuto reale dalla spec; non li lascia nel file finale salvo dove il contenuto è genuinamente indeterminato.

## Cross-link

- [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) — Fase 0: seleziona `html` (BACKEND_RESOLVED o BACKEND_DEGRADED); caller indiretto tramite il protocollo.
- [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) — Fase 2 invoca questa skill con l'input §Input; Fase 3 esegue il self-contain check che complementa la Fase D.
- `wiki/concepts/prototype-generation-capability.md §INV-6` — invariante di self-containment, source of truth normativa.
- `wiki/sources/2026-07-01-prototype-generation-capability.md §Concetto cardine` — descrizione del tier T0 html.
- Analogia strutturale: `github-mapping` (EP-035 riusa il pattern publisher: protocollo provider-agnostic + skill provider-specific).
