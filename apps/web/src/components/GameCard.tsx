import type { GameSearchResult } from "../types.js";
import { primaryGenre, releaseYear } from "../utils/game.js";
import { GameMedia } from "./GameMedia.js";

export function GameCard({ game, onSelect }: { game: GameSearchResult; onSelect: (slug: string) => void }) {
  return (
    <button className="game-card" type="button" onClick={() => onSelect(game.slug)}>
      <GameMedia game={game} size="small" />
      <strong>{game.title}</strong>
      <span className="game-meta">
        <small>{primaryGenre(game) || "Game"}</small>
        <small>{releaseYear(game.releaseDate)}</small>
      </span>
    </button>
  );
}
