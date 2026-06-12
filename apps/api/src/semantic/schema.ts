export type ClassName =
  | "Game"
  | "Genre"
  | "SubGenre"
  | "Platform"
  | "Developer"
  | "Publisher"
  | "Mood"
  | "Theme"
  | "GameplayMechanic"
  | "GameMode"
  | "CombatStyle"
  | "Perspective"
  | "Difficulty"
  | "Pacing"
  | "ArtStyle"
  | "QualityTier"
  | "Tag";

export type ObjectPropertyName =
  | "hasGenre"
  | "hasSubGenre"
  | "availableOn"
  | "developedBy"
  | "publishedBy"
  | "hasMood"
  | "hasTheme"
  | "hasMechanic"
  | "hasMode"
  | "hasCombatStyle"
  | "hasPerspective"
  | "hasDifficulty"
  | "hasPacing"
  | "hasArtStyle"
  | "hasQualityTier"
  | "hasTag";

export type DatatypePropertyName =
  | "rawgId"
  | "title"
  | "slug"
  | "releaseDate"
  | "rating"
  | "metacriticScore"
  | "playtime"
  | "description"
  | "imageUrl";

export type CsvGame = {
  rawgId: string;
  slug: string;
  title: string;
  released: string;
  rating: string;
  metacritic: string;
  playtime: string;
  imageUrl: string;
  genres: string;
  platforms: string;
  developers: string;
  publishers: string;
  tags: string;
  description: string;
  mood: string;
  theme: string;
  gameplayMechanic: string;
  gameMode: string;
  subGenre: string;
  combatStyle: string;
  perspective: string;
  difficulty: string;
  pacing: string;
  artStyle: string;
  qualityTier: string;
};

export const ontologyClasses: ClassName[] = [
  "Game",
  "Genre",
  "SubGenre",
  "Platform",
  "Developer",
  "Publisher",
  "Mood",
  "Theme",
  "GameplayMechanic",
  "GameMode",
  "CombatStyle",
  "Perspective",
  "Difficulty",
  "Pacing",
  "ArtStyle",
  "QualityTier",
  "Tag"
];

export const objectProperties: Array<{
  name: ObjectPropertyName;
  range: ClassName;
  label: string;
}> = [
  { name: "hasGenre", range: "Genre", label: "has genre" },
  { name: "hasSubGenre", range: "SubGenre", label: "has subgenre" },
  { name: "availableOn", range: "Platform", label: "available on" },
  { name: "developedBy", range: "Developer", label: "developed by" },
  { name: "publishedBy", range: "Publisher", label: "published by" },
  { name: "hasMood", range: "Mood", label: "has mood" },
  { name: "hasTheme", range: "Theme", label: "has theme" },
  { name: "hasMechanic", range: "GameplayMechanic", label: "has mechanic" },
  { name: "hasMode", range: "GameMode", label: "has mode" },
  { name: "hasCombatStyle", range: "CombatStyle", label: "has combat style" },
  { name: "hasPerspective", range: "Perspective", label: "has perspective" },
  { name: "hasDifficulty", range: "Difficulty", label: "has difficulty" },
  { name: "hasPacing", range: "Pacing", label: "has pacing" },
  { name: "hasArtStyle", range: "ArtStyle", label: "has art style" },
  { name: "hasQualityTier", range: "QualityTier", label: "has quality tier" },
  { name: "hasTag", range: "Tag", label: "has tag" }
];

export const datatypeProperties: Array<{
  name: DatatypePropertyName;
  range: string;
  label: string;
}> = [
  { name: "rawgId", range: "xsd:integer", label: "RAWG ID" },
  { name: "title", range: "xsd:string", label: "title" },
  { name: "slug", range: "xsd:string", label: "slug" },
  { name: "releaseDate", range: "xsd:date", label: "release date" },
  { name: "rating", range: "xsd:decimal", label: "rating" },
  { name: "metacriticScore", range: "xsd:integer", label: "metacritic score" },
  { name: "playtime", range: "xsd:integer", label: "playtime" },
  { name: "description", range: "xsd:string", label: "description" },
  { name: "imageUrl", range: "xsd:anyURI", label: "image URL" }
];

export const csvObjectMappings: Array<{
  column: keyof CsvGame;
  property: ObjectPropertyName;
  className: ClassName;
}> = [
  { column: "genres", property: "hasGenre", className: "Genre" },
  { column: "subGenre", property: "hasSubGenre", className: "SubGenre" },
  { column: "platforms", property: "availableOn", className: "Platform" },
  { column: "developers", property: "developedBy", className: "Developer" },
  { column: "publishers", property: "publishedBy", className: "Publisher" },
  { column: "mood", property: "hasMood", className: "Mood" },
  { column: "theme", property: "hasTheme", className: "Theme" },
  { column: "gameplayMechanic", property: "hasMechanic", className: "GameplayMechanic" },
  { column: "gameMode", property: "hasMode", className: "GameMode" },
  { column: "combatStyle", property: "hasCombatStyle", className: "CombatStyle" },
  { column: "perspective", property: "hasPerspective", className: "Perspective" },
  { column: "difficulty", property: "hasDifficulty", className: "Difficulty" },
  { column: "pacing", property: "hasPacing", className: "Pacing" },
  { column: "artStyle", property: "hasArtStyle", className: "ArtStyle" },
  { column: "qualityTier", property: "hasQualityTier", className: "QualityTier" },
  { column: "tags", property: "hasTag", className: "Tag" }
];
