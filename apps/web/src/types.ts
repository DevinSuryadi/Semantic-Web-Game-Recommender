export type ApiResponse<T> = {
  data: T;
};

export type Page = "home" | "library" | "detail" | "recommendations";

export type GameSearchResult = {
  iri: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  releaseDate?: string;
  rating?: number;
  genres: string[];
  subGenres: string[];
  platforms: string[];
  difficulties: string[];
};

export type GameProperty = {
  predicate: string;
  name: string;
  value: string;
};

export type GameDetail = GameSearchResult & {
  properties: GameProperty[];
};

export type GameRecommendation = GameSearchResult & {
  score: number;
  reasons: string[];
};

export type PropertyGroup = {
  name: string;
  values: string[];
};

export type LibraryFilters = {
  genres: string[];
  subGenres: string[];
  platforms: string[];
  difficulties: string[];
  ratingStars: number;
  minYear: string;
  maxYear: string;
};
