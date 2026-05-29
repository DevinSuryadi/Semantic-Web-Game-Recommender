import type { RawgGameDetail, RawgGameSummary, RawgListResponse } from "./types.js";

const rawgBaseUrl = "https://api.rawg.io/api";

export type RawgClientOptions = {
  apiKey: string;
};

export class RawgClient {
  constructor(private readonly options: RawgClientOptions) {}

  async getPopularGames(page: number, pageSize: number): Promise<RawgListResponse<RawgGameSummary>> {
    const params = new URLSearchParams({
      key: this.options.apiKey,
      page: String(page),
      page_size: String(pageSize),
      ordering: "-added" 
    });

    return this.getJson<RawgListResponse<RawgGameSummary>>(`/games?${params}`);
  }

  async getGameDetail(slug: string): Promise<RawgGameDetail> {
    const params = new URLSearchParams({
      key: this.options.apiKey
    });

    return this.getJson<RawgGameDetail>(`/games/${encodeURIComponent(slug)}?${params}`);
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${rawgBaseUrl}${path}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`RAWG request failed (${response.status}): ${message}`);
    }

    return response.json() as Promise<T>;
  }
}
