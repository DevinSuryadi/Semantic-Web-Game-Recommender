import type { GameDetail, PropertyGroup } from "../types.js";
import { CategoryCard } from "../components/CategoryCard.js";
import { GameMedia } from "../components/GameMedia.js";
import { getSingleValue } from "../utils/game.js";

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
