#!/usr/bin/env bash
# Wait until Postgres and Redis from docker compose are ready (infra profile).

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

POSTGRES_USER="${POSTGRES_USER:-recon}"
POSTGRES_DB="${POSTGRES_DB:-recon}"

echo "Waiting for PostgreSQL..."
TRIES=0
until docker compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 60 ]; then
    echo "PostgreSQL did not become ready in time."
    exit 1
  fi
  sleep 1
done
echo "PostgreSQL is ready."

echo "Waiting for Redis..."
TRIES=0
until docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 30 ]; then
    echo "Redis did not become ready in time."
    exit 1
  fi
  sleep 1
done
echo "Redis is ready."
