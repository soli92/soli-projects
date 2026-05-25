# 🎲 Soli Dungeon Master - Frontend

**Soli-DM** è un'applicazione web completa per gestire campagne **Dungeons & Dragons 5e**. 

Questo repository contiene il **Frontend** costruito con **Next.js 15 + TypeScript + Tailwind CSS + Supabase Auth**.

Vedi [`AGENTS.md`](./AGENTS.md) e [`AI_LOG.md`](./AI_LOG.md). [Soli Prof](https://github.com/soli92/soli-prof) elenca questo repo in RAG; webhook su `push` (documentato in Soli Prof `AGENTS.md`). I test `npm test` in CI/locale **non** dipendono.

---

## 📋 Caratteristiche

### ✅ Autenticazione
- **Google OAuth** via Supabase
- **Email/Password** JWT
- Session management
- Protected routes

### 🎯 Gestione Campagne
- Crea, visualizza, modifica, elimina campagne
- Descrizione, impostazioni mondo, livelli consigliati
- **Mappa interattiva** con Leaflet.js
  - Aggiungi location sulla mappa
  - Drag & drop
  - Zoom/pan
  - Salvataggio automatico

### 👤 Gestione Personaggi
- **Pannello identità** (sempre visibile sopra le tab): classe principale, razza, **sottoclasse da tipologica SRD** (filtrata per classe + «Altro» testo libero), allineamento, livello; **multiclasse opzionale** (`sheet_data.multiclass_class` / `multiclass_level`)
- **Tab scheda**: *Statistiche* (punteggi con **modificatori D&D 5e** e riquadri di riferimento bonus razza SRD / tiri salvezza classe da `lib/racial-class-reference.ts`), *Bonus e talenti* (note libere), *Armamenti*, *Deposito*, *Storia* (background + **sessioni di gioco** con titolo/data/note)
- Dati estesi in Supabase: JSON **`sheet_data`** + colonna **`background`**; migrazione DB: **`soli-dm-be/scripts/supabase-alignment.sql`** (o `SETUP.md`)
- Lista personaggi → **`/characters/[id]`** con **`PUT /api/characters/:id`**
- **Loader a tutto schermo** (`components/ui/full-screen-loader.tsx`) durante il caricamento campagne/elenco sulla lista personaggi e durante il fetch della scheda in dettaglio (`aria-hidden` sul contenuto sottostante)

### 🎲 Simulatore Dadi
- Lancia dadi in notazione **`NdX`** (es. `4d6`, `2d20`) — senza modificatori (`+5` non è accettato dall’API)
- Storico tiri per campagna (colonna DB **`dice_notation`**; vedi script SQL nel backend se lo schema usa ancora solo `notation`)
- Tiri multipli (`/api/dice/roll-multiple`)

### 📚 Wiki D&D
- **Classi wiki (SRD, 12)**: Barbarian … Wizard; nei **form personaggio** è disponibile anche **Warrior** (nome comune fuori dal naming SRD, oltre a **Fighter**)
- **12 Razze**: Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human, Tiefling, Asimar, Genasi, Goliath
- **20+ Divinità** (Forgotten Realms)
- **Core Rules**: Ability Scores, Combat, Saving Throws, Resting, Multiclassing

### 📑 Tipologiche (`lib/tipologiche/`)
Liste statiche condivise con la UI (form campagne/personaggi, dadi, wiki): **allineamenti** PHB (9), **classi SRD** (12, wiki/API) e **`PLAYBOOK_CLASS_NAMES`** (SRD + **Warrior**), **`SUBCLASSES_BY_CLASS`** / **`getSubclassOptionsForClass`** (sottoclassi SRD per classe + opzione «Altro» testo libero), **razze playbook** (12), **stati** campagna/personaggio, **preset** range livelli e notazioni dadi, **id categorie** regole wiki. Gli elenchi che esistono anche sul backend (`soli-dm-be` → `src/lib/tipologiche.ts`) vanno aggiornati **in parallelo** dove serve (vedi commenti nei file sorgente).

### 🎨 UI e tema (SoliDS)
- **[@soli92/solids](https://www.npmjs.com/package/@soli92/solids)** **^1.14.1** — token CSS e preset Tailwind (light, dark, fantasy, cyberpunk, 90s-party, steampunk, ichigo, vegeta, zoro, captain-america, sasuke, inuyasha); **Google Fonts** in `app/layout.tsx`
- **Layout** (`lib/ui-classes.ts`): area DM con **gradiente leggero** su `appCanvas`; pannelli `appPanelStack` con vetro (`bg-card/95`, blur sottile)
- **Componenti UI** in `components/ui/`: allineati al **registry React** del design system ([repo solids](https://github.com/soli92/solids) → `registry/solids/*`) — `Button` (class-variance-authority + Radix Slot), `Card` (compound), `Input` / `Textarea`, `Tabs` (Radix), `Avatar` (Radix), **`full-screen-loader`** (overlay caricamento). Il pacchetto npm **non** esporta questi file: restano copia curata in app.
- **Scheda personaggio**: `components/character/CharacterIdentityPanel.tsx`, `CharacterTabsFields.tsx`; helper **`lib/character-sheet.ts`** (normalizzazione `stats`/`sheet_data`, modificatori)
- **`<select>` nativi** (form, theme switcher): classi condivise `solidsNativeSelectTrigger` in `lib/solids-native-classes.ts` e `appSelectField` in `lib/ui-classes.ts` (stesso linguaggio visivo del `SelectTrigger` del registry).
- Layout shell: classi in `lib/ui-classes.ts` (`appPageShell`, `appPanelStack`, `appCanvas` sotto app bar fissa) e **navigazione a drawer** (`components/navigation.tsx`): barra superiore e pulsante menu su **tutte le larghezze**; il pannello link non è fisso su desktop (contenuto a larghezza piena, senza colonna laterale permanente)
- **next-themes** — selezione tema nel drawer di navigazione (stesso pannello su mobile e desktop)
- PWA: **@ducanh2912/next-pwa** (service worker in produzione; vedi nota in `AGENTS.md` su cache cross-origin e API)
- Branding Soli (migrazione 2026-04-29): logo D20 sostituito con asset Soli (`SoliBrandLogo`), favicon SVG dedicata, icone PWA derivate da `public/brand/soli-symbol-gold.svg`

---

## 🚀 Quick Start

### Prerequisiti
- **Node.js 20+**
- **npm 10+**
- **Supabase** account (https://supabase.com)

### Installazione

```bash
# Clone il repository
git clone https://github.com/soli92/soli-dm-fe.git
cd soli-dm-fe

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp .env.example .env.local
# Modifica .env.local con i tuoi valori
```

### Avvia il server

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

L'app sarà disponibile su `http://localhost:3000`

---

## 🔐 Configurazione Supabase (CRITICO)

### 1. Crea progetto Supabase
- Vai a https://supabase.com
- Crea nuovo progetto
- Copia `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### 2. Abilita Google OAuth

1. **Google Cloud Console:**
   - Vai a https://console.cloud.google.com/
   - Crea un nuovo progetto
   - Abilita **Google+ API**
   - **Credentials** → **Create OAuth 2.0 Client ID**
   - Tipo: **Web application**
   - **Authorized JavaScript origins:**
     ```
     https://your-project.supabase.co
     https://soli-dm-*.vercel.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     https://your-project.supabase.co/auth/v1/callback
     https://soli-dm-*.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```
   - Salva e copia **Client ID** + **Client Secret**

2. **Supabase Dashboard:**
   - Authentication → Providers → Google
   - Attiva **Enable Google Provider**
   - Incolla **Client ID** e **Client Secret**
   - Salva

### 3. Variabili d'Ambiente (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API
NEXT_PUBLIC_API_URL=https://soli-dm-be.onrender.com

# Opzionale: solo se sul backend è impostata SOLI_DM_API_KEY (stesso valore, esposto al client)
# NEXT_PUBLIC_SOLI_DM_API_KEY=
```

---

## 📁 Struttura directory (sintesi)

```
app/
├── layout.tsx, providers.tsx, globals.css    # root: tema, Toaster, font
├── auth/callback/route.ts                    # OAuth Supabase
└── (dm)/                                     # area gioco / wiki
    ├── layout.tsx                            # skip link, canvas, #main-content
    ├── page.tsx                              # home
    ├── login/, register/
    ├── campaigns/, campaigns/[id]/
    ├── characters/, dice-roller/
    └── wiki/ … (classes, races, deities, rules + route dinamiche)

components/
├── navigation.tsx, theme-switcher.tsx, UserAvatar.tsx
├── character/                                # CharacterIdentityPanel, CharacterTabsFields
└── ui/                                       # button, card, input, textarea, tabs, avatar, full-screen-loader (SoliDS + loader)

lib/
├── api.ts, supabase.ts, auth.ts
├── auth-errors.ts                            # messaggi IT per errori Auth
├── character-sheet.ts                        # stats/sheet_data, modificatori 5e
├── racial-class-reference.ts                 # hint bonus razza / classe (riferimento SRD semplificato)
├── solids-native-classes.ts                  # stile `<select>` allineato a SoliDS SelectTrigger
├── tipologiche/                              # dnd, subclasses, app, dice, wiki (re-export index.ts)
├── ui-classes.ts                             # classi layout / tipografia condivise
└── utils.ts                                  # cn (clsx + tailwind-merge)

tests/                                        # Vitest (+ Testing Library dove serve)
├── auth-errors.test.ts, utils.test.ts, tipologiche.test.ts, subclasses.test.ts, solids-package.test.ts, solids-ui.test.ts
├── client.test.ts, character-sheet.test.ts, characters-api.test.ts, racial-class-reference.test.ts, useCampaigns.test.tsx
```

---

## 🔗 API Endpoints (Backend)

Il frontend comunica con il backend API su:
```
NEXT_PUBLIC_API_URL=https://soli-dm-be.onrender.com
```

**Endpoints principali:**
- `GET /health` — Health check
- `GET /api/campaigns` — Lista campagne
- `POST /api/campaigns` — Crea campagna
- `GET /api/campaigns/:id` — Dettagli campagna
- `PUT /api/campaigns/:id` — Modifica campagna
- `DELETE /api/campaigns/:id` — Elimina campagna
- `GET /api/characters?campaign_id=:id` — Personaggi campagna
- `GET /api/characters/:id` — Dettaglio personaggio
- `POST /api/characters` — Crea personaggio (`stats`, `sheet_data`, `background`, …)
- `PUT /api/characters/:id` — Aggiorna scheda
- `POST /api/dice/roll` — Lancia dadi
- `GET /api/dice/history?campaign_id=:id` — Storico lanci
- `GET /api/classes` — Wiki classi
- `GET /api/races` — Wiki razze
- `GET /api/deities` — Wiki divinità
- `GET /api/rules` — Wiki regole

---

## 🛠️ Sviluppo

### Comandi

```bash
# Dev server (hot reload)
npm run dev

# Test unitari (Vitest — stessa suite in CI)
npm test
npm run test:watch   # modalità watch

# Type check
npm run type-check

# Lint
npm run lint

# Build per production (include generazione icone PWA)
npm run build

# Avvia build prodotto
npm start
```

### Test

- **`npm test`** — `vitest run` su `**/*.test.ts(x)` (incluso **`lib/solids-package.test.ts`** per range SoliDS; client API, `updateCharacter`, `lib/character-sheet`, `lib/racial-class-reference`, **`subclasses.test.ts`** / tipologiche, hook campagne, primitive UI SoliDS, `formatAuthError`, `cn`, …).
- In **CI** (`.github/workflows/ci.yml`): `npm ci` poi `lint` → `type-check` → `test` → `build`.

### Componenti UI

Primitive in **`components/ui/`** — varianti e classi come il **registry SoliDS** (non duplicare pattern shadcn/MUI esterni). Token da `globals.css` / `@soli92/solids/css`. Classi condizionali: **`cn`** in `lib/utils.ts`.

---

## 🎨 Tema

I temi sono forniti da **SoliDS** (`data-theme` su `<html>`) e **next-themes**:
- **light**, **dark**, **fantasy**, **cyberpunk**, **90s-party**, **steampunk**
- **ichigo**, **vegeta**, **zoro**, **captain-america**, **sasuke**, **inuyasha**

Il **theme switcher** è nel **menu laterale** (area utente in basso) su desktop e nel drawer su mobile.

---

## 📱 Responsive Design

L'app è completamente responsive:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

Mappa Leaflet è adattiva su tutti i dispositivi.

---

## 🔒 Sicurezza

- **JWT** per autenticazione locale
- **Supabase RLS** per autorizzazione database
- **Google OAuth** per login social
- **HTTPS** in produzione (Vercel)
- **CORS** configurato nel backend

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connetti GitHub a Vercel (repository soli92/soli-dm-fe)
# Production Branch: main
# Imposta variabili d'ambiente (Environment Variables):
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=...
# Opzionale, solo se il backend richiede la chiave:
# NEXT_PUBLIC_SOLI_DM_API_KEY=...

# Deploy automatico a ogni push sul branch di produzione
```

**URL Produzione:** https://soli-dm-*.vercel.app

Se dopo un push **non compare** un nuovo deployment: in dashboard Vercel → **Settings** → **Git** verifica **Production Branch** = `main`, repository collegato corretto e che **Require Verified Commits** non scarti i tuoi commit (se attivo, firma i commit o disattivalo). Dettaglio in **[SETUP.md](./SETUP.md)** § 4.0 e § 4.3.

### GitHub Actions (CI)

Su **push** e **pull request** verso `main`, [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) esegue in sequenza: `npm ci`, `npm run lint`, `npm run type-check`, `npm test`, `npm run build` (Node **22**, `CI=true`). Allineato allo stile CI usato in altri repo frontend (es. Pippify).

---

## 🐛 Troubleshooting

### Vercel: nessun deploy dopo `git push`

- **Production Branch** ≠ branch da cui pushi (es. push su `main` ma produzione è `master`) → allinea in **Settings → Git**.
- **Require Verified Commits** attivo e commit non firmati → Vercel non crea il deployment.
- Webhook GitHub verso Vercel in errore → riconnetti il repo da **Settings → Git**.

Vedi **[SETUP.md](./SETUP.md) § 4.3**.

### Build fallisce con "Module not found"
- Esegui `npm install` nuovamente
- Verifica che tutti gli import siano corretti
- Cancella `.next/` e riprova: `rm -rf .next && npm run build`

### OAuth Google non funziona
- Verifica che **Redirect URI** sia configurato sia in Google Cloud che in Supabase
- Assicurati che il dominio sia autorizzato in Google OAuth
- Controlla che `NEXT_PUBLIC_SUPABASE_*` siano impostati correttamente

### Mappa Leaflet non si visualizza
- Assicurati che `leaflet` e `react-leaflet` siano installati: `npm install leaflet react-leaflet`
- Verifica che il componente `campaign-map.tsx` sia importato correttamente
- Controlla la console per errori JavaScript

### Backend non raggiungibile
- Verifica che `NEXT_PUBLIC_API_URL` sia corretto
- Controlla che il backend sia online: `curl https://soli-dm-be.onrender.com/health`
- Verifica **CORS** nel backend

### PWA / Service Worker e API
- In produzione Workbox non intercetta le richieste GET verso la base URL del backend (configurata a build time da `NEXT_PUBLIC_API_URL` più fallback documentato in `next.config.ts`), così si evitano errori tipo **no-response** su fetch cross-origin verso l’API.
- Dopo un cambio di dominio API, imposta le variabili Vercel e **ridistribuisci** così `public/sw.js` rigenera i prefissi corretti.

---

## 📝 Roadmap

- [ ] Drag & drop campagne su mappa (oltre ai pin)
- [ ] Real-time multiplayer (WebSocket)
- [ ] Export/Import campagne (JSON/PDF)
- [ ] Integrazione con D&D Beyond API
- [ ] Mobile app (React Native/Expo)
- [ ] Dark mode migliorato
- [ ] i18n (Internazionalizzazione)

---

## 🤝 Contribuire

Vedi [CONTRIBUTING.md](./CONTRIBUTING.md) per le linee guida.

---

## 📄 Licenza

MIT © [soli92](https://github.com/soli92)

---

## 🎯 Link Utili

- **Backend Repo**: [soli92/soli-dm-be](https://github.com/soli92/soli-dm-be)
- **Live Demo**: https://soli-dm-*.vercel.app
- **Backend API**: https://soli-dm-be.onrender.com
- **D&D 5e SRD**: https://dnd5e.wikidot.com/
- **Forgotten Realms Wiki**: https://forgottenrealms.fandom.com/

---

## 📧 Contatti

Domande? Apri un issue su GitHub.

🎲 **Buone avventure!**
