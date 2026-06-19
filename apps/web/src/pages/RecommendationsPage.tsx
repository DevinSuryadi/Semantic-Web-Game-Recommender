import { useMemo, useState } from "react";
import { fetchGameDetail } from "../api.js";
import type { GameDetail, GameRecommendation } from "../types.js";
import { GameMedia } from "../components/GameMedia.js";
import { getErrorMessage, groupProperties, shorten } from "../utils/game.js";
import { semanticOrder } from "../constants.js";

type MatchAxis = {
  axis: string;
  requested: number;
  matched: number;
  percentage: number;
  sharedValues: string[];
};

type MatchBreakdown = {
  axes: MatchAxis[];
  matchedTags: Array<{
    dimension: string;
    value: string;
  }>;
  overallScore: number;
};

const matchAxisGroups = [
  {
    axis: "Mechanics",
    dimensions: ["Gameplay Mechanic", "Combat Style", "Perspective"]
  },
  {
    axis: "Narrative",
    dimensions: ["Theme", "SubGenre", "Tag"]
  },
  {
    axis: "Vibe",
    dimensions: ["Mood", "Art Style", "Difficulty"]
  },
  {
    axis: "Structure",
    dimensions: ["Game Mode", "Pacing", "Platform"]
  },
  {
    axis: "Identity",
    dimensions: ["Genre", "SubGenre", "Quality Tier"]
  },
  {
    axis: "World",
    dimensions: ["Theme", "Platform", "Perspective"]
  }
];

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
  const [selectedRecommendation, setSelectedRecommendation] = useState<GameRecommendation | null>(null);
  const [selectedRecommendationDetail, setSelectedRecommendationDetail] = useState<GameDetail | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  const matchBreakdown = useMemo(() => {
    if (!game || !selectedRecommendationDetail) {
      return null;
    }

    return buildMatchBreakdown(game, selectedRecommendationDetail);
  }, [game, selectedRecommendationDetail]);

  async function openMatchBreakdown(recommendation: GameRecommendation) {
    setSelectedRecommendation(recommendation);
    setIsLoadingBreakdown(true);
    setBreakdownError(null);

    try {
      setSelectedRecommendationDetail(await fetchGameDetail(recommendation.slug));
    } catch (currentError) {
      setSelectedRecommendationDetail(null);
      setBreakdownError(getErrorMessage(currentError));
    } finally {
      setIsLoadingBreakdown(false);
    }
  }

  return (
    <section className="page-section recommendations-section">
      <div className="recommendations-layout">
        <div className="recommendations-main">
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
              <article
                className={
                  selectedRecommendation?.slug === recommendation.slug
                    ? "recommendation-card selected"
                    : "recommendation-card"
                }
                key={recommendation.slug}
              >
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
                  <div className="recommendation-actions">
                    <button className="text-button" type="button" onClick={() => onSelectGame(recommendation.slug)}>
                      Lihat info game
                    </button>
                    <button
                      className="text-button accent"
                      type="button"
                      onClick={() => void openMatchBreakdown(recommendation)}
                    >
                      View Match Breakdown
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <MatchBreakdownPanel
          baseGame={game}
          breakdown={matchBreakdown}
          error={breakdownError}
          isLoading={isLoadingBreakdown}
          targetGame={selectedRecommendationDetail ?? selectedRecommendation}
        />
      </div>
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
