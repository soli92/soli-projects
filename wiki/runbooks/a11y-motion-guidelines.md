# Runbook: Accessibility e Motion — Linee guida SoliDS

Fonte primaria: `solids/docs/foundations/accessibility-and-motion.mdx` (repo solids v1.14.1).
Redatto il 2026-06-25 come riferimento consumer per i progetti soli-projects.

---

## Riferimenti normativi

| Argomento | Fonte |
|-----------|--------|
| WCAG 2.2 (contrasto, focus, riduzione movimento, target size) | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| Target size minimo (2.5.8) | [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Animazioni e preferenze utente | [Understanding Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) |
| Material Design 3 — Motion | [M3 Motion overview](https://m3.material.io/styles/motion/overview) |
| Material Design 3 — Typography | [M3 Typography](https://m3.material.io/styles/typography/overview) |
| Apple Human Interface Guidelines — Accessibility | [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |

---

## Cosa fornisce SoliDS out-of-the-box

### Focus visibile
- `:focus-visible`: anello 2px + offset, colore da `--sd-color-border-focus`.
- Allineato alle pratiche Material Design e alla visibilita' focus WCAG.

### Riduzione movimento
- `prefers-reduced-motion: reduce` in `base.css`: disattiva transizioni, animazioni e scroll animato globalmente.
- Linea guida di riferimento: WCAG 2.3.3 (Animation from Interactions).

### Curve e durate (naming MD3-compatibile)
- Token: `--sd-easing-standard`, `--sd-easing-emphasized-decelerate`, ecc.
- Token: `--sd-duration-short`, `--sd-duration-emphasized` (default 350ms), ecc.
- Vedi: [MD3 easing and duration](https://m3.material.io/styles/motion/easing-and-duration).

### Tema e `color-scheme`
- Valorizzato per light/dark e temi scuri, per controlli nativi coerenti.

---

## Utility CSS di riferimento

### `.sd-min-touch-target`
- Applica `min-width` e `min-height` al token `--sd-layout-touch-target-min` (44px).
- Allineato a WCAG 2.5.8 (Target Size Minimum) e alla convenzione 44×44px Apple HIG.
- Usare su: pulsanti piccoli, chip, icone cliccabili, toggle.

```html
<button class="sd-min-touch-target">...</button>
```

### `.sd-link`
- Applica colore token + sottolineatura con offset e spessore minimi.
- Non dipende solo dal colore per distinguere i link (WCAG 1.4.1 Use of Color).

```html
<a class="sd-link" href="...">Testo link</a>
```

### `.sd-transition` / `.sd-transition-fast`
- Durate e easing da token; sempre attive.

### `.sd-transition-emphasized`
- Attiva solo con `prefers-reduced-motion: no-preference`.
- Durata `--sd-duration-emphasized` (350ms), easing `emphasized-decelerate`.
- Usare per animazioni marcate (espansioni, navigazioni) che devono rispettare la preferenza utente.

### `.sd-leading-*`
- Utility interlinea basate su `--sd-font-leading-*` da `base.json`.
- Valori disponibili: `none`, `tight`, `snug`, `normal`, `relaxed`, `loose`.

---

## Token sorgente

| Token | File sorgente | Valore |
|-------|--------------|--------|
| `layout.touch-target-min` | `src/tokens/base.json` | 44px |
| `duration.emphasized` | `src/tokens/base.json` | 350ms |
| `font.leading.*` | `src/tokens/base.json` | vari |
| Font default (Inter, DM Sans, JetBrains Mono) | `src/tokens/semantic.json` | — |
| Override font per tema | `src/tokens/themes/*.json` | — |

---

## Responsabilita' del consumer

- Verificare il **contrasto** reale su combinazioni custom (tool: [APCA](https://readtech.org/ARC/), [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)).
- Fornire **testi alternativi** (`alt`, `aria-label`), **heading logici** e **ordine focus** nei componenti.
- Non disattivare `prefers-reduced-motion` con override aggressivi.
- Aggiungere `@import` Google Fonts (o self-host) per Inter, DM Sans, JetBrains Mono nei progetti consumer — SoliDS li carica solo in Storybook.

---

## Checklist rapida per nuovi componenti

- [ ] Il componente ha uno stato `:focus-visible` visibile.
- [ ] Se cliccabile e piccolo (<44px), usa `.sd-min-touch-target`.
- [ ] Le animazioni usano token `--sd-duration-*` e `--sd-easing-*`.
- [ ] Le animazioni decorative sono dentro `.sd-transition-emphasized` (si disattivano con `prefers-reduced-motion`).
- [ ] Il contrasto testo/sfondo supera WCAG AA (4.5:1 per testo normale, 3:1 per testo grande).
- [ ] I link non dipendono solo dal colore per essere distinguibili (`.sd-link` o underline esplicito).
