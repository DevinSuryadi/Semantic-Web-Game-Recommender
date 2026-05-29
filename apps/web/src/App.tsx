import { FormEvent, useEffect, useState } from "react";

type ApiResponse<T> = {
  data: T;
};

type GameSearchResult = {
  iri: string;
  title: string;
  slug: string;
};

type GameDetail = GameSearchResult & {
  properties: Array<{
    predicate: string;
    name: string;
    value: string;
  }>;
};

type GameRecommendation = GameSearchResult & {
  score: number;
  reasons: string[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function App() {
  const [query, setQuery] = useState("elden");
  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("elden-ring");
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchGames(searchQuery = query) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getJson<ApiResponse<GameSearchResult[]>>(
        `${apiBaseUrl}/games/search?q=${encodeURIComponent(searchQuery)}`
      );
      setGames(response.data);

      if (response.data[0]) {
        setSelectedSlug(response.data[0].slug);
      }
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadGame(slug: string) {
    setIsLoading(true);
    setError(null);

    try {
      const [detailResponse, recommendationResponse] = await Promise.all([
        getJson<ApiResponse<GameDetail>>(`${apiBaseUrl}/games/${slug}`),
        getJson<ApiResponse<GameRecommendation[]>>(`${apiBaseUrl}/games/${slug}/recommendations`)
      ]);

      setDetail(detailResponse.data);
      setRecommendations(recommendationResponse.data);
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchGames();
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
      <section className="toolbar">
        <div>
          <h1>GameFeel</h1>
          <p>Sistem rekomendasi game berbasis RDF, ontology, Fuseki, dan SPARQL.</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari game..."
            aria-label="Cari game"
          />
          <button type="submit">Cari</button>
        </form>
      </section>

      {error && <p className="error">{error}</p>}
      {isLoading && <p className="loading">Memuat data...</p>}

      <section className="content-grid">
        <aside className="panel">
          <h2>Hasil Pencarian</h2>
          <div className="result-list">
            {games.map((game) => (
              <button
                className={game.slug === selectedSlug ? "result active" : "result"}
                key={game.slug}
                type="button"
                onClick={() => setSelectedSlug(game.slug)}
              >
                <span>{game.title}</span>
                <small>{game.slug}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel detail-panel">
          <h2>{detail?.title ?? "Detail Game"}</h2>
          {detail ? (
            <table>
              <tbody>
                {detail.properties.map((property, index) => (
                  <tr key={`${property.predicate}-${property.value}-${index}`}>
                    <th>{property.name}</th>
                    <td>{property.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Pilih game untuk melihat detail.</p>
          )}
        </section>

        <section className="panel recommendation-panel">
          <h2>Rekomendasi</h2>
          <div className="recommendation-list">
            {recommendations.map((recommendation) => (
              <article className="recommendation" key={recommendation.slug}>
                <div className="recommendation-header">
                  <h3>{recommendation.title}</h3>
                  <strong>{recommendation.score}</strong>
                </div>
                <p>{recommendation.reasons.join("; ")}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
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
