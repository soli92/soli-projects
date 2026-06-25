---
type: audit-report
date: 2026-06-25
subject: "Brand assets cross-project audit"
---
# Audit brand assets cross-progetto — 2026-06-25

## Asset ufficiali SoliDS

Il repository `solids` espone brand assets in `dist/brand-assets/` (path nel pacchetto npm: `@soli92/solids/brand-assets/`), strutturati in tre sottocartelle:

### `dist/brand-assets/soli-category-icons/`
Asset ottimizzati per icone app/PWA (favicon, apple-touch, app-icon, logo, symbol):
- `soli-icon-app-icon.png` / `.svg`
- `soli-icon-apple-touch.png` / `.svg`
- `soli-icon-favicon.png` / `.svg`
- `soli-icon-logo.png` / `.svg`
- `soli-icon-symbol.png` / `.svg`
- `soli-storybook.webmanifest`

### `dist/brand-assets/soli-icons/`
Set completo icone SoliDS in tutti i formati (SVG, PNG, JPG, WebP) per varianti `1x1`, `4x3`, `symbol-only`, `with-text`, `gold`, `mono`.

### `dist/brand-assets/workspace-icons/` e `workspace-icons-normalized/`
Icone workspace per tool di sviluppo.

---

## Verifica per consumer

### soli-agent

| Asset | Fonte | Metodo |
|---|---|---|
| favicon | `public/favicon.svg` — SVG custom locale | ❌ copia locale custom (non da `@soli92/solids`) |
| soli-icon-favicon.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-favicon.png` | ✅ import npm ES in `layout.tsx` |
| soli-icon-apple-touch.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-apple-touch.png` | ✅ import npm ES in `layout.tsx` |

**Note:** `public/favicon.svg` è un file SVG custom locale con gradiente blu-cyan SoliDS, non identico a `soli-icon-favicon.svg` dal registry. Gli asset per `<head>` (icon, apple) vengono importati direttamente dal pacchetto npm — pattern corretto. La `favicon.svg` pubblica è un asset divergente (potenzialmente intenzionale per branding app-specifico).

---

### soli-dome

| Asset | Fonte | Metodo |
|---|---|---|
| soli-icon-app-icon.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-app-icon.png` | ✅ import npm ES in `layout.tsx` |
| soli-icon-apple-touch.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-apple-touch.png` | ✅ import npm ES in `layout.tsx` |
| soli-icon-favicon.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-favicon.png` | ✅ import npm ES in `layout.tsx` |
| soli-icon-symbol.png | `@soli92/solids/brand-assets/soli-category-icons/soli-icon-symbol.png` | ✅ import npm ES in `SoliLogoLoader.tsx` |
| soli-icon-4x3-with-text-gold.png | `@soli92/solids/brand-assets/soli-icons/soli-icon-4x3-with-text-gold.png` | ✅ import npm ES in `SoliBrandLogo.tsx` |
| soli-icon-4x3-with-text-mono.png | `@soli92/solids/brand-assets/soli-icons/soli-icon-4x3-with-text-mono.png` | ✅ import npm ES in `SoliBrandLogo.tsx` |
| `public/icons/icon-192x192.svg` | File SVG locale custom | ⚠️ copia locale custom (non da `@soli92/solids`) |
| `public/icons/icon-512x512.svg` | File SVG locale custom | ⚠️ copia locale custom |
| `public/icons/soli-boy.svg` | File SVG locale custom | ℹ️ icona workspace soli-boy locale |

**Note:** Pattern più allineato — tutti gli asset usati nel layout vengono importati da npm. Le SVG in `public/icons/` sono custom (icone PWA con design soli-dome specifico) — non coincidono con `soli-icon-favicon.svg` dal registry. Divergenza plausibilmente intenzionale per look-and-feel del portale.

---

### soli-prof

| Asset | Fonte | Metodo |
|---|---|---|
| soli-icon-favicon.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-favicon.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-app-icon.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-app-icon.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-apple-touch.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-apple-touch.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-logo.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-logo.png` | ⚠️ unpkg CDN con versione pinned |
| `public/` | Nessun file in `public/` rilevato | — |

**Note:** Tutti gli asset vengono serviti da CDN unpkg con versione esplicitamente pinned (`@1.14.1`). Non ci sono copie locali. **Anomalia:** dipendenza da CDN esterno per asset critici del PWA (icon, apple-touch) — rischio di indisponibilità a runtime se unpkg è offline. Il pattern raccomandato è import npm bundlato (come soli-agent/soli-dome) o copia locale in `public/`.

---

### soli-boy

