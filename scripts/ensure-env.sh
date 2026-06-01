#!/usr/bin/env bash
# Create .env from .env.example if missing; generate APP_ENCRYPTION_KEY when placeholder.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  exit 0
fi

if [ ! -f .env.example ]; then
  echo "Missing .env.example — cannot bootstrap .env"
  exit 1
fi

cp .env.example .env

if command -v openssl >/dev/null 2>&1; then
  KEY="$(openssl rand -base64 32)"
  sed -i "s|APP_ENCRYPTION_KEY=\"REPLACE_ME_BASE64_32_BYTES\"|APP_ENCRYPTION_KEY=\"${KEY}\"|" .env
  echo "Created .env from .env.example (generated APP_ENCRYPTION_KEY)."
else
  echo "Created .env from .env.example — set APP_ENCRYPTION_KEY before storing API keys."
fi
