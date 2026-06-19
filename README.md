# GameFeel KG

GameFeel KG adalah aplikasi rekomendasi game berbasis Semantic Web. Sistem membaca data RDF melalui SPARQL/Fuseki, lalu menampilkan rekomendasi yang dapat dijelaskan berdasarkan kemiripan atribut semantik seperti genre, mood, theme, mechanic, game mode, difficulty, pacing, platform, dan tag.

## Struktur Project

- `apps/web`: frontend React + TypeScript + Vite.
- `apps/api`: backend Express + TypeScript, Prisma staging, dan integrasi SPARQL.
- `data/raw/rawg_games.json`: data mentah dari RAWG.
- `data/curated/gamefeel_dataset.csv`: dataset curated untuk RDF.
- `ontology/gamefeel_ontology.ttl`: ontology GameFeel.
- `rdf/gamefeel_data.ttl`: data RDF/Turtle.
- `sparql`: query SPARQL untuk search, detail, dan rekomendasi.
- `docs/examples`: folder untuk screenshot contoh hasil.

## Panduan Instalasi

1. Install kebutuhan utama:
   - Node.js 20+
   - pnpm
   - Java JDK 17+
   - Apache Jena Fuseki

2. Cek requirement environment:

```bash
cat requirements.txt
```

3. Jalankan setup dependency project:

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File requirements.ps1
```

macOS/Linux:

```bash
bash requirements.sh
```

4. Salin environment jika `.env` belum dibuat otomatis:

```bash
cp .env.example .env
```

5. Jalankan Apache Jena Fuseki di `http://localhost:3030`, lalu buat dataset bernama `GameFeel`.

6. Upload ontology dan RDF ke Fuseki:

```bash
pnpm fuseki:reload
```

7. Jalankan aplikasi:

```bash
pnpm dev
```

Jika ingin menjalankan manual tanpa script setup:

```bash
pnpm install
pnpm db:generate
pnpm kg:build
```

Default:
- Web: `http://127.0.0.1:5173`
- API: `http://localhost:3000`
- Fuseki query endpoint: `http://localhost:3030/GameFeel/query`

## Panduan Pengguna

1. Buka halaman web.
2. Cari game dari search bar di Home.
3. Pilih game dari dropdown hasil pencarian.
4. Baca informasi game di halaman Game Info.
5. Klik `Game Recommendations` untuk melihat rekomendasi.
6. Pilih card rekomendasi di sisi kiri.
7. Lihat detail rekomendasi, alasan kemiripan, overall semantic overlap, spider chart, dan bar kemiripan tag.
8. Klik `View game info` untuk membuka detail game rekomendasi.
9. Gunakan menu `Library` untuk melihat semua game dan filter berdasarkan atribut.

## Contoh Hasil

- `docs/examples/home.png`
- `docs/examples/library.png`
- `docs/examples/game-info.png`
- `docs/examples/recommendations.png`

## Perintah Penting

```bash
pnpm dev              # menjalankan web dan API
pnpm dev:web          # menjalankan frontend saja
pnpm dev:api          # menjalankan backend saja
pnpm build            # build API dan web
pnpm kg:build         # generate ontology dan RDF
pnpm fuseki:reload    # reload ontology + RDF ke Fuseki
```
