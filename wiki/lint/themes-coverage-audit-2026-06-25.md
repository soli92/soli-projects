---
type: audit-report
date: 2026-06-25
subject: "SoliDS themes coverage per consumer"
---
# Audit coverage temi SoliDS — 2026-06-25

## Temi disponibili in SoliDS

Il design system `@soli92/solids` espone i seguenti temi selezionabili via `data-theme` su `<html>`:

**Temi generici:** `light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk`

**Temi character-based:** `ichigo`, `vegeta`, `zoro`, `captain-america`, `sasuke`, `inuyasha`

---

## Metodologia

Per ogni consumer sono stati analizzati:
- `app/layout.tsx` / `pages/_app.tsx` / `index.html` per il valore iniziale di `data-theme`
- Script di bootstrap tema inline (inline `<script>` per hydraton-safe init)
- Provider temi (`ThemeProvider`, `next-themes`, hook personalizzati)
- Presenza di classi `dark:` Tailwind o media query `prefers-color-scheme`
- Temi nominati supportati dall'UI

---

## Coverage per consumer

### soli-agent

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | `"dark"` |
| Tema iniziale (dopo bootstrap JS) | Letto da `localStorage("soli_theme")`, fallback `"dark"` |
| Temi supportati dall'UI | `light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk`, `ichigo`, `vegeta`, `zoro`, `captain-america`, `sasuke`, `inuyasha` (tutti i 12) |
| Meccanismo | Script inline `<script dangerouslySetInnerHTML>` in layout.tsx |
| Supporto light/dark Tailwind | ❌ no classi `dark:` |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ✅ ThemeSelector presente |

**Note:** Consumer con copertura temi più completa. Supporta tutti i 12 temi SoliDS inclusi i character-based.

---

### soli-dome

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | `"cyberpunk"` |
| Tema iniziale (dopo bootstrap JS) | Letto da `localStorage("soli-dome-theme")` / `"theme"` / `"data-theme"`, fallback `"cyberpunk"` |
| Temi supportati dall'UI | `light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk`, `ichigo`, `vegeta`, `zoro`, `captain-america`, `sasuke`, `inuyasha` (tutti i 12) |
| Meccanismo | Script inline `<script dangerouslySetInnerHTML>` in layout.tsx; 3 chiavi localStorage lette in cascade |
| Supporto light/dark Tailwind | ❌ no classi `dark:` |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ✅ ThemeSelector presente |

**Note:** Fallback su `"cyberpunk"` (identità brand di soli-dome). Cascade multi-chiave localStorage per retrocompatibilità.

---

### soli-prof

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | ❌ nessun `data-theme` impostato — assente dall'attributo HTML |
| Tema iniziale | Nessuno (il browser riceve HTML senza `data-theme`) |
| Temi supportati dall'UI | ❌ nessun meccanismo di switching temi trovato |
| Meccanismo | ❌ nessun script di bootstrap tema |
| Supporto light/dark Tailwind | ❌ no classi `dark:` rilevate |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ❌ assente |

**Note:** `soli-prof` importa `@soli92/solids/css/index.css` e il font stack completo, ma non imposta nessun `data-theme`. L'app opera con i token CSS del tema di default SoliDS (presumibilmente `light` o il token non-tematizzato). **Gap: nessun supporto temi.**

---

### soli-boy

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | `"90s-party"` (in `index.html`) |
| Tema iniziale | `"90s-party"` come default canonico (decisione brand TSK-044) |
| Temi supportati dall'UI | `90s-party`, `dark`, `cyberpunk` (subset di 3 temi) |
| Meccanismo | Hook `useTheme` (`src/components/ThemeSelector/useTheme.ts`); persistenza via `ThemePort` / IndexedDB |
| Supporto light/dark Tailwind | ❌ no classi `dark:` — usa `[data-theme="dark"]` in CSS |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ✅ `ThemeSelector` presente in `Settings` |

**Note:** Subset deliberato di 3 temi (90s-party, dark, cyberpunk). Override locali in `styles/solids-theme.css` e `styles/app-extra.css` per `[data-theme="dark"]`, `[data-theme="cyberpunk"]`, `[data-theme="90s-party"]`. I temi character-based e `fantasy`/`steampunk`/`light` non sono esposti all'utente.

---

### soli-dm-fe

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | ❌ nessun `data-theme` sull'elemento HTML del layout |
| Tema iniziale (dopo bootstrap JS) | `"fantasy"` (via `next-themes` `defaultTheme`) |
| Temi supportati dall'UI | `light`, `dark`, `fantasy`, `cyberpunk`, `90s-party`, `steampunk`, `ichigo`, `vegeta`, `zoro`, `captain-america`, `sasuke`, `inuyasha` (tutti i 12) |
| Meccanismo | `next-themes` `ThemeProvider` in `app/providers.tsx`; attributo `data-theme`; `storageKey: "soli-dm-theme"` |
| Supporto light/dark Tailwind | ❌ no classi `dark:` rilevate |
| `prefers-color-scheme` | ❌ `enableSystem: false` — sistema OS ignorato |
| Selezione UI da utente | Da verificare — `next-themes` installato, UI di switching non confermata |

