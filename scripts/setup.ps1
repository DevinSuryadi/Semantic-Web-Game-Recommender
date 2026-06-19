$ErrorActionPreference = "Stop"

Write-Host "Checking GameFeel KG requirements..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 20+ belum terinstall. Install dari https://nodejs.org/ lalu jalankan script ini lagi."
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "pnpm belum ditemukan. Mengaktifkan pnpm lewat Corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
}

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

pnpm install
pnpm db:generate
pnpm kg:build

Write-Host "Setup selesai. Jalankan Fuseki, buat dataset GameFeel, lalu run: pnpm fuseki:reload dan pnpm dev"