| Asset | Fonte | Metodo |
|---|---|---|
| `public/favicon.svg` | File SVG locale custom | ⚠️ copia locale custom |
| `public/favicon-32.png` | File PNG locale custom | ⚠️ copia locale custom |
| `public/favicon-64.png` | File PNG locale custom | ⚠️ copia locale custom |
| `public/icons/icon-*.png` (9 dimensioni) | File PNG locali custom | ⚠️ copie locali custom |
| `public/icons/soliboy-icon.svg` | File SVG locale custom | ⚠️ icona app-specifica |

**Note:** soli-boy non importa brand assets da `@soli92/solids` — tutti gli asset visivi sono custom per il brand Soli-boy (emulatore GameBoy). Il `favicon.svg` è un SVG custom con sfondo scuro `#140b22` e design specifico per l'app. Non ci sono import npm di brand assets. La separazione è probabilmente intenzionale: soli-boy ha un'identità visiva propria (brand GameBoy) pur condividendo i token CSS SoliDS.

---

### soli-dm-fe

| Asset | Fonte | Metodo |
|---|---|---|
| `public/brand/soli-favicon.svg` | File SVG locale custom | ⚠️ copia locale custom |
| `public/brand/soli-logo-gold.svg` | File SVG locale custom | ⚠️ copia locale custom |
| `public/brand/soli-symbol-gold.svg` | File SVG locale custom | ⚠️ copia locale custom |
| `public/brand/d20-icon.svg` | File SVG custom locale | ℹ️ icona specifica DM (dado D20) |
| `public/icons/apple-touch-icon.png` | File PNG locale | ⚠️ copia locale custom |
| `public/icons/icon-192.png` | File PNG locale | ⚠️ copia locale custom |
| `public/icons/icon-512.png` | File PNG locale | ⚠️ copia locale custom |

**Note:** soli-dm-fe usa esclusivamente copie locali in `public/brand/` — nessun import npm da `@soli92/solids`. Il file `soli-favicon.svg` e `soli-logo-gold.svg` hanno stile D&D-brand (oro, tematizzato). Il `d20-icon.svg` è asset applicativo specifico non presente nel registry SoliDS. Le icone PWA sono generate localmente. Divergenza significativa rispetto al pattern raccomandato.

---

### casa-mia-fe

| Asset | Fonte | Metodo |
|---|---|---|
| `public/brand-assets/soli-category-icons/soli-icon-*.png` | Copia locale di `@soli92/solids/dist/brand-assets/soli-category-icons/` | ⚠️ copia locale — **file size divergente** |
| `public/brand-assets/soli-category-icons/soli-icon-logo.svg` | Copia locale | ⚠️ **size 7372 byte vs 691 byte in solids dist** |
| `public/brand-assets/soli-category-icons/soli-icon-symbol.svg` | Copia locale | ⚠️ **size 6561 byte vs 544 byte in solids dist** |
| `public/brand-assets/soli-icons/soli-icon-4x3-with-text-gold.svg` | Copia locale parziale | ⚠️ copia locale |
| `public/brand-assets/soli-icons/soli-icon-4x3-with-text-mono.svg` | Copia locale parziale | ⚠️ copia locale |
| `public/favicon.png` | File PNG locale | ⚠️ copia locale |
| `public/apple-touch-icon.png` | File PNG locale | ⚠️ copia locale |
| `public/icons/icon-192.png`, `icon-512.png`, varianti `-dark` | File PNG locali | ⚠️ copie locali (con variante dark aggiuntiva) |

**Note:** `casa-mia-fe` ha una struttura `public/brand-assets/` che replica la struttura di `dist/brand-assets/` di solids, ma **i file sono divergenti per dimensione** — le SVG locali (`soli-icon-logo.svg`: 7372 byte, `soli-icon-symbol.svg`: 6561 byte) sono significativamente più grandi delle versioni nel dist di solids (`soli-icon-logo.svg`: 691 byte, `soli-icon-symbol.svg`: 544 byte). Questo indica che i file locali sono versioni non ottimizzate o versioni precedenti. **Anomalia critica: asset locali divergenti da solids dist.**

---

### bachelor-party-claudiano

| Asset | Fonte | Metodo |
|---|---|---|
| `public/soli-logo-1x1-symbol-only-gold.svg` | Copia locale da solids | ⚠️ **size 6561 byte vs 544 byte in solids dist** |
| `public/soli-logo-4x3-with-text-gold.svg` | Copia locale da solids | ⚠️ size divergente |
| `public/apple-touch-icon.png` | File PNG locale | ⚠️ copia locale |
| `public/favicon-32.png` | File PNG locale | ⚠️ copia locale |
| `public/pwa-192.png`, `pwa-512.png` | File PNG locali custom | ⚠️ copie locali |
| `public/app-icon.svg` | File SVG custom | ℹ️ icona event-specifica |
| `public/splash-landscape.svg`, `splash-portrait.svg` | File SVG custom splash | ℹ️ splash screen event-specific |
| `public/apple-splash-*.png` (7 risoluzioni) | File PNG locali | ℹ️ splash screens iOS |

