#!/usr/bin/env bash
# Second SCOPTIX instance ("B") — isolated fast-lane stack for small scopes.
# Uses .env.b (STACK_PREFIX=scoptix2, ports 3001/5433/6380) so it never clashes
# with the primary stack started by docker-start.sh.

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PROJECT="${SCOPTIX_B_PROJECT:-scoptix2}"
ENV_FILE="${SCOPTIX_B_ENV:-.env.b}"

if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}Docker not found.${NC}"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo -e "${RED}Docker Compose v2 not found.${NC}"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}Cannot connect to Docker daemon.${NC}"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}$ENV_FILE not found.${NC} Create it (see .env.b for the second-instance template)."
  exit 1
fi

if grep -q 'REPLACE_ME_BASE64_32_BYTES' "$ENV_FILE" 2>/dev/null; then
  echo -e "${YELLOW}APP_ENCRYPTION_KEY is still a placeholder in $ENV_FILE.${NC}"
  if command -v openssl >/dev/null 2>&1; then
    KEY="$(openssl rand -base64 32)"
    sed -i "s|APP_ENCRYPTION_KEY=\"REPLACE_ME_BASE64_32_BYTES\"|APP_ENCRYPTION_KEY=\"${KEY}\"|" "$ENV_FILE"
    echo -e "${GREEN}Generated APP_ENCRYPTION_KEY in $ENV_FILE${NC}"
  else
    echo "Set APP_ENCRYPTION_KEY in $ENV_FILE before using encrypted API keys."
  fi
fi

echo -e "${CYAN}Building and starting SCOPTIX instance '${PROJECT}' (env: ${ENV_FILE})...${NC}"
docker compose -p "$PROJECT" --env-file "$ENV_FILE" --profile full up -d --build

echo ""
echo -e "${GREEN}Instance '${PROJECT}' started.${NC}"
sleep 2
docker compose -p "$PROJECT" --env-file "$ENV_FILE" --profile full ps
echo ""
echo -e "  UI:    ${YELLOW}http://localhost:$(grep -E '^APP_PORT=' "$ENV_FILE" | cut -d= -f2)${NC}"
echo -e "  Stop:  ${YELLOW}docker compose -p ${PROJECT} --profile full down${NC}"
echo -e "  Logs:  ${YELLOW}docker compose -p ${PROJECT} logs -f${NC}"
