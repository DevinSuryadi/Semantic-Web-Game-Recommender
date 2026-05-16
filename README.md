# GameFeel KG

GameFeel adalah sistem rekomendasi game berbasis Semantic Web. Data RAWG disimpan dulu ke staging lokal dengan Prisma, lalu dinormalisasi menjadi RDF/Turtle untuk di-query melalui Apache Jena Fuseki.

## Struktur

- `apps/web`: frontend React + TypeScript + Vite.
- `apps/api`: backend Express + TypeScript, Prisma, layanan RAWG, dan layanan SPARQL.
- `ontology`: ontology Turtle/OWL.
- `rdf`: hasil generate RDF/Turtle.
- `sparql`: query SPARQL untuk search, detail, dan rekomendasi.

## Setup Awal

1. Salin `.env.example` menjadi `.env` di root atau `apps/api/.env`.
2. Isi `RAWG_API_KEY` bila sudah siap mengambil data dari RAWG.
3. Jalankan instalasi dependency:

```bash
pnpm install
```

4. Generate Prisma Client:

```bash
pnpm db:generate
```

5. Jalankan development server:

```bash
pnpm dev
```

Frontend berjalan di Vite, sedangkan API berjalan pada port `3000` secara default.
