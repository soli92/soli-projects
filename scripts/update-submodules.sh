#!/usr/bin/env bash
# Usage:
#   ./scripts/update-submodules.sh           — aggiorna tutti i submodule
#   ./scripts/update-submodules.sh soli-boy  — aggiorna solo soli-boy

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

update_one() {
  local name="$1"
  local path="projects-repos/$name"
  if [ ! -d "$path" ]; then
    echo "✗ Submodule '$name' non trovato in projects-repos/"
    exit 1
  fi
  echo "→ Aggiornamento $name..."
  git submodule update --remote "$path"
  git add "$path"
}

if [ -n "${1:-}" ]; then
  update_one "$1"
else
  while IFS= read -r path; do
    name="${path#projects-repos/}"
    update_one "$name"
  done < <(git submodule foreach --quiet 'echo $displaypath')
fi

if git diff --staged --quiet; then
  echo "Nessun aggiornamento disponibile."
else
  COUNT=$(git diff --staged --name-only | wc -l | tr -d ' ')
  git commit -m "chore: bump ${COUNT} submodule(s) to latest"
  echo "✓ Commit creato. Esegui 'git push' per pubblicare."
fi
