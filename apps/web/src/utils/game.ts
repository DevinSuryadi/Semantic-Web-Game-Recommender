import type { GameProperty, GameSearchResult, LibraryFilters, PropertyGroup } from "../types.js";

export function groupProperties(properties: GameProperty[], order: string[]): PropertyGroup[] {
  return order.map((name) => ({
    name,
    values: unique(properties.filter((property) => property.name === name).map((property) => property.value))
  }));
}

export function getSingleValue(properties: GameProperty[], name: string): string {
  return properties.find((property) => property.name === name)?.value ?? "";
}

export function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function sortDifficulties(values: string[]): string[] {
  const order = ["Easy", "Medium", "Hard", "Very Hard"];
  return values.sort((left, right) => {
    const leftIndex = order.indexOf(left);
    const rightIndex = order.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

export function shorten(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

export function primaryGenre(game: GameSearchResult): string {
  return game.genres[0] ?? "";
}

export function releaseYear(releaseDate?: string): string {
  return releaseDate?.slice(0, 4) || "-";
}

export function emptyLibraryFilters(): LibraryFilters {
  return {
    genres: [],
    subGenres: [],
    platforms: [],
    difficulties: [],
    ratingStars: 0,
    minYear: "",
    maxYear: ""
  };
}

export function getActiveFilterLabels(filters: LibraryFilters): string[] {
  return [
    ...filters.genres,
    ...filters.subGenres,
    ...filters.platforms,
    ...filters.difficulties,
    filters.ratingStars > 0 ? `Rating >= ${filters.ratingStars} star` : "",
    filters.minYear ? `Year >= ${filters.minYear}` : "",
    filters.maxYear ? `Year <= ${filters.maxYear}` : ""
  ].filter(Boolean);
}

export function matchesLibraryFilters(game: GameSearchResult, filters: LibraryFilters): boolean {
  const rating = game.rating;
  const year = Number(releaseYear(game.releaseDate));

  return (
    matchesAny(game.genres, filters.genres) &&
    matchesAny(game.subGenres, filters.subGenres) &&
    matchesAny(game.platforms, filters.platforms) &&
    matchesAny(game.difficulties, filters.difficulties) &&
    (filters.ratingStars === 0 || (rating !== undefined && rating >= filters.ratingStars)) &&
    matchesMinMax(Number.isNaN(year) ? undefined : year, filters.minYear, filters.maxYear)
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}

function matchesAny(values: string[], selected: string[]): boolean {
  return selected.length === 0 || selected.some((value) => values.includes(value));
}

function matchesMinMax(value: number | undefined, minValue: string, maxValue: string): boolean {
  const min = parseOptionalNumber(minValue);
  const max = parseOptionalNumber(maxValue);

  if (min === undefined && max === undefined) {
    return true;
  }

  if (value === undefined) {
    return false;
  }

  return (min === undefined || value >= min) && (max === undefined || value <= max);
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
