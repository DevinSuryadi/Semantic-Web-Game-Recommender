import { useState, type CSSProperties } from "react";
import type { GameDetail, PropertyGroup } from "../types.js";
import { CategoryCard } from "../components/CategoryCard.js";
import { GameMedia } from "../components/GameMedia.js";
import { getSingleValue, primaryGenre, releaseYear } from "../utils/game.js";

export function GameInfoPage({
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
  const mainGenre = primaryGenre(detail) || "Game";
  const mainSubgenre = detail.subGenres[0] ?? "Subgenre belum tersedia";
  const year = releaseYear(detail.releaseDate);
  const heroStyle = detail.imageUrl
    ? ({
        "--game-info-bg": `url("${detail.imageUrl}")`
      } as CSSProperties)
    : undefined;

  return (
    <section className="page-section game-info-section">
      <div className={detail.imageUrl ? "info-hero has-background" : "info-hero"} style={heroStyle}>
        <div className="info-cover-column">
          <GameMedia game={detail} size="cover" />
          <GameDescription description={description || "Deskripsi belum tersedia di RDF."} />
        </div>

        <div className="info-copy">
          <p className="eyebrow">Game Info</p>
          <h1>{detail.title}</h1>
          <div className="info-badges" aria-label="Game summary">
            <span>{mainGenre}</span>
            <span>{mainSubgenre}</span>
            <span>Year {year}</span>
            <span>Release {detail.releaseDate ?? "-"}</span>
          </div>
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

function GameDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = description.length > 150;

  return (
    <div className="info-description">
      <p className={isExpanded || !canExpand ? "expanded" : ""}>{description}</p>
      {canExpand && (
        <button type="button" onClick={() => setIsExpanded((current) => !current)}>
          {isExpanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
}
