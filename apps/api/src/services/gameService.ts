import { runSelectQuery, type SparqlBinding } from "../sparql/client.js";
import {
  buildGameDetailQuery,
  buildRecommendationsQuery,
  buildSearchGamesQuery
} from "../sparql/queries.js";

export type GameSearchResult = {
  iri: string;
  title: string;
  slug: string;
};

export type GameDetail = GameSearchResult & {
  properties: Array<{
    predicate: string;
    name: string;
    value: string;
  }>;
};

export type GameRecommendation = GameSearchResult & {
  score: number;
  reasons: string[];
};

export async function searchGames(searchTerm: string): Promise<GameSearchResult[]> {
  const result = await runSelectQuery(buildSearchGamesQuery(searchTerm));
  return result.results.bindings.map(toGameSearchResult);
}

export async function getGameDetail(slug: string): Promise<GameDetail | null> {
  const result = await runSelectQuery(buildGameDetailQuery(slug));
  const [first] = result.results.bindings;

  if (!first) {
    return null;
  }

  return {
    ...toGameSearchResult(first),
    properties: result.results.bindings.map((binding) => {
      const predicate = requiredValue(binding, "predicate");
      return {
        predicate,
        name: readablePredicate(predicate),
        value: requiredValue(binding, "valueLabel")
      };
    })
  };
}

export async function getRecommendations(slug: string): Promise<GameRecommendation[]> {
  const result = await runSelectQuery(buildRecommendationsQuery(slug));

  return result.results.bindings.map((binding) => ({
    ...toGameSearchResult(binding),
    score: Number(requiredValue(binding, "score")),
    reasons: requiredValue(binding, "reasons")
      .split(", ")
      .filter(Boolean)
  }));
}

function toGameSearchResult(binding: SparqlBinding): GameSearchResult {
  return {
    iri: requiredValue(binding, "game"),
    title: requiredValue(binding, "title"),
    slug: requiredValue(binding, "slug")
  };
}

function requiredValue(binding: SparqlBinding, key: string): string {
  const value = binding[key]?.value;

  if (value === undefined) {
    throw new Error(`Missing SPARQL binding: ${key}`);
  }

  return value;
}

function readablePredicate(predicate: string): string {
  const localName = predicate.includes("#")
    ? predicate.split("#").at(-1)
    : predicate.split("/").at(-1);

  return localName ?? predicate;
}
