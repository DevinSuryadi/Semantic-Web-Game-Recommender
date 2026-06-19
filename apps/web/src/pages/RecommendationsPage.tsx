import { useEffect, useMemo, useState } from "react";
import type { GameDetail, GameRecommendation } from "../types.js";
import { GameMedia } from "../components/GameMedia.js";
import { primaryGenre, releaseYear, shorten } from "../utils/game.js";

export function RecommendationsPage({
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSlug((currentSlug) => {
      if (currentSlug && recommendations.some((recommendation) => recommendation.slug === currentSlug)) {
        return currentSlug;
      }

      return recommendations[0]?.slug ?? null;
    });
  }, [recommendations]);

  const selectedRecommendation = useMemo(
    () => recommendations.find((recommendation) => recommendation.slug === selectedSlug) ?? recommendations[0],
    [recommendations, selectedSlug]
  );

  return (
    <section className="page-section recommendations-section">
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

      {game && (
        <article className="recommendation-source-card">
          <GameMedia game={game} size="small" />
          <div>
            <span className="source-label">Game yang dicari</span>
            <h2>{game.title}</h2>
            <div className="source-meta">
              <span>{primaryGenre(game) || "Game"}</span>
              <span>{releaseYear(game.releaseDate)}</span>
              <span>{game.rating?.toFixed(1) ?? "-"} /5.0</span>
            </div>
            <p>{game.description ? shorten(game.description, 220) : "Deskripsi belum tersedia."}</p>
          </div>
        </article>
      )}

      {!isLoading && recommendations.length === 0 && (
        <p className="empty-state">Belum ada rekomendasi untuk game ini.</p>
      )}

      {recommendations.length > 0 && selectedRecommendation && (
        <div className="recommendation-workspace">
          <aside className="recommendation-sidebar" aria-label="Daftar rekomendasi game">
            {recommendations.map((recommendation, index) => (
              <button
                className={recommendation.slug === selectedRecommendation.slug ? "recommendation-option active" : "recommendation-option"}
                key={recommendation.slug}
                type="button"
                onClick={() => setSelectedSlug(recommendation.slug)}
              >
                <GameMedia game={recommendation} size="tiny" />
                <span>
                  <strong>{recommendation.title}</strong>
                  <small>{primaryGenre(recommendation) || "Game"} / {releaseYear(recommendation.releaseDate)}</small>
                </span>
                <em>#{index + 1}</em>
              </button>
            ))}
          </aside>

          <article className="recommendation-detail">
            <GameMedia game={selectedRecommendation} size="large" />
            <div className="recommendation-detail-copy">
              <div className="recommendation-heading">
                <div>
                  <span className="source-label">Rekomendasi terpilih</span>
                  <h2>{selectedRecommendation.title}</h2>
                </div>
                <span className="recommendation-score">{selectedRecommendation.score} pts</span>
              </div>

              <div className="recommendation-meta-row">
                <span>{primaryGenre(selectedRecommendation) || "Game"}</span>
                <span>{releaseYear(selectedRecommendation.releaseDate)}</span>
                <span>{selectedRecommendation.rating?.toFixed(1) ?? "-"} /5.0</span>
              </div>

              <p>
                {selectedRecommendation.description
                  ? shorten(selectedRecommendation.description, 360)
                  : "Deskripsi belum tersedia."}
              </p>

              <section className="recommendation-reasons">
                <h3>Kenapa direkomendasikan</h3>
                <div className="chips">
                  {selectedRecommendation.reasons.slice(0, 10).map((reason) => (
                    <span className="chip" key={`${selectedRecommendation.slug}-${reason}`}>
                      {reason}
                    </span>
                  ))}
                </div>
              </section>

              <button className="text-button" type="button" onClick={() => onSelectGame(selectedRecommendation.slug)}>
                Lihat info game
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
