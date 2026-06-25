# scripts/

Utility scripts for soli-projects.

## smoke-test.sh

Verifica che tutti i servizi critici dell'ecosistema soli92 siano raggiungibili in produzione.

**Uso:**

```bash
./scripts/smoke-test.sh
# oppure via npm:
npm run smoke
```

**Output:** tabella `Service | URL | Status | HTTP Code` con colori (PASS/FAIL/SKIP).

**Exit code:** `0` se tutti i servizi configurati rispondono HTTP 200, `1` se almeno uno fallisce.

**TODO:** prima di usare in produzione, sostituire i placeholder `TODO_*_URL` con gli URL reali nei seguenti servizi:
- `soli-prof /health` — URL Vercel deploy
- `soli-agent /health` — URL Vercel deploy
- `soli-projects home` — URL Vercel deploy

## update-submodules.sh

Aggiorna tutti i submodule git al commit più recente del branch principale.

**Uso:**

```bash
./scripts/update-submodules.sh
```
