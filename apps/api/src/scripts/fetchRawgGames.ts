import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { RawgClient } from "../rawg/client.js";
import { normalizeRawgGame } from "../rawg/normalize.js";
import type { RawgGameForDataset } from "../rawg/types.js";

const prisma = new PrismaClient();
const rawOutputPath = resolve(process.cwd(), "../../data/raw/rawg_games.json");

async function main() {
  const rawg = new RawgClient({ apiKey: env.rawgApiKey });
  const slugs = env.rawgSeedSlugs.length > 0
    ? env.rawgSeedSlugs
    : await fetchPopularSlugs(rawg);

  const games: RawgGameForDataset[] = [];

  for (const slug of unique(slugs)) {
    console.log(`Fetching RAWG detail: ${slug}`);
    const detail = await rawg.getGameDetail(slug);
    const normalized = normalizeRawgGame(detail);
    games.push(normalized);
    await upsertRawgGame(normalized);
  }

  await writeJson(rawOutputPath, games);
  console.log(`Saved ${games.length} games to Prisma and ${rawOutputPath}`);
}

async function fetchPopularSlugs(rawg: RawgClient): Promise<string[]> {
  const slugs: string[] = [];

  for (let page = 1; page <= env.rawgFetchPages; page += 1) {
    console.log(`Fetching RAWG popular page ${page}`);
    const response = await rawg.getPopularGames(page, env.rawgPageSize);
    slugs.push(...response.results.map((game) => game.slug));
  }

  return slugs;
}

async function upsertRawgGame(game: RawgGameForDataset) {
  await prisma.rawgGame.upsert({
    where: {
      rawgId: game.rawgId
    },
    create: toPrismaRawgGame(game),
    update: toPrismaRawgGame(game)
  });
}

function toPrismaRawgGame(game: RawgGameForDataset) {
  return {
    rawgId: game.rawgId,
    slug: game.slug,
    title: game.title,
    released: game.released ? new Date(game.released) : null,
    rating: game.rating,
    metacritic: game.metacritic,
    playtime: game.playtime,
    description: game.description,
    imageUrl: game.imageUrl,
    genresJson: JSON.stringify(game.genres),
    platformsJson: JSON.stringify(game.platforms),
    developersJson: JSON.stringify(game.developers),
    publishersJson: JSON.stringify(game.publishers),
    tagsJson: JSON.stringify(game.tags),
    rawJson: JSON.stringify(game.raw)
  };
}

async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
