# Tahap Data Awal GameFeel KG

Dokumen ini menjelaskan langkah dari pengambilan data RAWG sampai finalisasi dataset.

## Rekomendasi Branch

Gunakan branch:

```bash
feature/rawg-data-ingestion
```

Nama ini lebih tepat daripada `data-scraping` karena data diambil melalui RAWG API resmi, bukan scraping halaman web.

## Tahap 1 - Persiapan Environment

1. Pastikan berada di branch baru yang dibuat dari `main`.
2. Install dependency.
3. Buat file `.env` dari `.env.example`.
4. Isi `RAWG_API_KEY`.
5. Generate Prisma Client.
6. Push schema Prisma ke SQLite.

## Tahap 2 - Pengambilan Data RAWG

Script `rawg:fetch` melakukan dua mode:

- Jika `RAWG_SEED_SLUGS` diisi, script mengambil detail game berdasarkan slug tersebut.
- Jika `RAWG_SEED_SLUGS` kosong, script mengambil daftar game populer dari RAWG berdasarkan `RAWG_FETCH_PAGES` dan `RAWG_PAGE_SIZE`.

Output:

- Data masuk ke tabel `RawgGame`.
- Snapshot mentah tersimpan di `data/raw/rawg_games.json`.

## Tahap 3 - Cleaning Data

Field yang dipakai sebagai data objektif:

- `rawgId`
- `slug`
- `title`
- `released`
- `rating`
- `metacritic`
- `playtime`
- `description`
- `imageUrl`
- `genres`
- `platforms`
- `developers`
- `publishers`
- `tags`

Data mentah tidak diedit langsung. Cleaning dilakukan ke dataset curated.

## Tahap 4 - Kurasi Atribut Semantik

Tambahkan label manual berdasarkan kamus semantik:

- Mood
- Theme
- GameplayMechanic
- GameMode
- SubGenre
- CombatStyle
- Perspective
- Difficulty
- Pacing
- ArtStyle
- QualityTier
- Tag

## Tahap 5 - Finalisasi Dataset

Dataset final disarankan disimpan sebagai:

```text
data/curated/gamefeel_dataset.csv
```

CSV final harus menggabungkan data objektif RAWG dan label semantik hasil kurasi.

Kolom yang disarankan:

```text
rawgId,slug,title,released,rating,metacritic,playtime,imageUrl,genres,platforms,developers,publishers,tags,mood,theme,gameplayMechanic,gameMode,subGenre,combatStyle,perspective,difficulty,pacing,artStyle,qualityTier
```

Gunakan pemisah `|` untuk kolom multi-value, misalnya:

```text
Action|RPG
Dark|Mysterious|Epic
Open World|Boss Fight|Combat
```

## Tahap Setelah Dataset Final

Setelah dataset final rapi, lanjutkan ke:

1. Desain ontology.
2. Generate RDF/Turtle.
3. Upload ontology dan RDF ke Fuseki.
4. Buat query SPARQL.
5. Integrasi backend dan frontend.
