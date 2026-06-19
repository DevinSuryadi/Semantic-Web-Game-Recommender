import type { GameSearchResult } from "../types.js";
import { primaryGenre } from "../utils/game.js";
import { GameMedia } from "./GameMedia.js";

export function SuggestionDropdown({
  className = "",
  games,
  onSelect
}: {
  className?: string;
  games: GameSearchResult[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div className={`suggestion-dropdown ${className}`.trim()}>
      {games.map((game, index) => (
        <button className="suggestion-item" key={game.slug} type="button" onClick={() => onSelect(game.slug)}>
          <GameMedia game={game} size="tiny" />
          <span>
            <strong>{game.title}</strong>
            <small>{primaryGenre(game) || game.slug}</small>
          </span>
          {index === 0 && <em>Top result</em>}
        </button>
      ))}
    </div>
  );
}
