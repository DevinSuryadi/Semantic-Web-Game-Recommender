import type { RawgGameDetail, RawgGameForDataset } from "./types.js";

export function normalizeRawgGame(game: RawgGameDetail): RawgGameForDataset {
  return {
    rawgId: game.id,
    slug: game.slug,
    title: game.name,
    released: game.released,
    rating: game.rating,
    metacritic: game.metacritic,
    playtime: game.playtime,
    description: game.description_raw,
    imageUrl: game.background_image,
    genres: game.genres.map((genre) => genre.name),
    platforms: game.platforms.map((entry) => entry.platform.name),
    developers: game.developers.map((developer) => developer.name),
    publishers: game.publishers.map((publisher) => publisher.name),
    tags: game.tags
      .filter((tag) => tag.language === undefined || tag.language === "eng")
      .map((tag) => tag.name),
    raw: game
  };
}
