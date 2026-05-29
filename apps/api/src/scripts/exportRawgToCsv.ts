import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { RawgGameForDataset } from "../rawg/types.js";
import { inferSemanticLabels } from "../semantic/inferLabels.js";

const inputPath = resolve(process.cwd(), "../../data/raw/rawg_games.json");
const outputPath = resolve(process.cwd(), "../../data/curated/gamefeel_dataset.csv");

const headers = [
  "rawgId",
  "slug",
  "title",
  "released",
  "rating",
  "metacritic",
  "playtime",
  "imageUrl",
  "genres",
  "platforms",
  "developers",
  "publishers",
  "tags",
  "description",
  "mood",
  "theme",
  "gameplayMechanic",
  "gameMode",
  "subGenre",
  "combatStyle",
  "perspective",
  "difficulty",
  "pacing",
  "artStyle",
  "qualityTier"
] as const;

type CsvHeader = (typeof headers)[number];
type CsvRow = Record<CsvHeader, string | number | null>;

async function main() {
  const games = await readRawgGames(inputPath);
  const rows = games.map(toCsvRow);
  const csv = toCsv(headers, rows);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, csv, "utf8");

  console.log(`Exported ${rows.length} rows to ${outputPath}`);
}

async function readRawgGames(path: string): Promise<RawgGameForDataset[]> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${path} to contain a JSON array.`);
  }

  return parsed as RawgGameForDataset[];
}

function toCsvRow(game: RawgGameForDataset): CsvRow {
  const labels = inferSemanticLabels(game);

  return {
    rawgId: game.rawgId,
    slug: game.slug,
    title: game.title,
    released: game.released,
    rating: game.rating,
    metacritic: game.metacritic,
    playtime: game.playtime,
    imageUrl: game.imageUrl,
    genres: multiValue(game.genres),
    platforms: multiValue(game.platforms),
    developers: multiValue(game.developers),
    publishers: multiValue(game.publishers),
    tags: multiValue(game.tags),
    description: cleanDescription(game.description),
    mood: multiValue(labels.mood),
    theme: multiValue(labels.theme),
    gameplayMechanic: multiValue(labels.gameplayMechanic),
    gameMode: multiValue(labels.gameMode),
    subGenre: multiValue(labels.subGenre),
    combatStyle: multiValue(labels.combatStyle),
    perspective: multiValue(labels.perspective),
    difficulty: multiValue(labels.difficulty),
    pacing: multiValue(labels.pacing),
    artStyle: multiValue(labels.artStyle),
    qualityTier: multiValue(labels.qualityTier)
  };
}

function toCsv(columns: readonly CsvHeader[], rows: CsvRow[]): string {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ];

  return `${lines.join("\n")}\n`;
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

function multiValue(values: string[]): string {
  return values.join("|");
}

function cleanDescription(value: string | null): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*(Español|Portugu[eê]s|Deutsch|Français|Italiano|Русский|Polski|日本語|한국어|中文)\s*\n[\s\S]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
