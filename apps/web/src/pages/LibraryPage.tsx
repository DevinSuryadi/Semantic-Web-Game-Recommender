import { useMemo, useState } from "react";
import type { GameSearchResult, LibraryFilters } from "../types.js";
import { GameCard } from "../components/GameCard.js";
import { MultiSelectFilter } from "../components/MultiSelectFilter.js";
import { SuggestionDropdown } from "../components/SuggestionDropdown.js";
import {
  emptyLibraryFilters,
  getActiveFilterLabels,
  matchesLibraryFilters,
  sortDifficulties,
  unique
} from "../utils/game.js";

export function LibraryPage({
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
  const [filters, setFilters] = useState<LibraryFilters>(emptyLibraryFilters());

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
      <div className="filter-column">
        <aside className={isFilterVisible ? "library-filter-panel" : "library-filter-panel hidden"}>
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
                  <span aria-hidden="true">*</span>
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
        </aside>

        <button
          className={isFilterVisible ? "filter-rail-button hidden" : "filter-rail-button"}
          type="button"
          onClick={() => setIsFilterVisible(true)}
        >
          Filters
        </button>
      </div>

      <section className="library-content">
        <div className="section-heading library-heading">
          <div>
            <h1 className="eyebrow">Library</h1>
          </div>
          <div className="library-actions">
            <div className="library-search-wrap">
              <label className="library-search">
                <input
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                  placeholder="Search for a game"
                  type="search"
                />
              </label>
              {librarySuggestions.length > 0 && (
                <SuggestionDropdown className="library-suggestions" games={librarySuggestions} onSelect={onSelectGame} />
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
