import type { GameSearchResult } from "../types.js";

export function GameMedia({ game, size }: { game: GameSearchResult; size: "tiny" | "small" | "large" }) {
  const className = game.imageUrl ? `game-media ${size} has-image` : `game-media ${size}`;

  return (
    <div className={className}>
      {game.imageUrl ? <img src={game.imageUrl} alt={game.title} /> : <span>Thumbnail Game</span>}
    </div>
  );
}
