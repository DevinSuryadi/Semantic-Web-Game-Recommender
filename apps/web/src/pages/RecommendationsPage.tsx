import { useEffect, useMemo, useState } from "react";
import type { GameDetail, GameRecommendation } from "../types.js";
import { GameMedia } from "../components/GameMedia.js";
import { semanticOrder } from "../constants.js";
import { groupProperties, primaryGenre, releaseYear, shorten } from "../utils/game.js";

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
          <h1>{game ? `Similar to ${game.title}` : "Recommendations"}</h1>
        </div>
        <button className="back-to-library" type="button" onClick={onBackToInfo}>
          <span aria-hidden="true">&larr; </span>
          Game Info
        </button>
      </div>

      {isLoading && <p className="notice loading">Calculating recommendations from SPARQL...</p>}

      {game && (
        <article className="recommendation-source-card">
          <GameMedia game={game} size="small" />
          <div>
            <span className="source-label">Selected game</span>
            <h2>{game.title}</h2>
            <div className="source-meta">
              <span>{primaryGenre(game) || "Game"}</span>
              <span>{releaseYear(game.releaseDate)}</span>
              <span>{game.rating?.toFixed(1) ?? "-"} /5.0</span>
            </div>
            <p>{game.description ? shorten(game.description, 220) : "Description is not available."}</p>
          </div>
        </article>
      )}

      {!isLoading && recommendations.length === 0 && (
        <p className="empty-state">No recommendations are available for this game yet.</p>
      )}

      {recommendations.length > 0 && selectedRecommendation && (
        <div className="recommendation-workspace">
          <aside className="recommendation-sidebar" aria-label="Recommended games">
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

          <div className="recommendation-main-column">
            <article className="recommendation-detail">
              <GameMedia game={selectedRecommendation} size="large" />
              <div className="recommendation-detail-copy">
                <div className="recommendation-heading">
                  <div>
                    <span className="source-label">Selected recommendation</span>
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
                    : "Description is not available."}
                </p>

                <section className="recommendation-reasons">
                  <h3>Why this matches</h3>
                  <div className="chips">
                    {selectedRecommendation.reasons.slice(0, 10).map((reason) => (
                      <span className="chip" key={`${selectedRecommendation.slug}-${reason}`}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </section>

                <button className="text-button" type="button" onClick={() => onSelectGame(selectedRecommendation.slug)}>
                  View game info
                </button>
              </div>
            </article>

            {game && <RecommendationSemanticPanel baseGame={game} recommendation={selectedRecommendation} />}
          </div>
        </div>
      )}
    </section>
  );
}

type SemanticAxis = {
  dimensions: string[];
  label: string;
  matches: number;
  percentage: number;
  requested: number;
};

const semanticAxisGroups = [
  { label: "Mechanics", dimensions: ["Gameplay Mechanic", "Combat Style"] },
  { label: "Narrative", dimensions: ["Theme", "Tag"] },
  { label: "Vibe", dimensions: ["Mood", "Art Style"] },
  { label: "Structure", dimensions: ["Game Mode", "Pacing", "Difficulty"] },
  { label: "Identity", dimensions: ["Genre", "SubGenre", "Perspective", "Quality Tier"] },
  { label: "World", dimensions: ["Platform"] }
];

function RecommendationSemanticPanel({
  baseGame,
  recommendation
}: {
  baseGame: GameDetail;
  recommendation: GameRecommendation;
}) {
  const axes = buildSemanticAxes(baseGame, recommendation);
  const requestedTotal = axes.reduce((total, axis) => total + axis.requested, 0);
  const matchedTotal = axes.reduce((total, axis) => total + axis.matches, 0);
  const overallOverlap = requestedTotal === 0 ? 0 : Math.round((matchedTotal / requestedTotal) * 100);

  return (
    <section className="recommendation-semantic-panel" aria-label="Semantic overlap analysis">
      <SemanticSpiderChart axes={axes} />

      <div className="semantic-overlap-summary">
        <SemanticDonut value={overallOverlap} />
        <div>
          <strong>{overallOverlap}%</strong>
          <span>overall semantic overlap</span>
        </div>
      </div>

      <div className="semantic-overlap-bars">
        {axes.map((axis) => (
          <section className="semantic-overlap-row" key={axis.label}>
            <div>
              <strong>{axis.label}</strong>
              <span>
                {axis.matches} / {axis.requested}
              </span>
            </div>
            <div className="semantic-progress">
              <span style={{ width: `${axis.percentage}%` }} />
            </div>
            <em>{axis.percentage}%</em>
          </section>
        ))}
      </div>
    </section>
  );
}

