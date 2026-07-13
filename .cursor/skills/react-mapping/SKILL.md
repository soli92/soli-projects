# Skill: React Mapping

> Adapter Cursor della skill `react-mapping` definita in PATTERN.md §26 (candidato, Prototype Generation Layer, EP-035 US-124).

Mapping **provider-specific per il backend `react` (T1)**: definisce come generare componenti
React (`.tsx`/`.jsx`), storie Storybook e fixture dati dato uno spec/intent. Invocata da
[prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 2 quando
`selected_backend == react`. Produce artefatti production-ready handoff-ready per
[fe-dev](mdc:.cursor/rules/fe-dev.mdc). Il protocollo non conosce i dettagli — la invoca con input
strutturato e riceve in output i path dei file generati.

Riferimenti: [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) (probe ASSE 2 per `react` usa
`stack-detector`), [html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) (analogia
strutturale — stesso pattern provider-specific), `stack-detector` (v2.12, condivisa con code-reviewer).

## Nota meta-framework — Questo repo (`code_paths: []`)

In un repository con lista `code_paths` vuota (configurazione reflexive meta-framework senza
target FE), il probe ASSE 2 del [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) per `react`
invoca `stack-detector` su tutti i `code_path`: con lista vuota, `stack-detector` non trova nessun
framework FE — il probe ritorna `false`. Di conseguenza il resolver emette sempre:

```
BACKEND_DEGRADED: react→html (stack-detector non trova framework FE in nessun code_path)
```

e degrada al backend `html`. **Questa skill non viene mai eseguita in un repo così configurato.**
È un template per factory derivate che configurano uno o più `code_path` con stack FE
React/Next.js/Remix/ecc.: il resolver la selezionerà automaticamente quando `stack-detector`
troverà un framework FE compatibile.

## Input

Ricevuto da [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) Fase 2 (brief
completo del Step 1.4):

```yaml
spec_source: <path>              # design-spec.md dell'ui-designer, oppure null
intent_text: <stringa>           # testo libero se spec_source è null
us_id: <US-NNN | null>
tsk_id: <TSK-NNN | null>
slug: <stringa>                  # identificatore slug per il path di output
output_path: <path>              # prototyping.output_path di factory.config.yaml
component_lib: <stringa>         # shadcn (default) | radix | mui | custom (da prototyping.backends.react.component_lib)
storybook: <bool>                # true (default) — da prototyping.backends.react.storybook
target_code_path: <path | null>  # path del code_path target se prototyping.backends.react.target; null → output_path
tsx: <bool>                      # true se stack-detector ha rilevato TypeScript nel code_path
art_director_active: <bool>      # true se design_intelligence.art_director: true (EP-019)
art_director_tokens:             # presente solo se art_director_active: true
  palette: [...]
  font_family: "..."
  spacing_unit: "..."
  border_radius: "..."
  shadow: "..."
states_hint: [...]               # lista di stati UI richiesti dalla spec (opzionale)
```

Se `spec_source` valorizzato: estrai nome componente, props attese, stati UI, varianti, layout.
Se `null`: usa `intent_text` e inferisci stati di default ragionevoli.

## Output

```yaml
output_files:
  - <base_path>/<slug>/<ComponentName>.tsx           # o .jsx se tsx: false
  - <base_path>/<slug>/<ComponentName>.stories.tsx   # solo se storybook: true
  - <base_path>/<slug>/<slug>-fixtures.ts            # o .js se tsx: false
backend: react
marker: REACT_GENERATED          # emesso solo dopo verifica invarianti in Fase F
component_lib_used: <stringa>    # valore effettivamente usato
storybook_generated: <bool>
tsx_used: <bool>
states_covered: [...]
target_path_used: <path | null>  # null se output_path
```

`REACT_GENERATED` è emesso solo dopo la verifica di tutte le invarianti (Fase F). In caso di
verifica fallita, la skill segnala il check fallito senza emettere il marker.

## Fase A — Lettura spec/intent

1. Se `spec_source` valorizzato: leggi (read-only INV-3); estrai nome componente/schermata,
   descrizione, lista stati UI, props attese, varianti di rendering, ARIA requirements, note sul
   design system. Se assente/vuoto: procedi con `intent_text`.
2. Se `null`: usa `intent_text`; deriva il nome componente dallo `slug` in PascalCase
   (`login-form` → `LoginForm`); inferisci stati `default`, `loading`, `error`, `empty`.
3. Combina `states_hint` con gli stati dello spec. Deduplica. Ordine canonico: `default` →
   `loading` → `hover` → `active` → `focus` → `disabled` → `error` → `empty` → `success` → custom.
4. Determina `ComponentName` in PascalCase da: titolo dichiarato nello spec → `slug` → `intent_text`.

## Fase B — Selezione component library

Il valore `component_lib` è già risolto dal caller (config + eventuale rilevamento `stack-detector`):

| `component_lib` | Comportamento |
|---|---|
| `shadcn` (default) | Import da `@/components/ui/*`. Classi Tailwind CSS. Commento `// PROTOTYPE: shadcn/ui — installa con: npx shadcn@latest add <component>` per ogni import shadcn. |
| `radix` | Import da `@radix-ui/react-*`. Stili inline o CSS Modules (se rilevati). Commento `// PROTOTYPE: Radix UI — installa con: npm install @radix-ui/react-<component>`. |
| `mui` | Import da `@mui/material`. Theme provider se MUI già configurato. Commento `// PROTOTYPE: MUI — installa con: npm install @mui/material`. |
| valore custom | Usa il valore as-is come namespace di import. Documenta nel log. Commento `// PROTOTYPE: <custom-lib> — verifica il path di import nel code_path target`. |

Se `art_director_active: true`, i token vengono incorporati come CSS custom properties nel blocco
`<style>` del Storybook decorator o come overrides Tailwind theme, secondo il formato:

```typescript
// PROTOTYPE: art-director tokens applicati
// palette: <palette list>
// font: <font_family>
// radius: <border_radius>
// spacing: <spacing_unit>
```

Documenta la scelta effettiva in `component_lib_used`. Se `stack-detector` ha rilevato un DS
diverso da quello configurato, la scelta del detector ha priorità e viene annotata.

## Fase C — Generazione componente React

Genera `<ComponentName>.tsx` (o `.jsx` se `tsx: false`). Principi:

1. **Estensione file**: `.tsx` se `tsx: true`, `.jsx` altrimenti (determinato da `stack-detector`).
2. **Struttura del file** (nell'ordine): commento `// PROTOTYPE: <ComponentName> — generato da react-mapping`; imports React (`useState`/`useEffect` se needed) + component library; tipo `Props` (TS) o JSDoc `@typedef` (se `.jsx`); tipo/enum `State`; componente (funzione con named export); default export.
3. **Prop `state`**: `state?: State` (default `'default'`) che controlla la variante resa; opzionale — `'default'` è il rendering senza prop esplicita.

   ```typescript
   // PROTOTYPE: Props — adattare all'interfaccia reale del componente
   interface Props {
     state?: 'default' | 'loading' | 'error' | 'empty' | 'success'
     // PROTOTYPE: aggiungere le props reali della spec qui
   }
   ```

4. **Rendering condizionale**: `switch` su `state` (o early return se gli stati hanno struttura molto diversa).

   ```typescript
   // PROTOTYPE: rendering condizionale per stato — adattare al layout della spec
   switch (state) {
     case 'loading': return <LoadingState />
     case 'error':   return <ErrorState />
     case 'empty':   return <EmptyState />
     case 'success': return <SuccessState />
     default:        return <DefaultState />
   }
   ```

5. **Placeholder semantici**: `{/* PROTOTYPE: <descrizione> */}` per aree non riempibili (logica di business, dati dinamici, icone, callback reali). Analogo a `<!-- PROTOTYPE: ... -->` del template HTML.
6. **ARIA base**: `role` appropriato; `aria-label` su pulsanti senza testo; `aria-live="polite"` su aree di feedback asincrono; `aria-busy={state === 'loading'}`; `aria-disabled={state === 'disabled'}`.
7. **No auto-valutazione (INV-4)**: nessun commento che valuta la qualità. I `// PROTOTYPE:` sono esclusivamente segnaposto tecnici e istruzioni di adattamento.
8. **No import da URL**: tutti gli import relativi o da package npm (`@/components/ui/button`, `react`). Nessun `https://`.

## Fase D — Generazione storie Storybook

Solo se `storybook: true` (default). Genera `<ComponentName>.stories.tsx` (o `.stories.jsx`).

1. **Meta**: configura `title`, `component`, `autodocs`.

   ```typescript
   // PROTOTYPE: <ComponentName>.stories — generato da react-mapping
   import type { Meta, StoryObj } from '@storybook/react'
   import { ComponentName } from './<ComponentName>'

   const meta = {
     title: 'Prototypes/<ComponentName>',
     component: ComponentName,
     tags: ['autodocs'],
     // PROTOTYPE: aggiungere decorators se necessario (es. ThemeProvider)
   } satisfies Meta<typeof ComponentName>

   export default meta
   type Story = StoryObj<typeof meta>
   ```

2. **Una storia per ogni stato in `states_covered`** — naming canonico:

   | Stato | Nome storia | Args |
   |---|---|---|
   | `default` | `Default` | `{ state: 'default' }` |
   | `loading` | `Loading` | `{ state: 'loading' }` |
   | `error` | `Error` | `{ state: 'error' }` |
   | `empty` | `Empty` | `{ state: 'empty' }` |
   | `success` | `Success` | `{ state: 'success' }` |
   | stato custom | PascalCase del nome | `{ state: '<nome>' }` |

   ```typescript
   export const Default: Story = { args: { state: 'default' } }
   export const Loading: Story = { args: { state: 'loading' } }
   export const Error: Story = { args: { state: 'error' /* PROTOTYPE: dati errore realistici dalla spec */ } }
   // ... una story per ogni stato in states_covered
   ```

3. **Args rappresentativi**: derivati dalla spec (se presente) o dall'`intent_text`. Per stati con dati significativi (`error` con messaggio, `success` con risultato), usa valori rappresentativi — non lorem ipsum se la spec descrive dati reali.
4. **Autodocs**: JSDoc minimale sul componente per abilitare la doc automatica:

   ```typescript
   /**
    * PROTOTYPE: <ComponentName> — <descrizione una riga dalla spec o dall'intent>.
    * @see <spec_source | "intent: <intent_text>">
    */
   ```

## Fase E — Fixture dati

Genera `<slug>-fixtures.ts` (o `.js`) con dati rappresentativi per ogni stato in `states_covered`:

```typescript
// PROTOTYPE: fixtures per <ComponentName> — generato da react-mapping
// Dati rappresentativi per ogni stato UI — adattare alla spec reale

export type FixtureState = 'default' | 'loading' | 'error' | 'empty' | 'success'
// PROTOTYPE: aggiungere gli stati custom dichiarati nella spec

export const fixtures: Record<FixtureState, /* PROTOTYPE: tipo dati della spec */> = {
  default: { /* PROTOTYPE: dati stato default */ },
  loading: { /* PROTOTYPE: dati stato loading (default + flag isLoading) */ },
  error:   { /* PROTOTYPE: es. errorMessage: 'Errore di rete — riprova tra qualche istante' */ },
  empty:   { /* PROTOTYPE: lista vuota, conteggio zero, ecc. */ },
  success: { /* PROTOTYPE: risultato operazione completata */ },
}
```

Regole per i dati fixture:

1. **Dati realistici, non lorem ipsum**: usa i dati concreti se la spec li descrive; altrimenti placeholder semantici (`"Mario Rossi"`, `42`, `"Errore di rete"`).
2. **Nessun dato sensibile o PII**: placeholder semantici, mai dati reali di produzione (no email/telefoni/codici fiscali reali).
3. **Tipizzazione TypeScript** (se `tsx: true`): tipo del record derivato dalla spec; se non determinabile, `Record<FixtureState, unknown>` + commento `// PROTOTYPE: sostituire unknown con il tipo corretto`.
4. **Riuso nelle stories**: le `args` possono importare le fixtures o inline i dati. La skill opta per l'inline nelle storie (default) per semplicità, ma documenta il file fixture come fonte autorevole per test/rendering manuali.

## Fase F — Verifica invarianti + scrittura file

Pre-emit check (prima di scrivere e di emettere `REACT_GENERATED`):

- [ ] **INV-3 (read-only spec)**: nessun `spec_source` modificato/rinominato/cancellato; il componente non importa `spec_source`.
- [ ] **INV-4 (no self-eval)**: nessun commento che valuta la qualità. Solo `// PROTOTYPE:` tecnici/placeholder.
- [ ] **No import da URL**: nessun `import` da `https://`; tutti relativi o da package npm.
- [ ] **Copertura stati**: tutti gli stati in `states_covered` hanno un branch di rendering esplicito (`case` nello `switch` o blocco condizionale).
- [ ] **Copertura storie** (se `storybook: true`): ogni stato ha una `Story` corrispondente.
- [ ] **Copertura fixture**: ogni stato ha una entry nel record `fixtures`.
- [ ] **Path output isolato**: file scritti in `<base_path>/<slug>/` dove `base_path` è `output_path` (default) o `target_code_path` (se valorizzato). La dir `<slug>/` dentro il code_path target è sempre dedicata ai prototipi, non mista al codice di produzione.

Se una o più verifiche falliscono: logga il check fallito; **non emettere** `REACT_GENERATED`; il
caller (Fase 2) gestisce l'errore come generazione fallita e non procede a Fase 3.

Se tutti passano: scrivi i file in `<base_path>/<slug>/` (`<ComponentName>.tsx`/`.jsx`;
`<ComponentName>.stories.tsx`/`.jsx` solo se `storybook: true`; `<slug>-fixtures.ts`/`.js`); emetti
l'output YAML (§Output) e il marker `REACT_GENERATED: <base_path>/<slug>/`.

**Path canonico**: `base_path = output_path` (default) se `target_code_path == null`, altrimenti
`base_path = target_code_path`. Esempio con `output_path: "output/prototypes"`, `slug: "login-form"`,
`ComponentName: LoginForm`: `output/prototypes/login-form/LoginForm.tsx`,
`.../LoginForm.stories.tsx`, `.../login-form-fixtures.ts`.

## Vincoli

- **INV-3 (read-only spec)**: `spec_source` mai modificato/rinominato/cancellato; il componente non lo importa.
- **INV-4 (no self-eval)**: nessun commento valutativo su qualità/design/implementazione. Solo placeholder `// PROTOTYPE:`.
- **INV-5 (default off)**: la skill non viene invocata se `prototyping.enabled: false`. Il guard è nel [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) prima della Fase 0 — la skill non duplica il check.
- **No import da URL**: nessun import da `https://`; solo package npm o path relativi.
- **Path output**: sempre in `<output_path>/<slug>/` (default) o `<target_code_path>/<slug>/`. La dir `<slug>/` è dedicata ai prototipi — mai scrivere direttamente in `src/components/` o radice del code_path.
- **Nessun cross-write**: la skill non conosce la logica di risoluzione backend (vive in [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md)); riceve solo input già risolto dalla Fase 2. Non modifica `factory.config.yaml` né altri file di configurazione.
- **Placeholder espliciti**: i `// PROTOTYPE:` sono il contratto di estensibilità del componente. Vanno sostituiti dal [fe-dev](mdc:.cursor/rules/fe-dev.mdc) (handoff) con logica reale, non eliminati silenziosamente.
- **`storybook: false`**: la Fase D e la parte storie di Fase F sono no-op; l'output non include il file `.stories.*`.

## Cross-link

- [backend-resolver](mdc:.cursor/skills/backend-resolver/SKILL.md) — probe ASSE 2 per `react` usa `stack-detector`. Se non trova framework FE, emette `BACKEND_DEGRADED: react→html` e questa skill non viene invocata.
- [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md) — Fase 2 invoca questa skill col brief (Step 1.4); Fase 3 verifica le condizioni minime sull'output (file/directory esistente, `states_covered` non vuoto).
- [html-prototype-mapping](mdc:.cursor/skills/html-prototype-mapping/SKILL.md) — analogia strutturale (stesse sezioni Input/Output/Fasi A-F/Vincoli/Cross-link, stesso contratto). Il backend `html` è il fallback terminale quando questa skill non è disponibile.
- `stack-detector` (v2.12) — skill condivisa con code-reviewer. Rilevazione framework FE nel code_path target; determina `tsx` e `component_lib` (DS rilevato se diverso da config).
- `wiki/concepts/backend-adaptive-prototyping.md §I quattro tier di backend` — T1 react, business rules, posizionamento nella cascata.
- Analogia strutturale: `github-mapping` (v2.10) — stesso split protocollo agnostico + skill provider-specific (ADR-EP035-003 GO).

**Nota di disambiguazione path**: la tabella in [prototype-generation-protocol](mdc:.cursor/skills/prototype-generation-protocol/SKILL.md)
Fase 2 può citare `react-prototype-mapping` (convenzione alternativa). La skill canonica vive in
`react-mapping` (questo file). In caso di ambiguità, questo file è quello corretto.