**Note:** Unico consumer a usare `next-themes`. Il layout HTML non ha `data-theme` iniziale (solo `suppressHydrationWarning`) — potenziale FOUC prima che `next-themes` si inizializzi. `enableSystem: false` esclude esplicitamente `prefers-color-scheme`.

---

### casa-mia-fe

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | `"light"` |
| Tema iniziale (dopo bootstrap JS) | Letto da `localStorage(THEME_STORAGE_KEY)` se `"dark"` o `"light"`, altrimenti `prefers-color-scheme` |
| Temi supportati dall'UI | `light`, `dark` (subset di 2 temi) |
| Meccanismo | Custom `ThemeProvider` + hook `useTheme` (`components/ThemeProvider.jsx`); script bootstrap in `layout.js` |
| Supporto light/dark Tailwind | ✅ classi `dark:` usate in `app/dashboard/page.js` e altri componenti |
| `prefers-color-scheme` | ✅ rilevato — usato come fallback se nessuna preferenza salvata |
| Selezione UI da utente | ✅ toggle light/dark |

**Note:** Unico consumer che usa attivamente `prefers-color-scheme` come fallback. Il `ThemeProvider` custom accetta solo `"light"` o `"dark"` — temi nominati (fantasy, cyberpunk, ecc.) non supportati. Mix di pattern: sia `data-theme` che classi `dark:` Tailwind presenti in codebase.

---

### bachelor-party-claudiano

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | `"90s-party"` (hardcoded in `index.html`) |
| Tema iniziale | `"90s-party"` fisso — nessun bootstrap dinamico |
| Temi supportati dall'UI | `"90s-party"` (tema singolo fisso) |
| Meccanismo | Attributo HTML statico — nessun switching |
| Supporto light/dark Tailwind | ❌ non rilevato |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ❌ assente — tema fisso per natura dell'app (evento una-tantum) |

**Note:** App event-driven monouso. Tema `90s-party` fisso by design — non previsto switching utente.

---

### soli-projects

| Aspetto | Valore |
|---|---|
| `data-theme` default su `<html>` | ❌ nessun `data-theme` sull'elemento HTML |
| Tema iniziale | Nessuno — opera con token CSS SoliDS di default |
| Temi supportati dall'UI | ❌ nessun meccanismo di switching |
| Meccanismo | ❌ nessun script di bootstrap tema |
| Supporto light/dark Tailwind | ❌ no classi `dark:` rilevate |
| `prefers-color-scheme` | ❌ non rilevato |
| Selezione UI da utente | ❌ assente |

**Note:** `soli-projects` importa CSS SoliDS ma non imposta `data-theme`. App interna/portfolio — switching temi non prioritario allo stato attuale.

---

## Tabella riepilogativa

| Consumer | `data-theme` default | Temi supportati | Switching utente | `prefers-color-scheme` | Note |
|---|---|---|---|---|---|
| soli-agent | `dark` | tutti i 12 | ✅ | ❌ | Copertura completa |
| soli-dome | `cyberpunk` | tutti i 12 | ✅ | ❌ | Cascade localStorage 3 chiavi |
| soli-prof | ❌ nessuno | ❌ nessuno | ❌ | ❌ | **Gap: nessun tema impostato** |
| soli-boy | `90s-party` | `90s-party`, `dark`, `cyberpunk` | ✅ | ❌ | Subset deliberato 3 temi |
| soli-dm-fe | ❌ (next-themes: `fantasy`) | tutti i 12 | da verificare | ❌ (`enableSystem: false`) | FOUC risk; usa next-themes |
| casa-mia-fe | `light` | `light`, `dark` | ✅ | ✅ | Unico con prefers-color-scheme |
| bachelor-party-claudiano | `90s-party` | `90s-party` (fisso) | ❌ | ❌ | Tema fisso by design |
| soli-projects | ❌ nessuno | ❌ nessuno | ❌ | ❌ | App interna — non prioritario |

---

## Gap e raccomandazioni

1. **soli-prof — nessun `data-theme`:** aggiungere almeno `data-theme="light"` sul `<html>` e valutare script bootstrap per persistenza utente.
2. **soli-projects — nessun `data-theme`:** stessa situazione di soli-prof. Considerare impostare un default.
3. **soli-dm-fe — FOUC risk:** il layout HTML non ha `data-theme` iniziale prima che `next-themes` si inizializzi. Aggiungere script bootstrap inline o `data-theme="fantasy"` come attributo HTML.
4. **casa-mia-fe — temi nominati non supportati:** `ThemeProvider` custom accetta solo `light`/`dark`. Se si vuole allineare alla palette completa SoliDS, aggiornare il provider.
5. **Allineamento meccanismo:** 4 pattern diversi per il bootstrap tema (script inline, next-themes, hook custom, attributo statico) — nessuna standardizzazione cross-progetto.
