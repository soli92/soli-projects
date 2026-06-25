#!/usr/bin/env bash
# Smoke test: verifica che tutti i servizi critici siano raggiungibili in produzione
# Uso: ./scripts/smoke-test.sh
# Exit code: 0 se tutti passano, 1 se almeno uno fallisce

set -euo pipefail

# ---------------------------------------------------------------------------
# Endpoint di produzione da testare
# TODO: sostituire i placeholder con gli URL reali dopo il primo deploy
# ---------------------------------------------------------------------------
declare -A SERVICES
SERVICES["soli-prof /health"]="TODO_SOLI_PROF_URL/api/health"
SERVICES["soli-agent /health"]="TODO_SOLI_AGENT_URL/api/health"
SERVICES["soli-projects home"]="TODO_SOLI_PROJECTS_URL"

# ---------------------------------------------------------------------------
# Colori per output
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Esegui test
# ---------------------------------------------------------------------------
FAILED=0
RESULTS=()

for service in "${!SERVICES[@]}"; do
  url="${SERVICES[$service]}"

  # Salta i placeholder non ancora configurati
  if [[ "$url" == TODO* ]]; then
    RESULTS+=("$(printf '%-30s | %-50s | %-7s | %s' "$service" "$url" "SKIP" "URL non configurato")")
    continue
  fi

  http_code=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [[ "$http_code" == "200" ]]; then
    RESULTS+=("$(printf '%-30s | %-50s | %-7s | %s' "$service" "$url" "PASS" "$http_code")")
  else
    RESULTS+=("$(printf '%-30s | %-50s | %-7s | %s' "$service" "$url" "FAIL" "$http_code")")
    FAILED=$((FAILED + 1))
  fi
done

# ---------------------------------------------------------------------------
# Tabella risultati
# ---------------------------------------------------------------------------
echo ""
echo "Smoke Test Results — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "$(printf '%-30s | %-50s | %-7s | %s' 'Service' 'URL' 'Status' 'HTTP Code')"
echo "$(printf '%0.s-' {1..105})"
for result in "${RESULTS[@]}"; do
  line_status=$(echo "$result" | grep -o '| PASS\|| FAIL\|| SKIP' | head -1)
  if [[ "$line_status" == "| PASS" ]]; then
    echo -e "${GREEN}${result}${NC}"
  elif [[ "$line_status" == "| FAIL" ]]; then
    echo -e "${RED}${result}${NC}"
  else
    echo -e "${YELLOW}${result}${NC}"
  fi
done
echo ""

# ---------------------------------------------------------------------------
# Exit code finale
# ---------------------------------------------------------------------------
if [[ $FAILED -gt 0 ]]; then
  echo -e "${RED}FAILED: $FAILED servizio/i non raggiungibile/i.${NC}"
  exit 1
else
  echo -e "${GREEN}OK: tutti i servizi configurati sono raggiungibili.${NC}"
  exit 0
fi
