export type SemanticDimension =
  | "Genre"
  | "SubGenre"
  | "Mood"
  | "Theme"
  | "GameplayMechanic"
  | "GameMode"
  | "CombatStyle"
  | "Perspective"
  | "Difficulty"
  | "Pacing"
  | "ArtStyle"
  | "Platform"
  | "QualityTier"
  | "Tag";

export type SemanticProfile = Partial<Record<SemanticDimension, string[]>>;

export type PilotGame = {
  rawgId: number;
  slug: string;
  title: string;
  released: string;
  rating: number;
  metacritic?: number;
  playtime: number;
  description: string;
  imageUrl?: string;
  genres: string[];
  platforms: string[];
  developers: string[];
  publishers: string[];
  tags: string[];
  semantics: SemanticProfile;
};

export type SemanticMappingInput = {
  dimension: SemanticDimension;
  value: string;
  source: "manual-pilot" | "rawg-tag" | "genre-inference" | "description-inference";
  confidence: number;
  evidence: string;
};