function SemanticDonut({ value }: { value: number }) {
  const angle = Math.max(0, Math.min(100, value)) * 3.6;

  return (
    <div
      className="semantic-donut"
      style={{ background: `conic-gradient(#73d7f7 ${angle}deg, rgba(101, 119, 133, 0.28) ${angle}deg)` }}
    >
      <span>{value}%</span>
    </div>
  );
}

function SemanticSpiderChart({ axes }: { axes: SemanticAxis[] }) {
  const size = 310;
  const center = size / 2;
  const radius = 98;
  const requestedPoints = axes.map((axis, index) => getRadarPoint(index, axes.length, 100, center, radius));
  const matchedPoints = axes.map((axis, index) => getRadarPoint(index, axes.length, axis.percentage, center, radius));
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="semantic-radar-card">
      <svg className="semantic-radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Semantic overlap spider chart">
        {gridLevels.map((level) => (
          <polygon
            className="semantic-radar-grid"
            key={level}
            points={pointsToString(
              axes.map((_axis, index) => getRadarPoint(index, axes.length, level * 100, center, radius))
            )}
          />
        ))}

        {axes.map((axis, index) => {
          const outer = getRadarPoint(index, axes.length, 100, center, radius);
          const label = getRadarPoint(index, axes.length, 122, center, radius);

          return (
            <g key={axis.label}>
              <line className="semantic-radar-axis" x1={center} y1={center} x2={outer.x} y2={outer.y} />
              <text className="semantic-radar-label" x={label.x} y={label.y}>
                {axis.label}
              </text>
            </g>
          );
        })}

        <polygon className="semantic-radar-requested" points={pointsToString(requestedPoints)} />
        <polygon className="semantic-radar-matched" points={pointsToString(matchedPoints)} />
        {matchedPoints.map((point, index) => (
          <circle className="semantic-radar-dot" cx={point.x} cy={point.y} key={axes[index].label} r="4.5" />
        ))}
      </svg>

      <div className="semantic-radar-legend">
        <span className="requested">Requested</span>
        <span className="matched">Matched</span>
      </div>
    </div>
  );
}

function buildSemanticAxes(baseGame: GameDetail, recommendation: GameRecommendation): SemanticAxis[] {
  const baseGroups = groupProperties(baseGame.properties, semanticOrder);
  const matchedValues = getMatchedValuesByDimension(recommendation.reasons);

  return semanticAxisGroups.map((group) => {
    const requestedValues = uniqueValues(
      group.dimensions.flatMap((dimension) => baseGroups.find((baseGroup) => baseGroup.name === dimension)?.values ?? [])
    );
    const matchedCount = uniqueValues(
      group.dimensions.flatMap((dimension) => matchedValues.get(dimension) ?? [])
    ).length;
    const requestedCount = requestedValues.length;

    return {
      ...group,
      matches: Math.min(matchedCount, requestedCount),
      percentage: requestedCount === 0 ? 0 : Math.round((Math.min(matchedCount, requestedCount) / requestedCount) * 100),
      requested: requestedCount
    };
  });
}

function getMatchedValuesByDimension(reasons: string[]): Map<string, string[]> {
  const valuesByDimension = new Map<string, string[]>();

  for (const reason of reasons) {
    const [rawDimension, ...rawValueParts] = reason.split(":");
    const dimension = normalizeReasonDimension(rawDimension);
    const value = rawValueParts.join(":").trim();

    if (!dimension || !value) {
      continue;
    }

    valuesByDimension.set(dimension, [...(valuesByDimension.get(dimension) ?? []), value]);
  }

  return valuesByDimension;
}

function normalizeReasonDimension(value?: string): string {
  const cleanValue = value?.trim() ?? "";
  const aliases: Record<string, string> = {
    ArtStyle: "Art Style",
    CombatStyle: "Combat Style",
    GameplayMechanic: "Gameplay Mechanic",
    Mechanic: "Gameplay Mechanic",
    Mode: "Game Mode",
    QualityTier: "Quality Tier",
    SubGenre: "SubGenre"
  };

  return aliases[cleanValue] ?? cleanValue;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getRadarPoint(index: number, count: number, percentage: number, center: number, radius: number) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  const scaledRadius = radius * (percentage / 100);

  return {
    x: center + Math.cos(angle) * scaledRadius,
    y: center + Math.sin(angle) * scaledRadius
  };
}

function pointsToString(points: Array<{ x: number; y: number }>): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
