# GameFeel Dataset

Folder ini dipakai untuk memisahkan data mentah dari data hasil kurasi.

## Struktur

- `raw/rawg_games.json`: hasil pengambilan data objektif dari RAWG API.
- `curated/gamefeel_dataset.csv`: dataset final setelah data RAWG dibersihkan dan diberi label semantik manual.

## Alur Data

1. Ambil data objektif dari RAWG API.
2. Simpan data mentah ke Prisma dan `data/raw/rawg_games.json`.
3. Bersihkan field yang diperlukan untuk dataset final.
4. Tambahkan atribut semantik manual: mood, theme, mechanic, mode, subgenre, combat style, perspective, difficulty, pacing, art style, dan quality tier.
5. Simpan dataset final ke `data/curated/gamefeel_dataset.csv`.

## Catatan

RAWG adalah sumber data objektif. Atribut seperti mood dan feel tetap perlu kurasi manual karena bersifat interpretatif dan tidak selalu tersedia langsung dari RAWG.
