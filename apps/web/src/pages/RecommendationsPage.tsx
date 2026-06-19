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

function MatchBreakdownPanel({
  baseGame,
  breakdown,
  error,
  isLoading,
  targetGame
}: {
  baseGame: GameDetail | null;
  breakdown: MatchBreakdown | null;
  error: string | null;
  isLoading: boolean;
  targetGame: GameDetail | GameRecommendation | null;
}) {
  return (
    <aside className="match-breakdown-panel">
      <div className="match-breakdown-heading">
        <p className="eyebrow">Semantic Match</p>
        <h2>Match Breakdown</h2>
      </div>

      {!targetGame && (
        <p className="match-breakdown-empty">
          Pick a recommendation to see how its RDF attributes overlap with the selected game.
        </p>
      )}

      {isLoading && <p className="notice loading">Loading semantic comparison...</p>}
      {error && <p className="notice error">{error}</p>}

      {targetGame && breakdown && baseGame && (
        <>
          <div className="match-pair">
            <div>
              <span>Selected</span>
              <strong>{baseGame.title}</strong>
            </div>
            <div>
              <span>Compared</span>
              <strong>{targetGame.title}</strong>
            </div>
          </div>

          <div className="match-overview">
            <MatchDonut value={breakdown.overallScore} />
            <div>
              <strong>{breakdown.overallScore}%</strong>
              <span>overall semantic overlap</span>
            </div>
          </div>

          <RadarChart axes={breakdown.axes} />

          <div className="axis-breakdown-list">
            {breakdown.axes.map((axis) => (
              <section className="axis-breakdown-row" key={axis.axis}>
                <div>
                  <span>{axis.axis}</span>
                  <strong>
                    {axis.matched} / {axis.requested}
                  </strong>
                </div>
                <div className="axis-progress">
                  <span style={{ width: `${axis.percentage}%` }} />
                </div>
                <em>{axis.percentage}%</em>
              </section>
            ))}
          </div>

          <section className="matched-tags-panel">
            <h3>Matched Semantic Tags</h3>
            <div className="chips">
              {breakdown.matchedTags.slice(0, 16).map((tag) => (
                <span className="chip" key={`${tag.dimension}-${tag.value}`}>
                  {tag.dimension}: {tag.value}
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </aside>
  );
}

function MatchDonut({ value }: { value: number }) {
  const angle = Math.max(0, Math.min(100, value)) * 3.6;

  return (
    <div
      className="match-donut"
      style={{
        background: `conic-gradient(#7bd8ff ${angle}deg, #2a3642 ${angle}deg)`
      }}
    >
      <span>{value}%</span>
    </div>
  );
}

function RadarChart({ axes }: { axes: MatchAxis[] }) {
  const size = 260;
  const center = size / 2;
  const radius = 92;
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const requestedPoints = axes.map((axis, index) => radarPoint(index, axes.length, 100, center, radius));
  const matchedPoints = axes.map((axis, index) => radarPoint(index, axes.length, axis.percentage, center, radius));

  return (
    <div className="radar-wrap">
      <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Semantic match radar chart">
        {gridLevels.map((level) => (
          <polygon className="radar-grid" key={level} points={pointsToString(requestedPointsForLevel(axes.length, level, center, radius))} />
        ))}

        {axes.map((axis, index) => {
          const outer = radarPoint(index, axes.length, 100, center, radius);
          const label = radarPoint(index, axes.length, 116, center, radius);

          return (
            <g key={axis.axis}>
              <line className="radar-axis" x1={center} y1={center} x2={outer.x} y2={outer.y} />
              <text className="radar-label" x={label.x} y={label.y}>
                {axis.axis}
              </text>
            </g>
          );
        })}

        <polygon className="radar-requested" points={pointsToString(requestedPoints)} />
        <polygon className="radar-matched" points={pointsToString(matchedPoints)} />
        {matchedPoints.map((point, index) => (
          <circle className="radar-dot" cx={point.x} cy={point.y} key={axes[index].axis} r="4" />
        ))}
      </svg>
      <div className="radar-legend">
        <span className="requested">Requested</span>
        <span className="matched">Matched</span>
      </div>
    </div>
  );
}

function buildMatchBreakdown(baseGame: GameDetail, targetGame: GameDetail): MatchBreakdown {
  const baseGroups = groupProperties(baseGame.properties, semanticOrder);
  const targetGroups = groupProperties(targetGame.properties, semanticOrder);

  const axes = matchAxisGroups.map((axisGroup) => {
    const baseValues = valuesForDimensions(baseGroups, axisGroup.dimensions);
    const targetValues = valuesForDimensions(targetGroups, axisGroup.dimensions);
    const sharedValues = baseValues.filter((value) => targetValues.includes(value));
    const requested = baseValues.length;
    const matched = sharedValues.length;

    return {
      axis: axisGroup.axis,
      requested,
      matched,
      percentage: requested === 0 ? 0 : Math.round((matched / requested) * 100),
      sharedValues
    };
  });

  const matchedTags = semanticOrder.flatMap((dimension) => {
    const baseValues = valuesForDimensions(baseGroups, [dimension]);
    const targetValues = valuesForDimensions(targetGroups, [dimension]);

    return baseValues
      .filter((value) => targetValues.includes(value))
      .map((value) => ({
        dimension,
        value
      }));
  });

  const requestedTotal = axes.reduce((total, axis) => total + axis.requested, 0);
  const matchedTotal = axes.reduce((total, axis) => total + axis.matched, 0);

  return {
    axes,
    matchedTags,
    overallScore: requestedTotal === 0 ? 0 : Math.round((matchedTotal / requestedTotal) * 100)
  };
}

function valuesForDimensions(groups: Array<{ name: string; values: string[] }>, dimensions: string[]): string[] {
  return Array.from(
    new Set(
      dimensions.flatMap((dimension) => groups.find((group) => group.name === dimension)?.values ?? [])
    )
  );
}

function radarPoint(index: number, count: number, percentage: number, center: number, radius: number) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  const scaledRadius = radius * (percentage / 100);

  return {
    x: center + Math.cos(angle) * scaledRadius,
    y: center + Math.sin(angle) * scaledRadius
  };
}

function requestedPointsForLevel(count: number, level: number, center: number, radius: number) {
  return Array.from({ length: count }, (_value, index) => radarPoint(index, count, level * 100, center, radius));
}

function pointsToString(points: Array<{ x: number; y: number }>): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
