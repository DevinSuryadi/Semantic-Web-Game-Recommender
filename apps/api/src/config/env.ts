import "dotenv/config";

export const env = {
  databaseUrl: requiredEnv("DATABASE_URL"),
  rawgApiKey: requiredEnv("RAWG_API_KEY"),
  rawgPageSize: numberEnv("RAWG_PAGE_SIZE", 20),
  rawgFetchPages: numberEnv("RAWG_FETCH_PAGES", 1),
  rawgSeedSlugs: listEnv("RAWG_SEED_SLUGS")
};

function requiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function numberEnv(key: string, fallback: number): number {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer.`);
  }

  return parsed;
}

function listEnv(key: string): string[] {
  return (process.env[key] ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
