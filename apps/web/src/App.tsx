import { FormEvent, useEffect, useMemo, useState } from "react";

type ApiResponse<T> = {
  data: T;
};

type GameSearchResult = {
  iri: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  genres: string[];
};

type GameProperty = {
  predicate: string;
  name: string;
  value: string;
};

type GameDetail = GameSearchResult & {
  properties: GameProperty[];
};

type GameRecommendation = GameSearchResult & {
  score: number;
  reasons: string[];
};

type PropertyGroup = {
  name: string;
  values: string[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

const semanticOrder = [
  "Genre",
  "SubGenre",
  "Mood",
  "Theme",
  "Gameplay Mechanic",
  "Game Mode",
  "Combat Style",
  "Perspective",
  "Difficulty",
  "Pacing",
  "Art Style",
  "Platform",
  "Quality Tier",
  "Tag"
];

const metadataOrder = ["Developer", "Publisher", "Release Date", "Rating", "Metacritic", "Playtime"];

export function App() {
  const [query, setQuery] = useState("elden");
  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("elden-ring");
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const semanticGroups = useMemo(
    () => groupProperties(detail?.properties ?? [], semanticOrder),
    [detail]
  );

  const metadataGroups = useMemo(
    () => groupProperties(detail?.properties ?? [], metadataOrder),
    [detail]
  );

  const activeRecommendation = recommendations[activeRecommendationIndex] ?? recommendations[0];
  const featuredGame = activeRecommendation ?? detail;

  async function searchGames(searchValue = query) {
    setIsSearching(true);
    setError(null);

    try {
      const response = await getJson<ApiResponse<GameSearchResult[]>>(
        `${apiBaseUrl}/games/search?q=${encodeURIComponent(searchValue)}`
      );

      setGames(response.data);
      if (response.data[0]) {
        setSelectedSlug(response.data[0].slug);
      }
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsSearching(false);
    }
  }

  async function loadGame(slug: string) {
    setIsLoadingDetail(true);
    setError(null);

    try {
      const [detailResponse, recommendationResponse] = await Promise.all([
        getJson<ApiResponse<GameDetail>>(`${apiBaseUrl}/games/${slug}`),
        getJson<ApiResponse<GameRecommendation[]>>(`${apiBaseUrl}/games/${slug}/recommendations`)
      ]);

      setDetail(detailResponse.data);
      setRecommendations(recommendationResponse.data);
      setActiveRecommendationIndex(0);
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchGames();
  }

  function moveRecommendation(direction: -1 | 1) {
    if (recommendations.length === 0) {
      return;
    }

    setActiveRecommendationIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0) {
        return recommendations.length - 1;
      }
      if (nextIndex >= recommendations.length) {
        return 0;
      }
      return nextIndex;
    });
  }

  useEffect(() => {
    void searchGames("elden");
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      void loadGame(selectedSlug);
    }
  }, [selectedSlug]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon" aria-hidden="true">
            +
          </span>
          <span>GameFeel</span>
        </div>

        <form className="top-search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for games"
            aria-label="Search for games"
          />
        </form>
      </header>

      {error && <p className="notice error">{error}</p>}

      <section className="hero-panel">
        <button
          className="hero-arrow left"
          type="button"
          aria-label="Previous recommendation"
          onClick={() => moveRecommendation(-1)}
        >
          ‹
        </button>

        <div className="hero-media">
          <p>Recommendations</p>
          <div className={featuredGame?.imageUrl ? "image-placeholder large has-image" : "image-placeholder large"}>
            {featuredGame?.imageUrl ? (
              <img src={featuredGame.imageUrl} alt={featuredGame.title} />
            ) : (
              <span>Thumbnail Game</span>
            )}
          </div>
          <div className="hero-tags">
            {activeRecommendation?.reasons.slice(0, 3).map((reason) => (
              <span key={reason}>{reason.split(": ").at(-1) ?? reason}</span>
            ))}
          </div>
        </div>

        <aside className="hero-info">
          <h1>{featuredGame?.title ?? "Game Title"}</h1>
          <strong>{getSingleValue(detail?.properties ?? [], "Developer") || "Developer"}</strong>
          <strong>{getSingleValue(detail?.properties ?? [], "Publisher") || "Publisher"}</strong>
          <strong>Rating: {featuredGame?.rating?.toFixed(2) ?? "-"}</strong>
        </aside>

        <button
          className="hero-arrow right"
          type="button"
          aria-label="Next recommendation"
          onClick={() => moveRecommendation(1)}
        >
          ›
        </button>
      </section>

      <section className="content-layout">
        <aside className="search-panel">
          <h2>Hasil Pencarian</h2>
          <div className="result-list">
            {games.map((game) => (
              <button
                className={game.slug === selectedSlug ? "result-card active" : "result-card"}
                key={game.slug}
                type="button"
                onClick={() => setSelectedSlug(game.slug)}
              >
                <strong>{game.title}</strong>
                <span>{game.genres.join(" / ") || game.slug}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="detail-panel">
          <div className="detail-heading">
            <div>
              <h2>{detail?.title ?? "Game Title"}</h2>
              <p>{detail ? getSingleValue(detail.properties, "Deskripsi") : "Deskripsi game"}</p>
            </div>
            <div className="score-card">
              <strong>{detail?.rating?.toFixed(1) ?? "-"}</strong>
              <span>RAWG</span>
            </div>
          </div>

          {isLoadingDetail && <p className="notice loading">Memuat data dari SPARQL...</p>}

          <div className="detail-body">
            <div className={detail?.imageUrl ? "image-placeholder small has-image" : "image-placeholder small"}>
              {detail?.imageUrl ? <img src={detail.imageUrl} alt={detail.title} /> : <span>Thumbnail Game</span>}
            </div>

            <div className="category-grid top-categories">
              {semanticGroups.slice(0, 4).map((group) => (
                <CategoryCard group={group} key={group.name} />
              ))}
            </div>
          </div>

          <div className="category-grid lower-categories">
            {semanticGroups.slice(4).map((group) => (
              <CategoryCard group={group} key={group.name} />
            ))}
          </div>

          <div className="metadata-grid">
            {metadataGroups.map((group) => (
              <section className="metadata-card" key={group.name}>
                <span>{group.name}</span>
                <strong>{group.values.join(", ") || "-"}</strong>
              </section>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function CategoryCard({ group }: { group: PropertyGroup }) {
  return (
    <section className="category-card">
      <h3>{group.name}</h3>
      <div className="chips">
        {group.values.slice(0, 5).map((value) => (
          <span className="chip" key={`${group.name}-${value}`}>
            {value}
          </span>
        ))}
        {group.values.length === 0 && <span className="chip muted">-</span>}
      </div>
    </section>
  );
}

function groupProperties(properties: GameProperty[], order: string[]): PropertyGroup[] {
  return order.map((name) => ({
    name,
    values: unique(properties.filter((property) => property.name === name).map((property) => property.value))
  }));
}

function getSingleValue(properties: GameProperty[], name: string): string {
  return properties.find((property) => property.name === name)?.value ?? "";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request gagal (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}
