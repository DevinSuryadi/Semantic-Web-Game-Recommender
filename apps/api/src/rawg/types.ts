export type RawgListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RawgNamedResource = {
  id: number;
  name: string;
  slug?: string;
};

export type RawgPlatformEntry = {
  platform: RawgNamedResource;
};

export type RawgDeveloper = RawgNamedResource;

export type RawgPublisher = RawgNamedResource;

export type RawgTag = RawgNamedResource & {
  language?: string;
};

export type RawgGameSummary = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  rating: number | null;
  metacritic: number | null;
  playtime: number | null;
  background_image: string | null;
  genres: RawgNamedResource[];
  platforms: RawgPlatformEntry[];
  tags: RawgTag[];
};

export type RawgGameDetail = RawgGameSummary & {
  description_raw: string | null;
  developers: RawgDeveloper[];
  publishers: RawgPublisher[];
};

export type RawgGameForDataset = {
  rawgId: number;
  slug: string;
  title: string;
  released: string | null;
  rating: number | null;
  metacritic: number | null;
  playtime: number | null;
  description: string | null;
  imageUrl: string | null;
  genres: string[];
  platforms: string[];
  developers: string[];
  publishers: string[];
  tags: string[];
  raw: RawgGameDetail;
};