**Note:** I file `soli-logo-1x1-symbol-only-gold.svg` (6561 byte) e `soli-logo-4x3-with-text-gold.svg` non corrispondono per dimensione alle versioni ottimizzate in `solids dist` (`soli-icon-1x1-symbol-only-gold.svg`: 544 byte). Stessa anomalia di casa-mia-fe: versioni non ottimizzate o precedenti. Il file `src/constants/appIcon.js` cita che gli asset derivano da `@soli92/solids/dist/brand-assets` ma sono stati copiati localmente.

---

### soli-projects

| Asset | Fonte | Metodo |
|---|---|---|
| soli-icon-favicon.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-favicon.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-app-icon.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-app-icon.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-apple-touch.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-apple-touch.png` | ⚠️ unpkg CDN con versione pinned |
| soli-icon-logo.png | `https://unpkg.com/@soli92/solids@1.14.1/dist/brand-assets/soli-category-icons/soli-icon-logo.png` | ⚠️ unpkg CDN con versione pinned |
| `public/` | Nessun file in `public/` rilevato | — |

**Note:** Stesso pattern di soli-prof — dipendenza CDN unpkg per tutti gli asset critici. Rischio runtime se CDN non disponibile.

---

## Tabella riepilogativa

| Consumer | Import npm ES | CDN unpkg | Copie locali | Asset divergenti | Anomalie |
|---|---|---|---|---|---|
| soli-agent | ✅ parziale | ❌ | ⚠️ `favicon.svg` custom | ⚠️ favicon custom non da solids | Favicon SVG locale custom |
| soli-dome | ✅ principale | ❌ | ⚠️ icone PWA custom | ⚠️ icone PWA custom | Icone PWA custom per look-and-feel |
| soli-prof | ❌ | ✅ tutti | ❌ | ❌ | **CDN risk** — dipendenza unpkg |
| soli-boy | ❌ | ❌ | ✅ tutti | ✅ tutti custom | Brand GameBoy proprio — by design |
| soli-dm-fe | ❌ | ❌ | ✅ tutti | ✅ tutti custom | Asset D&D-branded non da solids |
| casa-mia-fe | ❌ | ❌ | ✅ tutti | ✅ **SVG size divergenti** | File SVG locali 10x più grandi di solids dist |
| bachelor-party-claudiano | ❌ | ❌ | ✅ tutti | ✅ **SVG size divergenti** | File SVG locali non ottimizzati |
| soli-projects | ❌ | ✅ tutti | ❌ | ❌ | **CDN risk** — dipendenza unpkg |

---

## Anomalie critiche

1. **casa-mia-fe e bachelor-party-claudiano — SVG locali divergenti:**
   - `soli-icon-logo.svg` / `soli-logo-4x3-with-text-gold.svg`: ~7400 byte locale vs 691 byte in solids dist
   - `soli-icon-symbol.svg` / `soli-logo-1x1-symbol-only-gold.svg`: ~6561 byte locale vs 544 byte in solids dist
   - Possibile causa: versioni precedenti non ottimizzate copiate prima dell'ottimizzazione nel dist. Da allineare alla versione npm corrente.

2. **soli-prof e soli-projects — CDN unpkg:**
   - Asset critici per il PWA (favicon, apple-touch) serviti da CDN esterno non controllato con versione pinned hard-coded `@1.14.1`. Se la versione viene deprecata su unpkg o il CDN è irraggiungibile, le icone dell'app non vengono caricate. Raccomandato migrazione a import npm bundlato (come soli-agent/soli-dome).

3. **soli-dm-fe — asset completamente custom:**
   - Nessun asset provenga da `@soli92/solids`. I file SVG in `public/brand/` sono versioni D&D-tematizzate (oro, stile medievale) del logo SoliDS — divergenza visiva rispetto al brand system.

## Raccomandazioni

1. **Priorità alta:** Allineare SVG in casa-mia-fe e bachelor-party-claudiano alle versioni ottimizzate del dist npm — diff size di ~10x suggerisce versioni precedenti.
2. **Priorità media:** Migrare soli-prof e soli-projects da CDN unpkg a import npm ES (come soli-agent e soli-dome) per eliminare dipendenza CDN runtime.
3. **Priorità bassa:** Valutare se le icone PWA custom di soli-dome e soli-agent (SVG custom in `public/`) devono essere aggiunte al registry SoliDS come varianti app-specifiche.
4. **Documentare by-design:** La divergenza di soli-boy (brand GameBoy) e soli-dm-fe (brand D&D) è plausibilmente intenzionale — documentare come eccezioni approvate.
