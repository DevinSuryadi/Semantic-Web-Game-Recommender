import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { tenPilotGames } from "../data/tenGames.js";
import { buildSemanticMappings } from "../semantic/mapping.js";

const prisma = new PrismaClient();

async function main() {
  for (const game of tenPilotGames) {
    await prisma.rawgGame.upsert({
      where: { rawgId: game.rawgId },
      create: {
        rawgId: game.rawgId,
        slug: game.slug,
        title: game.title,
        released: new Date(game.released),
        rating: game.rating,
        metacritic: game.metacritic,
        playtime: game.playtime,
        description: game.description,
        imageUrl: game.imageUrl,
        genresJson: JSON.stringify(game.genres),
        platformsJson: JSON.stringify(game.platforms),
        developersJson: JSON.stringify(game.developers),
        publishersJson: JSON.stringify(game.publishers),
        tagsJson: JSON.stringify(game.tags)
      },
      update: {
        slug: game.slug,
        title: game.title,
        released: new Date(game.released),
        rating: game.rating,
        metacritic: game.metacritic,
        playtime: game.playtime,
        description: game.description,
        imageUrl: game.imageUrl,
        genresJson: JSON.stringify(game.genres),
        platformsJson: JSON.stringify(game.platforms),
        developersJson: JSON.stringify(game.developers),
        publishersJson: JSON.stringify(game.publishers),
        tagsJson: JSON.stringify(game.tags)
      }
    });

    await prisma.semanticMapping.deleteMany({
      where: { gameRawgId: game.rawgId }
    });

    await prisma.semanticMapping.createMany({
      data: buildSemanticMappings(game).map((mapping) => ({
        gameRawgId: game.rawgId,
        dimension: mapping.dimension,
        value: mapping.value,
        source: mapping.source,
        confidence: mapping.confidence,
        evidence: mapping.evidence
      }))
    });
  }

  console.log(`Seeded ${tenPilotGames.length} pilot games.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
