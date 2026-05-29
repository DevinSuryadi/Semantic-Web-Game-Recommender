import type { PilotGame, SemanticDimension } from "../semantic/types.js";

export const similarityWeights: Partial<Record<SemanticDimension, number>> = {
  Genre: 3,
  SubGenre: 3,
  Mood: 2,
  Theme: 2,
  GameplayMechanic: 2,
  GameMode: 2,
  CombatStyle: 2,
  Difficulty: 1,
  Pacing: 1,
  Perspective: 1,
  ArtStyle: 1,
  Platform: 1,
  Tag: 1,
  QualityTier: 1
};

export type Recommendation = {
  slug: string;
  title: string;
  score: number;
  reasons: string[];
};

export function recommendBySlug(games: PilotGame[], inputSlug: string): Recommendation[] {
  const input = games.find((game) => game.slug === inputSlug);
  if (!input) {
    throw new Error(`Game with slug "${inputSlug}" was not found.`);
  }

  return games
    .filter((game) => game.slug !== inputSlug)
    .map((game) => scoreGame(input, game))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

function scoreGame(input: PilotGame, candidate: PilotGame): Recommendation {
  const reasons: string[] = [];
  let score = 0;

  for (const [dimension, weight] of Object.entries(similarityWeights)) {
    const sharedValues = intersect(
      input.semantics[dimension as SemanticDimension] ?? [],
      candidate.semantics[dimension as SemanticDimension] ?? []
    );

    for (const value of sharedValues) {
      score += weight ?? 0;
      reasons.push(`${dimension}: ${value}`);
    }
  }

  return {
    slug: candidate.slug,
    title: candidate.title,
    score,
    reasons
  };
}

function intersect(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return [...new Set(left)].filter((value) => rightSet.has(value));
}
