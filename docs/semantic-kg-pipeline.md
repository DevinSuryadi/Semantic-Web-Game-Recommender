# Semantic KG Pipeline

Dokumen ini menjelaskan tahap setelah dataset CSV final siap:

1. Generate ontology Turtle/OWL.
2. Buka dan validasi ontology di Protege.
3. Generate RDF/Turtle dari CSV final.
4. Upload ontology dan RDF ke Apache Jena Fuseki.

## Rekomendasi Branch

Gunakan branch:

```bash
feature/semantic-kg-pipeline
```

Nama ini mencakup pekerjaan ontology, RDF triples, dan Fuseki upload.

## Input

Dataset final:

```text
data/curated/gamefeel_dataset.csv
```

CSV harus sudah memiliki kolom:

```text
rawgId,slug,title,released,rating,metacritic,playtime,imageUrl,genres,platforms,developers,publishers,tags,description,mood,theme,gameplayMechanic,gameMode,subGenre,combatStyle,perspective,difficulty,pacing,artStyle,qualityTier
```

Kolom multi-value menggunakan pemisah `|`.

## Generate Ontology

Jalankan:

```bash
pnpm ontology:generate
```

Output:

```text
ontology/gamefeel_ontology.ttl
```

File ini berisi:

- `owl:Class`
- `owl:ObjectProperty`
- `owl:DatatypeProperty`
- `rdfs:domain`
- `rdfs:range`

## Validasi di Protege

Langkah manual:

1. Buka Protege.
2. Pilih `File > Open`.
3. Buka file `ontology/gamefeel_ontology.ttl`.
4. Cek tab `Entities`.
5. Pastikan class seperti `Game`, `Mood`, `Theme`, `Genre`, dan `GameplayMechanic` muncul.
6. Pastikan object property seperti `hasMood`, `hasTheme`, `hasMechanic`, `hasGenre`, dan `availableOn` muncul.

Catatan:
Script ini membuat ontology otomatis dalam format Turtle/OWL yang kompatibel dengan Protege. Protege dipakai untuk validasi dan inspeksi, bukan harus menulis ontology manual dari awal.

## Generate RDF

Jalankan:

```bash
pnpm rdf:generate
```

Output:

```text
rdf/gamefeel_data.ttl
```

RDF ini berisi:

- Instance `gf:Game`.
- Instance resource seperti `gf:Mood`, `gf:Theme`, `gf:Genre`, `gf:Platform`.
- Triple relasi seperti `gf:hasMood`, `gf:hasGenre`, `gf:hasMechanic`.
- Literal seperti `gf:title`, `gf:rating`, `gf:description`, `gf:imageUrl`.

## Build Ontology dan RDF Sekaligus

Jalankan:

```bash
pnpm kg:build
```

Perintah ini menjalankan:

```bash
pnpm ontology:generate
pnpm rdf:generate
```

## Setup Fuseki

Langkah manual:

1. Jalankan Apache Jena Fuseki.
2. Buka `http://localhost:3030`.
3. Buat dataset baru bernama `GameFeel`.
4. Pastikan dataset aktif.

Endpoint default yang dipakai script:

```text
http://localhost:3030/GameFeel/data
```

Jika endpoint berbeda, ubah:

```env
FUSEKI_DATA_ENDPOINT="http://localhost:3030/GameFeel/data"
```

## Upload ke Fuseki

Setelah Fuseki dan dataset `GameFeel` berjalan, jalankan:

```bash
pnpm fuseki:upload
```

Script akan meng-upload:

```text
ontology/gamefeel_ontology.ttl
rdf/gamefeel_data.ttl
```

ke default graph Fuseki.

## Validasi di Fuseki

Buka UI Fuseki dan jalankan query:

```sparql
PREFIX gf: <http://example.org/gamefeel#>

SELECT ?game ?title
WHERE {
  ?game a gf:Game ;
    gf:title ?title .
}
LIMIT 10
```

Jika hasil game muncul, RDF sudah berhasil masuk.

Query cek rekomendasi sederhana:

```sparql
PREFIX gf: <http://example.org/gamefeel#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?candidateTitle ?sharedMood
WHERE {
  ?input a gf:Game ;
    gf:slug "elden-ring" ;
    gf:hasMood ?mood .

  ?candidate a gf:Game ;
    gf:title ?candidateTitle ;
    gf:hasMood ?mood .

  FILTER(?candidate != ?input)

  ?mood rdfs:label ?sharedMood .
}
LIMIT 10
```
