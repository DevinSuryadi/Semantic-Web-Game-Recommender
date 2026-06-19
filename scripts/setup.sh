#!/usr/bin/env bash
set -euo pipefail

echo "Checking GameFeel KG requirements..."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ belum terinstall. Install dari https://nodejs.org/ lalu jalankan script ini lagi."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm belum ditemukan. Mengaktifkan pnpm lewat Corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

pnpm install
pnpm db:generate
pnpm kg:build

echo "Setup selesai. Jalankan Fuseki, buat dataset GameFeel, lalu run: pnpm fuseki:reload dan pnpm dev"
