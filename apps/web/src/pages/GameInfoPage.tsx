import { useEffect, useState, type CSSProperties } from "react";
import { fetchGames } from "../api.js";
import type { GameDetail, GameSearchResult, PropertyGroup } from "../types.js";
import { GameMedia } from "../components/GameMedia.js";
import { SuggestionDropdown } from "../components/SuggestionDropdown.js";
import { getSingleValue, primaryGenre } from "../utils/game.js";

export function GameInfoPage({
  detail,
  isLoading,
  metadataGroups,
  onBackToLibrary,
  onOpenRecommendations,
  onSelectGame,
  semanticGroups
}: {
  detail: GameDetail | null;
  isLoading: boolean;
  metadataGroups: PropertyGroup[];
  onBackToLibrary: () => void;
  onOpenRecommendations: () => void;
  onSelectGame: (slug: string) => void;
  semanticGroups: PropertyGroup[];
}) {
  const [detailQuery, setDetailQuery] = useState("");
  const [detailSuggestions, setDetailSuggestions] = useState<GameSearchResult[]>([]);

  useEffect(() => {
    const searchTerm = detailQuery.trim();

    if (searchTerm.length < 2) {
      setDetailSuggestions([]);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      void fetchGames(searchTerm, 8)
        .then((results) => {
          if (!isCancelled) {
            setDetailSuggestions(results);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setDetailSuggestions([]);
          }
        });
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [detailQuery]);

  if (isLoading || !detail) {
    return (
      <section className="page-section">
        <p className="notice loading">Memuat informasi game dari SPARQL...</p>
      </section>
    );
  }

  const description = detail.description ?? getSingleValue(detail.properties, "Deskripsi");
  const mainGenre = primaryGenre(detail) || getSingleValue(detail.properties, "Genre") || "Game";
  const mainSubgenre = (detail.subGenres[0] ?? getSingleValue(detail.properties, "SubGenre")) || "Subgenre belum tersedia";
  const gameMode = getSingleValue(detail.properties, "Game Mode") || "Game mode belum tersedia";
  const theme = getGroupValue(semanticGroups, "Theme") || "Theme belum tersedia";
  const perspective = getGroupValue(semanticGroups, "Perspective") || "Perspective belum tersedia";
  const qualityTier = getGroupValue(semanticGroups, "Quality Tier") || "Quality tier belum tersedia";
  const developer = getGroupValue(metadataGroups, "Developer") || "Developer belum tersedia";
  const releaseDate = formatReleaseDate(detail.releaseDate);
  const ratingValue = formatRating(detail.rating?.toFixed(1) ?? getGroupValue(metadataGroups, "Rating"));
  const playtimeValue = formatPlaytime(getGroupValue(metadataGroups, "Playtime"));
  const heroMetadata = [
    { label: "Developer", value: developer },
    { label: "Release date", value: releaseDate || "-" },
    { label: "Publisher", value: getGroupValue(metadataGroups, "Publisher") || "-" },
    { label: "Rating", value: ratingValue },
    { label: "Metacritic", value: getGroupValue(metadataGroups, "Metacritic") || "-" },
    { label: "Playtime", value: playtimeValue }
  ];
  const visibleSemanticGroups = semanticGroups.filter(
    (group) => group.values.length > 0 && group.name !== "Quality Tier" && group.name !== "Tag"
  );
  const heroStyle = detail.imageUrl
    ? ({
        "--game-info-bg": `url("${detail.imageUrl}")`
      } as CSSProperties)
    : undefined;

  return (
    <section className="page-section game-info-section">
      <div className="game-info-toolbar">
        <button className="back-to-library" type="button" onClick={onBackToLibrary}>
          <span aria-hidden="true">&larr; </span>
          Library
        </button>

        <div className="detail-search-wrap">
          <label className="library-search">
            <input
              value={detailQuery}
              onChange={(event) => setDetailQuery(event.target.value)}
              placeholder="Search for a game"
              type="search"
            />
          </label>
          {detailSuggestions.length > 0 && (
            <SuggestionDropdown
              className="library-suggestions"
              games={detailSuggestions}
              onSelect={(slug) => {
                setDetailQuery("");
                setDetailSuggestions([]);
                onSelectGame(slug);
              }}
            />
          )}
        </div>
      </div>

      <div className={detail.imageUrl ? "info-hero has-background" : "info-hero"} style={heroStyle}>
        <div className="info-hero-top">
          <div className="info-cover-column">
            <GameMedia game={detail} size="cover" />
          </div>

          <div className="info-copy">
            <div className="info-title-row">
              <h1 className={getTitleClassName(detail.title)}>{detail.title}</h1>
              <div className="score-card">
                <strong>{detail.rating?.toFixed(1) ?? "-"}</strong>
                <span>RAWG</span>
              </div>
            </div>

            <div className="info-tag-row">
              <div className="info-badges" aria-label="Game summary">
                <span>{mainGenre}</span>
                <span>{mainSubgenre}</span>
                <span>{gameMode}</span>
                <span>{theme}</span>
                <span>{perspective}</span>
              </div>
              <span className="quality-tier">{qualityTier}</span>
            </div>

            <div className="info-action-row">
              <button className="primary-button title-recommendation" type="button" onClick={onOpenRecommendations}>
                Game Recommendations
                <span aria-hidden="true"> &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        <div className="hero-metadata" aria-label="Game metadata">
          {heroMetadata.map((item) => (
            <section key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </section>
          ))}
        </div>

        <GameDescription description={description || "Deskripsi belum tersedia di RDF."} />

        <section className="semantic-summary">
          {visibleSemanticGroups.map((group) => (
            <section className="semantic-summary-card" key={group.name}>
              <span>{group.name}</span>
              <strong>{group.values.slice(0, 4).join(", ")}</strong>
            </section>
          ))}
        </section>
      </div>
    </section>
  );
}

function GameDescription({ description }: { description: string }) {
  return (
    <div className="info-description">
      <p>{trimDescription(description)}</p>
    </div>
  );
}

function trimDescription(description: string): string {
  const cleanDescription = description.replace(/\s+/g, " ").trim();
  const maxLength = 430;

  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }

  const snippet = cleanDescription.slice(0, maxLength);
  const lastStop = Math.max(
    snippet.lastIndexOf("."),
    snippet.lastIndexOf("?"),
    snippet.lastIndexOf("!"),
    snippet.lastIndexOf("/")
  );

  if (lastStop > 140) {
    return snippet.slice(0, lastStop + 1).trim();
  }

  return `${snippet.trimEnd()}...`;
}

function getGroupValue(groups: PropertyGroup[], name: string): string {
  return groups.find((group) => group.name === name)?.values[0] ?? "";
}

function getTitleClassName(title: string): string {
  if (title.length > 38) {
    return "extra-compact";
  }

  if (title.length > 26) {
    return "compact";
  }

  return "";
}

function formatReleaseDate(releaseDate?: string): string {
  if (!releaseDate) {
    return "";
  }

  const date = new Date(`${releaseDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return releaseDate;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatRating(rating: string): string {
  return rating ? `${rating} / 5.0` : "-";
}

function formatPlaytime(playtime: string): string {
  return playtime ? `± ${playtime} hours` : "-";
}
