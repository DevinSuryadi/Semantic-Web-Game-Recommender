import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchGameDetail, fetchGames, fetchRecommendations } from "./api.js";
import { metadataOrder, semanticOrder } from "./constants.js";
import { HomeBackground } from "./components/HomeBackground.js";
import { Topbar } from "./components/Topbar.js";
import { GameInfoPage } from "./pages/GameInfoPage.js";
import { HomePage } from "./pages/HomePage.js";
import { LibraryPage } from "./pages/LibraryPage.js";
import { RecommendationsPage } from "./pages/RecommendationsPage.js";
import type { GameDetail, GameRecommendation, GameSearchResult, Page } from "./types.js";
import { getErrorMessage, groupProperties } from "./utils/game.js";

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
      setDetail(await fetchGameDetail(slug));
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
      setRecommendations(await fetchRecommendations(detail.slug));
    } catch (currentError) {
      setError(getErrorMessage(currentError));
    } finally {
      setIsLoadingRecommendations(false);
    }
  }

  return (
    <main className="app-shell">
      <Topbar page={page} onHome={() => setPage("home")} onLibrary={() => void openLibrary()} />
      <HomeBackground isVisible={page === "home"} />

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
          onBackToLibrary={() => void openLibrary()}
          onOpenRecommendations={() => void openRecommendations()}
          onSelectGame={(slug) => void openGameInfo(slug)}
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
