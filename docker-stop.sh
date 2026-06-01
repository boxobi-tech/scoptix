#!/usr/bin/env bash
# Stop SCOPTIX Docker stack (app, worker, Postgres, Redis, etc.)

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose not available."
  exit 1
fi

echo -e "${CYAN}Stopping SCOPTIX containers...${NC}"
docker compose --profile full down --remove-orphans "$@"

echo ""
echo -e "${GREEN}Stopped.${NC}"
echo -e "  Start again: ${YELLOW}bash docker-start.sh${NC}"
echo -e "  Infra only:  ${YELLOW}bash docker-start-infra.sh${NC}  →  ${YELLOW}npm run dev:all${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} To also delete the Postgres data volume, run:"
echo -e "  docker compose --profile full down -v"
echo ""
