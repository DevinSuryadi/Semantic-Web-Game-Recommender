import type { GameDetail, GameRecommendation } from "../types.js";
import { GameMedia } from "../components/GameMedia.js";
import { shorten } from "../utils/game.js";

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
