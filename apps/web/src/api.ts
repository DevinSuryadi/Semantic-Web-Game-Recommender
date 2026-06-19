import type { ApiResponse, GameDetail, GameRecommendation, GameSearchResult } from "./types.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function fetchGames(searchTerm: string, limit: number): Promise<GameSearchResult[]> {
  const response = await getJson<ApiResponse<GameSearchResult[]>>(
    `${apiBaseUrl}/games/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
  );

  return response.data;
}

export async function fetchGameDetail(slug: string): Promise<GameDetail> {
  const response = await getJson<ApiResponse<GameDetail>>(`${apiBaseUrl}/games/${slug}`);
  return response.data;
}

export async function fetchRecommendations(slug: string): Promise<GameRecommendation[]> {
  const response = await getJson<ApiResponse<GameRecommendation[]>>(
    `${apiBaseUrl}/games/${slug}/recommendations`
  );

  return response.data;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request gagal (${response.status})`);
  }

  return response.json() as Promise<T>;
}
