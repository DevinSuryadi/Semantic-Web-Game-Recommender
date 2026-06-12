import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ApiResponse<T> = {
  data: T;
};

type Page = "home" | "library" | "detail" | "recommendations";

type GameSearchResult = {
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

type LibraryFilters = {
  genres: string[];
  subGenres: string[];
  platforms: string[];
  difficulties: string[];
  ratingStars: number;
  minYear: string;
  maxYear: string;
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
  const [page, setPage] = useState<Page>("home");
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [libraryGames, setLibraryGames] = useState<GameSearchResult[]>([]);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const semanticGroups = useMemo(
    () => groupProperties(detail?.properties ?? [], semanticOrder),
    [detail]
  );

  const metadataGroups = useMemo(
    () => groupProperties(detail?.properties ?? [], metadataOrder),
    [detail]
  );

  useEffect(() => {
    const searchTerm = query.trim();

    if (page !== "home" || searchTerm.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setHasSubmittedSearch(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setError(null);

      void fetchGames(searchTerm, 20)
        .then((results) => {
          if (!isCancelled) {
            setSearchResults(results);
            setHasSearched(true);
          }
        })
        .catch((currentError: unknown) => {
          if (!isCancelled) {
            setError(getErrorMessage(currentError));
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsSearching(false);
          }
        });
    }, 260);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [page, query]);

  async function handleHomeSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await fetchGames(query, 8);
      setSearchResults(results);
      setHasSearched(true);
      setHasSubmittedSearch(true);

      if (results.length === 1) {
        await openGameInfo(results[0].slug);
      }
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsSearching(false);
    }
  }

  async function openLibrary(forceRefresh = false) {
    setPage("library");
    setError(null);

    if (!forceRefresh && libraryGames.length > 0) {
      return;
    }

    setIsLoadingLibrary(true);
    try {
      setLibraryGames(await fetchGames("", 100));
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoadingLibrary(false);
    }
  }

  async function openGameInfo(slug: string) {
    setPage("detail");
    setError(null);
    setIsLoadingDetail(true);

    try {
      const response = await getJson<ApiResponse<GameDetail>>(`${apiBaseUrl}/games/${slug}`);
      setDetail(response.data);
      setRecommendations([]);
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function openRecommendations() {
    if (!detail) {
      return;
    }

    setPage("recommendations");
    setError(null);
    setIsLoadingRecommendations(true);

    try {
      const response = await getJson<ApiResponse<GameRecommendation[]>>(
        `${apiBaseUrl}/games/${detail.slug}/recommendations`
      );
      setRecommendations(response.data);
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoadingRecommendations(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setPage("home")}>
          <span className="brand-icon" aria-hidden="true">
            +
          </span>
          <span>GameFeel</span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          <button className={page === "home" ? "active" : ""} type="button" onClick={() => setPage("home")}>
            Home
          </button>
          <button className={page === "library" ? "active" : ""} type="button" onClick={() => void openLibrary()}>
            Library
          </button>
        </nav>
      </header>

      {error && <p className="notice error">{error}</p>}

      {page === "home" && (
        <HomePage
          isSearching={isSearching}
          hasSearched={hasSearched}
          hasSubmittedSearch={hasSubmittedSearch}
          query={query}
          results={searchResults}
          setQuery={(value) => {
            setQuery(value);
            setSearchResults([]);
            setHasSearched(false);
            setHasSubmittedSearch(false);
          }}
          onSearch={handleHomeSearch}
          onSelectGame={(slug) => void openGameInfo(slug)}
        />
      )}

      {page === "library" && (
        <LibraryPage
          games={libraryGames}
          isLoading={isLoadingLibrary}
          onRefresh={() => {
            setLibraryGames([]);
            void openLibrary(true);
          }}
          onSelectGame={(slug) => void openGameInfo(slug)}
        />
      )}

      {page === "detail" && (
        <GameInfoPage
          detail={detail}
          isLoading={isLoadingDetail}
          metadataGroups={metadataGroups}
          semanticGroups={semanticGroups}
          onOpenRecommendations={() => void openRecommendations()}
        />
      )}

      {page === "recommendations" && (
        <RecommendationsPage
          game={detail}
          isLoading={isLoadingRecommendations}
          recommendations={recommendations}
          onBackToInfo={() => setPage("detail")}
          onSelectGame={(slug) => void openGameInfo(slug)}
        />
      )}
    </main>
  );
}

function HomePage({
  isSearching,
  hasSearched,
  hasSubmittedSearch,
  onSearch,
  onSelectGame,
  query,
  results,
  setQuery
}: {
  isSearching: boolean;
  hasSearched: boolean;
  hasSubmittedSearch: boolean;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSelectGame: (slug: string) => void;
  query: string;
  results: GameSearchResult[];
  setQuery: (value: string) => void;
}) {
  return (
    <section className="home-page">
      <div className="home-content">
        <p className="eyebrow">Semantic Web Game Recommender</p>
        <h1>Cari game yang kamu suka.</h1>
        <p className="home-copy">
          GameFeel membaca data RDF lewat SPARQL, lalu menjelaskan kemiripan game berdasarkan mood, theme, mechanic,
          genre, dan atribut semantic lainnya.
        </p>

        <div className="home-search-area">
          <form className="search-box" onSubmit={onSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: elden ring"
              aria-label="Cari game"
            />
            <button type="submit">{isSearching ? "Mencari..." : "Search"}</button>
          </form>

          {!hasSubmittedSearch && query.trim().length >= 2 && results.length > 0 && (
            <div className="suggestion-dropdown">
              {results.map((game, index) => (
                <button className="suggestion-item" key={game.slug} type="button" onClick={() => onSelectGame(game.slug)}>
                  <GameMedia game={game} size="tiny" />
                  <span>
                    <strong>{game.title}</strong>
                    <small>{primaryGenre(game) || game.slug}</small>
                  </span>
                  {index === 0 && <em>Top result</em>}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasSubmittedSearch && results.length > 1 && (
          <section className="search-results">
            <h2>Hasil pencarian</h2>
            <div className="game-grid compact">
              {results.map((game) => (
                <GameCard game={game} key={game.slug} onSelect={onSelectGame} />
              ))}
            </div>
          </section>
        )}

        {hasSearched && !isSearching && results.length === 0 && (
          <p className="empty-state">Belum ada hasil. Coba judul game lain.</p>
        )}
      </div>
    </section>
  );
}

function LibraryPage({
  games,
  isLoading,
  onRefresh,
  onSelectGame
}: {
  games: GameSearchResult[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectGame: (slug: string) => void;
}) {
  const [libraryQuery, setLibraryQuery] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [filters, setFilters] = useState<LibraryFilters>({
    genres: [],
    subGenres: [],
    platforms: [],
    difficulties: [],
    ratingStars: 0,
    minYear: "",
    maxYear: ""
  });

  const filterOptions = useMemo(() => {
    return {
      genres: unique(games.flatMap((game) => game.genres)).slice(0, 14),
      subGenres: unique(games.flatMap((game) => game.subGenres)).slice(0, 14),
      platforms: unique(games.flatMap((game) => game.platforms)).slice(0, 14),
      difficulties: sortDifficulties(unique(games.flatMap((game) => game.difficulties))).slice(0, 8)
    };
  }, [games]);

  const visibleGames = useMemo(() => {
    return games.filter((game) => matchesLibraryFilters(game, filters));
  }, [filters, games]);

  const librarySuggestions = useMemo(() => {
    const searchTerm = libraryQuery.trim().toLowerCase();
    if (searchTerm.length < 2) {
      return [];
    }

    return games.filter((game) =>
      [game.title, game.slug, ...game.genres, ...game.subGenres, ...game.platforms].some((value) =>
        value.toLowerCase().includes(searchTerm)
      )
    );
  }, [games, libraryQuery]);

  const activeFilterLabels = getActiveFilterLabels(filters);

  return (
    <section className={isFilterVisible ? "page-section library-section" : "page-section library-section filters-collapsed"}>
      {isFilterVisible && <aside className="library-filter-panel">
        <div className="filter-panel-heading">
          <div>
            <p className="eyebrow">Filters</p>
            <h2>Refine library</h2>
          </div>
          <div className="filter-panel-actions">
            <button className="panel-toggle-button" type="button" onClick={() => setIsFilterVisible(false)}>
              Hide
            </button>
            <button className="clear-filter-button" type="button" onClick={() => setFilters(emptyLibraryFilters())}>
              Clear
            </button>
          </div>
        </div>

        <MultiSelectFilter
          label="Genre"
          options={filterOptions.genres}
          selected={filters.genres}
          onChange={(values) => setFilters((current) => ({ ...current, genres: values }))}
        />
        <MultiSelectFilter
          label="Subgenre"
          options={filterOptions.subGenres}
          selected={filters.subGenres}
          onChange={(values) => setFilters((current) => ({ ...current, subGenres: values }))}
        />
        <MultiSelectFilter
          label="Platform"
          options={filterOptions.platforms}
          selected={filters.platforms}
          onChange={(values) => setFilters((current) => ({ ...current, platforms: values }))}
        />
        <MultiSelectFilter
          label="Difficulty"
          options={filterOptions.difficulties}
          selected={filters.difficulties}
          onChange={(values) => setFilters((current) => ({ ...current, difficulties: values }))}
        />

        <section className="filter-field">
          <h3>Rating</h3>
          <div className="star-filter" aria-label="Minimum rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                className={star === filters.ratingStars ? "active" : ""}
                key={star}
                aria-label={`Minimum ${star} star rating`}
                type="button"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    ratingStars: current.ratingStars === star ? 0 : star
                  }))
                }
              >
                <span aria-hidden="true">★</span>
                <strong>{star}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="filter-field">
          <h3>Release year</h3>
          <div className="year-range">
            <input
              inputMode="numeric"
              onChange={(event) => setFilters((current) => ({ ...current, minYear: event.target.value }))}
              placeholder="From"
              value={filters.minYear}
            />
            <input
              inputMode="numeric"
              onChange={(event) => setFilters((current) => ({ ...current, maxYear: event.target.value }))}
              placeholder="To"
              value={filters.maxYear}
            />
          </div>
        </section>
      </aside>}

      {!isFilterVisible && (
        <button className="filter-rail-button" type="button" onClick={() => setIsFilterVisible(true)}>
          Filters
        </button>
      )}

      <section className="library-content">
        <div className="section-heading library-heading">
          <div>
            <p className="eyebrow">Library</p>
            <h1>Pustaka game</h1>
          </div>
          <div className="library-actions">
            <div className="library-search-wrap">
              <label className="library-search">
                <span>Search library</span>
                <input
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                  placeholder="Search for a game"
                  type="search"
                />
              </label>
              {librarySuggestions.length > 0 && (
                <div className="suggestion-dropdown library-suggestions">
                  {librarySuggestions.map((game, index) => (
                    <button
                      className="suggestion-item"
                      key={game.slug}
                      type="button"
                      onClick={() => onSelectGame(game.slug)}
                    >
                      <GameMedia game={game} size="tiny" />
                      <span>
                        <strong>{game.title}</strong>
                        <small>{primaryGenre(game) || game.slug}</small>
                      </span>
                      {index === 0 && <em>Top result</em>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="secondary-button" type="button" onClick={onRefresh}>
              Refresh
            </button>
          </div>
        </div>

        {isLoading && <p className="notice loading">Memuat game dari SPARQL...</p>}

        {activeFilterLabels.length > 0 && (
          <div className="active-filter-bullets" aria-label="Active library filters">
            {activeFilterLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        )}

        <div className="game-grid library-grid">
          {visibleGames.map((game) => (
            <GameCard game={game} key={game.slug} onSelect={onSelectGame} />
          ))}
        </div>

        {!isLoading && visibleGames.length === 0 && (
          <p className="empty-state">Game tidak ditemukan di library.</p>
        )}
      </section>
    </section>
  );
}

function MultiSelectFilter({
  label,
  onChange,
  options,
  selected
}: {
  label: string;
  onChange: (values: string[]) => void;
  options: string[];
  selected: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const filterRef = useRef<HTMLElement | null>(null);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.trim().toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function addValue(value: string) {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setInputValue("");
    setIsOpen(true);
  }

  function removeValue(value: string) {
    onChange(selected.filter((item) => item !== value));
  }

  return (
    <section className="filter-field" ref={filterRef}>
      <h3>{label}</h3>
      <div className="multi-select">
        <div
          className={isOpen ? "selected-values open" : "selected-values"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && isOpen) {
              event.preventDefault();
              setIsOpen(false);
            }
          }}
        >
          {selected.map((value) => (
            <span key={value}>
              {value}
              <button type="button" onClick={() => removeValue(value)}>
                x
              </button>
            </span>
          ))}
          <input
            onMouseDown={(event) => {
              if (isOpen && document.activeElement === event.currentTarget) {
                event.preventDefault();
                event.currentTarget.blur();
                setIsOpen(false);
              }
            }}
            onChange={(event) => {
              setInputValue(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredOptions[0]) {
                event.preventDefault();
                addValue(filteredOptions[0]);
              }
            }}
            placeholder={selected.length === 0 ? `Select ${label.toLowerCase()}` : ""}
            value={inputValue}
          />
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="filter-dropdown">
            {filteredOptions.map((option) => (
              <button
                className={selected.includes(option) ? "selected" : ""}
                key={option}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  addValue(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
function GameInfoPage({
  detail,
  isLoading,
  metadataGroups,
  onOpenRecommendations,
  semanticGroups
}: {
  detail: GameDetail | null;
  isLoading: boolean;
  metadataGroups: PropertyGroup[];
  onOpenRecommendations: () => void;
  semanticGroups: PropertyGroup[];
}) {
  if (isLoading || !detail) {
    return (
      <section className="page-section">
        <p className="notice loading">Memuat informasi game dari SPARQL...</p>
      </section>
    );
  }

  const description = detail.description ?? getSingleValue(detail.properties, "Deskripsi");

  return (
    <section className="page-section">
      <div className="info-hero">
        <GameMedia game={detail} size="large" />
        <div className="info-copy">
          <p className="eyebrow">Game Info</p>
          <h1>{detail.title}</h1>
          <p>{description || "Deskripsi belum tersedia di RDF."}</p>
          <div className="info-actions">
            <div className="score-card">
              <strong>{detail.rating?.toFixed(1) ?? "-"}</strong>
              <span>RAWG</span>
            </div>
            <button className="primary-button" type="button" onClick={onOpenRecommendations}>
              Lihat Rekomendasi
            </button>
          </div>
        </div>
      </div>

      <section className="panel">
        <h2>Atribut semantic</h2>
        <div className="category-grid">
          {semanticGroups.map((group) => (
            <CategoryCard group={group} key={group.name} />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Metadata</h2>
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
  );
}

function RecommendationsPage({
  game,
  isLoading,
  onBackToInfo,
  onSelectGame,
  recommendations
}: {
  game: GameDetail | null;
  isLoading: boolean;
  onBackToInfo: () => void;
  onSelectGame: (slug: string) => void;
  recommendations: GameRecommendation[];
}) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h1>{game ? `Mirip dengan ${game.title}` : "Rekomendasi"}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onBackToInfo}>
          Kembali ke Info
        </button>
      </div>

      {isLoading && <p className="notice loading">Menghitung rekomendasi dari SPARQL...</p>}

      {!isLoading && recommendations.length === 0 && (
        <p className="empty-state">Belum ada rekomendasi untuk game ini.</p>
      )}

      <div className="recommendation-list">
        {recommendations.map((recommendation) => (
          <article className="recommendation-card" key={recommendation.slug}>
            <GameMedia game={recommendation} size="small" />
            <div>
              <div className="recommendation-heading">
                <h2>{recommendation.title}</h2>
                <span>{recommendation.score} pts</span>
              </div>
              <p>{recommendation.description ? shorten(recommendation.description, 190) : "Deskripsi belum tersedia."}</p>
              <div className="chips">
                {recommendation.reasons.slice(0, 8).map((reason) => (
                  <span className="chip" key={`${recommendation.slug}-${reason}`}>
                    {reason}
                  </span>
                ))}
              </div>
              <button className="text-button" type="button" onClick={() => onSelectGame(recommendation.slug)}>
                Lihat info game
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GameCard({ game, onSelect }: { game: GameSearchResult; onSelect: (slug: string) => void }) {
  return (
    <button className="game-card" type="button" onClick={() => onSelect(game.slug)}>
      <GameMedia game={game} size="small" />
      <strong>{game.title}</strong>
      <span className="game-meta">
        <small>{primaryGenre(game) || "Game"}</small>
        <small>{releaseYear(game.releaseDate)}</small>
      </span>
    </button>
  );
}

function GameMedia({ game, size }: { game: GameSearchResult; size: "tiny" | "small" | "large" }) {
  const className = game.imageUrl ? `game-media ${size} has-image` : `game-media ${size}`;

  return (
    <div className={className}>
      {game.imageUrl ? <img src={game.imageUrl} alt={game.title} /> : <span>Thumbnail Game</span>}
    </div>
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

function sortDifficulties(values: string[]): string[] {
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

function shorten(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

function primaryGenre(game: GameSearchResult): string {
  return game.genres[0] ?? "";
}

function releaseYear(releaseDate?: string): string {
  return releaseDate?.slice(0, 4) || "-";
}

function emptyLibraryFilters(): LibraryFilters {
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

function getActiveFilterLabels(filters: LibraryFilters): string[] {
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

function matchesLibraryFilters(game: GameSearchResult, filters: LibraryFilters): boolean {
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

async function fetchGames(searchTerm: string, limit: number): Promise<GameSearchResult[]> {
  const response = await getJson<ApiResponse<GameSearchResult[]>>(
    `${apiBaseUrl}/games/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}
