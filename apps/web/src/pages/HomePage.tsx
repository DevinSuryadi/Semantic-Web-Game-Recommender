import type { FormEvent } from "react";
import type { GameSearchResult } from "../types.js";
import { GameCard } from "../components/GameCard.js";
import { SuggestionDropdown } from "../components/SuggestionDropdown.js";

export function HomePage({
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
        <p className="eyebrow">GameFeel</p>
        <h1>Search your favorite games.</h1>
        <p className="home-copy">
          Semantic game search engine and recommender system
        </p>

        <div className="home-search-area">
          <form className="search-box" onSubmit={onSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: elden ring"
              aria-label="Cari game"
            />
            <button type="submit">{isSearching ? "Mencari..." : "Search"}</button>
          </form>

          {!hasSubmittedSearch && query.trim().length >= 2 && results.length > 0 && (
            <SuggestionDropdown games={results} onSelect={onSelectGame} />
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
