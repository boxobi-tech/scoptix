#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

# Parse host/port/user/db from DATABASE_URL (postgresql://user:pass@host:port/db)
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's#.*@\([^:/]*\).*#\1#p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's#.*:\([0-9]*\)/.*#\1#p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's#.*://\([^:]*\):.*#\1#p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's#.*/\([^?]*\).*#\1#p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's#.*://[^:]*:\([^@]*\)@.*#\1#p')

DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-recon}
DB_NAME=${DB_NAME:-recon}

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
export PGPASSWORD="$DB_PASS"
TRIES=0
until psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 60 ]; then
    echo "PostgreSQL not ready after 60 attempts"
    exit 1
  fi
  sleep 2
done

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Database setup complete."
