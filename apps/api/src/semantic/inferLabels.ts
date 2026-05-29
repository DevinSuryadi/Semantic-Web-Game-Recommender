import type { RawgGameForDataset } from "../rawg/types.js";

export type SemanticLabels = {
  mood: string[];
  theme: string[];
  gameplayMechanic: string[];
  gameMode: string[];
  subGenre: string[];
  combatStyle: string[];
  perspective: string[];
  difficulty: string[];
  pacing: string[];
  artStyle: string[];
  qualityTier: string[];
};

const emptyLabels = (): SemanticLabels => ({
  mood: [],
  theme: [],
  gameplayMechanic: [],
  gameMode: [],
  subGenre: [],
  combatStyle: [],
  perspective: [],
  difficulty: [],
  pacing: [],
  artStyle: [],
  qualityTier: []
});

export function inferSemanticLabels(game: RawgGameForDataset): SemanticLabels {
  const labels = emptyLabels();
  const text = buildSearchText(game);
  const genres = new Set(game.genres.map((genre) => genre.toLowerCase()));

  inferGenreLabels(labels, genres, text);
  inferKeywordLabels(labels, text);
  inferQualityTier(labels, game);
  fillPracticalDefaults(labels, genres, text);

  return labels;
}

function inferGenreLabels(labels: SemanticLabels, genres: Set<string>, text: string) {
  if (genres.has("action")) {
    add(labels.combatStyle, "Action");
    add(labels.gameplayMechanic, "Combat");
  }

  if (genres.has("shooter")) {
    add(labels.combatStyle, "Shooter");
    add(labels.gameplayMechanic, "Shooting");
  }

  if (genres.has("rpg") && genres.has("action")) {
    add(labels.subGenre, "Action RPG");
  }

  if (genres.has("strategy")) {
    add(labels.subGenre, "Strategy");
    add(labels.combatStyle, "Tactical");
  }

  if (genres.has("racing")) {
    add(labels.subGenre, "Racing");
    add(labels.pacing, "Fast");
  }

  if (genres.has("fighting")) {
    add(labels.subGenre, "Fighting");
    add(labels.combatStyle, "Action");
  }

  if (genres.has("simulation")) {
    add(labels.subGenre, "Simulation");
    add(labels.pacing, "Slow");
  }

  if (genres.has("sports")) {
    add(labels.subGenre, "Sports");
  }

  if (hasAny(text, ["singleplayer", "single-player", "single player"])) {
    add(labels.gameMode, "Singleplayer");
  }
}

function inferKeywordLabels(labels: SemanticLabels, text: string) {
  if (hasAny(text, ["dark fantasy", "gothic", "grim"])) {
    add(labels.theme, "Dark Fantasy");
    add(labels.mood, "Dark");
  }

  if (hasAny(text, ["souls-like", "soulslike", "challenging", "difficult", "punishing"])) {
    add(labels.mood, "Tense");
    add(labels.difficulty, "Hard");
    add(labels.gameplayMechanic, "Combat");
  }

  if (hasAny(text, ["boss fight", "boss fights", "boss battle", "boss rush"])) {
    add(labels.gameplayMechanic, "Boss Fight");
  }

  if (hasAny(text, ["open world", "open-world"])) {
    add(labels.gameplayMechanic, "Open World");
    add(labels.theme, "Exploration");
  }

  if (hasAny(text, ["exploration", "explore"])) {
    add(labels.gameplayMechanic, "Exploration");
    add(labels.theme, "Exploration");
  }

  if (hasAny(text, ["adventure"])) {
    add(labels.theme, "Adventure");
  }

  if (hasAny(text, ["survival"])) {
    add(labels.theme, "Survival");
    add(labels.gameplayMechanic, "Survival");
  }

  if (hasAny(text, ["crafting", "craft"])) {
    add(labels.gameplayMechanic, "Crafting");
  }

  if (hasAny(text, ["resource management"])) {
    add(labels.gameplayMechanic, "Resource Management");
  }

  if (hasAny(text, ["base building"])) {
    add(labels.gameplayMechanic, "Base Building");
  }

  if (hasAny(text, ["puzzle", "puzzles"])) {
    add(labels.gameplayMechanic, "Puzzle Solving");
  }

  if (hasAny(text, ["stealth"])) {
    add(labels.gameplayMechanic, "Stealth");
    add(labels.mood, "Tense");
  }

  if (hasAny(text, ["platformer", "platforming"])) {
    add(labels.gameplayMechanic, "Platforming");
  }

  if (hasAny(text, ["precision platforming"])) {
    add(labels.gameplayMechanic, "Precision Platforming");
  }

  if (hasAny(text, ["shooting", "shooter", "fps", "first person shooter"])) {
    add(labels.gameplayMechanic, "Shooting");
    add(labels.combatStyle, "Shooter");
  }

  if (hasAny(text, ["looter shooter", "looting", "loot"])) {
    add(labels.gameplayMechanic, "Looting");
  }

  if (hasAny(text, ["procedural generation", "procedurally generated"])) {
    add(labels.gameplayMechanic, "Procedural Generation");
  }

  if (hasAny(text, ["permadeath"])) {
    add(labels.gameplayMechanic, "Permadeath");
  }

  if (hasAny(text, ["deck building", "deck-building"])) {
    add(labels.gameplayMechanic, "Deck Building");
    add(labels.subGenre, "Card Game");
  }

  if (hasAny(text, ["farming", "farm"])) {
    add(labels.gameplayMechanic, "Farming");
    add(labels.mood, "Cozy");
  }

  if (hasAny(text, ["parkour"])) {
    add(labels.gameplayMechanic, "Parkour");
  }

  if (hasAny(text, ["multiplayer"])) {
    add(labels.gameMode, "Multiplayer");
  }

  if (hasAny(text, ["co-op", "coop", "cooperative"])) {
    add(labels.gameMode, "Co-op");
  }

  if (hasAny(text, ["online co-op", "online coop"])) {
    add(labels.gameMode, "Online Co-op");
  }

  if (hasAny(text, ["local co-op", "local coop"])) {
    add(labels.gameMode, "Local Co-op");
  }

  if (hasAny(text, ["pvp", "player versus player"])) {
    add(labels.gameMode, "PvP");
  }

  if (hasAny(text, ["pve", "player versus environment"])) {
    add(labels.gameMode, "PvE");
  }

  if (hasAny(text, ["mmo", "massively multiplayer"])) {
    add(labels.gameMode, "MMO");
  }

  if (hasAny(text, ["team-based", "team based"])) {
    add(labels.gameMode, "Team-based");
  }

  if (hasAny(text, ["fps", "first-person shooter", "first person shooter"])) {
    add(labels.subGenre, "FPS");
    add(labels.perspective, "First-Person");
    add(labels.combatStyle, "Shooter");
  }

  if (hasAny(text, ["tps", "third-person shooter", "third person shooter"])) {
    add(labels.subGenre, "TPS");
    add(labels.perspective, "Third-Person");
    add(labels.combatStyle, "Shooter");
  }

  if (hasAny(text, ["moba"])) {
    add(labels.subGenre, "MOBA");
    add(labels.gameMode, "Multiplayer");
    add(labels.combatStyle, "Real-Time");
    add(labels.perspective, "Top-Down");
  }

  if (hasAny(text, ["roguelike"])) {
    add(labels.subGenre, "Roguelike");
    add(labels.gameplayMechanic, "Procedural Generation");
    add(labels.gameplayMechanic, "Permadeath");
  }

  if (hasAny(text, ["roguelite", "rogue-lite"])) {
    add(labels.subGenre, "Roguelite");
    add(labels.gameplayMechanic, "Procedural Generation");
  }

  if (hasAny(text, ["metroidvania"])) {
    add(labels.subGenre, "Metroidvania");
    add(labels.gameplayMechanic, "Exploration");
    add(labels.gameplayMechanic, "Platforming");
  }

  if (hasAny(text, ["battle royale"])) {
    add(labels.subGenre, "Battle Royale");
    add(labels.gameMode, "Multiplayer");
  }

  if (hasAny(text, ["action rpg"])) {
    add(labels.subGenre, "Action RPG");
  }

  if (hasAny(text, ["visual novel", "interactive fiction", "walking simulator", "choices matter", "interactive movie"])) {
    add(labels.subGenre, "Visual Novel");
  }

  if (hasAny(text, ["platformer", "puzzle-platformer", "puzzle platformer", "precision platformer", "2d platformer", "3d platformer"])) {
    add(labels.subGenre, "Platformer");
  }

  if (hasAny(text, ["survival horror"])) {
    add(labels.subGenre, "Survival Horror");
    add(labels.theme, "Horror");
    add(labels.mood, "Tense");
  }

  if (hasAny(text, ["tactical rpg"])) {
    add(labels.subGenre, "Tactical RPG");
    add(labels.combatStyle, "Tactical");
  }

  if (hasAny(text, ["jrpg"])) {
    add(labels.subGenre, "JRPG");
  }

  if (hasAny(text, ["crpg"])) {
    add(labels.subGenre, "CRPG");
  }

  if (hasAny(text, ["sandbox"])) {
    add(labels.subGenre, "Sandbox");
  }

  if (hasAny(text, ["rts", "real-time strategy"])) {
    add(labels.subGenre, "RTS");
    add(labels.combatStyle, "Real-Time");
  }

  if (hasAny(text, ["tower defense"])) {
    add(labels.subGenre, "Tower Defense");
  }

  if (hasAny(text, ["visual novel"])) {
    add(labels.subGenre, "Visual Novel");
  }

  if (hasAny(text, ["turn-based", "turn based", "turnbased"])) {
    add(labels.combatStyle, "Turn-Based");
    add(labels.gameplayMechanic, "Turn-based Combat");
  }

  if (hasAny(text, ["real-time", "real time", "action combat"])) {
    add(labels.combatStyle, "Real-Time");
    add(labels.gameplayMechanic, "Real-time Combat");
  }

  if (hasAny(text, ["hack and slash", "hack-and-slash"])) {
    add(labels.combatStyle, "Hack and Slash");
  }

  if (hasAny(text, ["bullet hell"])) {
    add(labels.combatStyle, "Bullet Hell");
  }

  if (hasAny(text, ["auto battler", "autobattler"])) {
    add(labels.combatStyle, "Auto Battler");
  }

  if (hasAny(text, ["first-person", "first person"])) {
    add(labels.perspective, "First-Person");
  }

  if (hasAny(text, ["third-person", "third person"])) {
    add(labels.perspective, "Third-Person");
  }

  if (hasAny(text, ["top-down", "top down"])) {
    add(labels.perspective, "Top-Down");
  }

  if (hasAny(text, ["isometric"])) {
    add(labels.perspective, "Isometric");
  }

  if (hasAny(text, ["side-scrolling", "side scrolling", "side-scroller"])) {
    add(labels.perspective, "Side-Scrolling");
  }

  if (hasAny(text, ["overhead"])) {
    add(labels.perspective, "Overhead");
  }

  if (hasAny(text, ["very hard", "extremely difficult", "brutal"])) {
    add(labels.difficulty, "Very Hard");
  }

  if (hasAny(text, ["hard", "challenging", "difficult"])) {
    add(labels.difficulty, "Hard");
  }

  if (hasAny(text, ["casual", "easy"])) {
    add(labels.difficulty, "Easy");
  }

  if (hasAny(text, ["fast-paced", "fast paced", "fast"])) {
    add(labels.pacing, "Fast");
  }

  if (hasAny(text, ["slow-paced", "slow paced", "slow"])) {
    add(labels.pacing, "Slow");
  }

  if (hasAny(text, ["pixel art"])) {
    add(labels.artStyle, "Pixel Art");
  }

  if (hasAny(text, ["retro"])) {
    add(labels.artStyle, "Retro");
  }

  if (hasAny(text, ["hand-drawn", "hand drawn"])) {
    add(labels.artStyle, "Hand-drawn");
  }

  if (hasAny(text, ["anime"])) {
    add(labels.artStyle, "Anime");
  }

  if (hasAny(text, ["realistic", "photorealistic"])) {
    add(labels.artStyle, "Realistic");
  }

  if (hasAny(text, ["low poly", "low-poly"])) {
    add(labels.artStyle, "Low Poly");
  }

  if (hasAny(text, ["cartoon"])) {
    add(labels.artStyle, "Cartoon");
  }

  if (hasAny(text, ["stylized", "stylised"])) {
    add(labels.artStyle, "Stylized");
  }

  if (hasAny(text, ["voxel"])) {
    add(labels.artStyle, "Voxel");
  }

  if (hasAny(text, ["comic book", "comic"])) {
    add(labels.artStyle, "Comic Book");
  }

  if (hasAny(text, ["neon"])) {
    add(labels.artStyle, "Neon");
  }

  if (hasAny(text, ["minimalist"])) {
    add(labels.artStyle, "Minimalist");
  }

  inferMoodAndTheme(labels, text);
}

function inferMoodAndTheme(labels: SemanticLabels, text: string) {
  const moodRules: Array<[string, string[]]> = [
    ["Dark", ["dark", "gothic"]],
    ["Cozy", ["cozy", "wholesome"]],
    ["Relaxing", ["relaxing", "relaxation"]],
    ["Tense", ["tense", "horror", "thriller"]],
    ["Emotional", ["emotional"]],
    ["Mysterious", ["mystery", "mysterious"]],
    ["Lonely", ["lonely", "isolation"]],
    ["Epic", ["epic"]],
    ["Chaotic", ["chaotic", "chaos"]],
    ["Melancholic", ["melancholic", "melancholy"]],
    ["Hopeful", ["hopeful"]],
    ["Tragic", ["tragic", "tragedy"]],
    ["Ominous", ["ominous"]],
    ["Eerie", ["eerie"]],
    ["Intense", ["intense"]],
    ["Chill", ["chill"]],
    ["Heroic", ["heroic"]],
    ["Grim", ["grim"]]
  ];

  const themeRules: Array<[string, string[]]> = [
    ["Isolation", ["isolation", "lonely"]],
    ["Friendship", ["friendship", "friends"]],
    ["Revenge", ["revenge"]],
    ["Mystery", ["mystery", "detective"]],
    ["Post-apocalypse", ["post-apocalypse", "post apocalyptic", "post-apocalyptic"]],
    ["War", ["war", "military"]],
    ["Self-growth", ["self-growth", "coming of age"]],
    ["Death", ["death", "afterlife"]],
    ["Fantasy", ["fantasy"]],
    ["Cyberpunk", ["cyberpunk"]],
    ["Horror", ["horror"]],
    ["Sci-fi", ["sci-fi", "sci fi", "science fiction"]],
    ["Mythology", ["mythology", "mythological"]],
    ["Military", ["military"]],
    ["Nature", ["nature"]],
    ["Supernatural", ["supernatural", "demons", "eldritch"]]
  ];

  for (const [label, keywords] of moodRules) {
    if (hasAny(text, keywords)) {
      add(labels.mood, label);
    }
  }

  for (const [label, keywords] of themeRules) {
    if (hasAny(text, keywords)) {
      add(labels.theme, label);
    }
  }
}

function inferQualityTier(labels: SemanticLabels, game: RawgGameForDataset) {
  const metacritic = game.metacritic ?? 0;
  const rating = game.rating ?? 0;

  if (metacritic >= 90 || rating >= 4.5) {
    add(labels.qualityTier, "Excellent");
  } else if (metacritic >= 80 || rating >= 4) {
    add(labels.qualityTier, "Very Good");
  } else if (metacritic >= 70 || rating >= 3.5) {
    add(labels.qualityTier, "Good");
  } else if (metacritic >= 60 || rating >= 3) {
    add(labels.qualityTier, "Fair");
  } else {
    add(labels.qualityTier, "Poor");
  }
}

function buildSearchText(game: RawgGameForDataset): string {
  return [
    game.title,
    game.description ?? "",
    ...game.genres,
    ...game.tags
  ]
    .join(" | ")
    .toLowerCase();
}

function fillPracticalDefaults(labels: SemanticLabels, genres: Set<string>, text: string) {
  if (labels.gameMode.length === 0) {
    add(labels.gameMode, "Singleplayer");
  }

  if (labels.mood.length === 0) {
    if (genres.has("casual") || genres.has("family")) {
      add(labels.mood, "Chill");
    } else if (genres.has("horror") || hasAny(text, ["horror", "survival horror"])) {
      add(labels.mood, "Tense");
    } else if (genres.has("racing") || genres.has("sports")) {
      add(labels.mood, "Intense");
    } else if (genres.has("simulation")) {
      add(labels.mood, "Relaxing");
    } else {
      add(labels.mood, "Epic");
    }
  }

  if (labels.theme.length === 0) {
    if (genres.has("shooter")) {
      add(labels.theme, "War");
    } else if (genres.has("simulation")) {
      add(labels.theme, "Self-growth");
    } else if (genres.has("sports") || genres.has("racing")) {
      add(labels.theme, "Adventure");
    } else {
      add(labels.theme, "Adventure");
    }
  }

  if (labels.gameplayMechanic.length === 0) {
    if (genres.has("strategy")) {
      add(labels.gameplayMechanic, "Resource Management");
    } else if (genres.has("puzzle")) {
      add(labels.gameplayMechanic, "Puzzle Solving");
    } else if (genres.has("simulation")) {
      add(labels.gameplayMechanic, "Resource Management");
    } else if (genres.has("platformer")) {
      add(labels.gameplayMechanic, "Platforming");
    } else {
      add(labels.gameplayMechanic, "Combat");
    }
  }

  if (labels.subGenre.length === 0) {
    if (genres.has("shooter")) {
      add(labels.subGenre, labels.perspective.includes("Third-Person") ? "TPS" : "FPS");
    } else if (genres.has("platformer")) {
      add(labels.subGenre, "Platformer");
    } else if (genres.has("strategy")) {
      add(labels.subGenre, "Strategy");
    } else if (genres.has("simulation")) {
      add(labels.subGenre, "Simulation");
    } else if (genres.has("fighting")) {
      add(labels.subGenre, "Fighting");
    } else if (genres.has("sports")) {
      add(labels.subGenre, "Sports");
    } else if (genres.has("racing")) {
      add(labels.subGenre, "Racing");
    } else if (genres.has("rpg") && genres.has("action")) {
      add(labels.subGenre, "Action RPG");
    } else if (genres.has("rpg")) {
      add(labels.subGenre, "CRPG");
    } else if (genres.has("adventure") && labels.gameplayMechanic.includes("Puzzle Solving")) {
      add(labels.subGenre, "Visual Novel");
    } else if (genres.has("action") && labels.perspective.includes("First-Person")) {
      add(labels.subGenre, "FPS");
    } else if (genres.has("action") && labels.perspective.includes("Third-Person")) {
      add(labels.subGenre, "TPS");
    } else if (genres.has("adventure")) {
      add(labels.subGenre, "Visual Novel");
    }
  }

  if (labels.combatStyle.length === 0) {
    if (genres.has("strategy")) {
      add(labels.combatStyle, "Tactical");
    } else if (genres.has("shooter")) {
      add(labels.combatStyle, "Shooter");
    } else {
      add(labels.combatStyle, "Action");
    }
  }

  if (labels.perspective.length === 0) {
    if (genres.has("platformer") || hasAny(text, ["2d", "side scroller", "side-scroller"])) {
      add(labels.perspective, "Side-Scrolling");
    } else if (genres.has("strategy") || hasAny(text, ["isometric"])) {
      add(labels.perspective, "Isometric");
    } else if (hasAny(text, ["third person", "third-person", "3rd-person"])) {
      add(labels.perspective, "Third-Person");
    } else if (genres.has("shooter") || hasAny(text, ["first person", "first-person"])) {
      add(labels.perspective, "First-Person");
    } else {
      add(labels.perspective, "Third-Person");
    }
  }

  if (labels.difficulty.length === 0) {
    if (hasAny(text, ["competitive", "souls-like", "difficult", "hard", "punishing"])) {
      add(labels.difficulty, "Hard");
    } else if (genres.has("casual") || genres.has("family")) {
      add(labels.difficulty, "Easy");
    } else {
      add(labels.difficulty, "Medium");
    }
  }

  if (labels.pacing.length === 0) {
    if (hasAny(text, ["fast-paced", "fast paced", "arena shooter", "racing"])) {
      add(labels.pacing, "Fast");
    } else if (genres.has("strategy") || genres.has("simulation")) {
      add(labels.pacing, "Slow");
    } else {
      add(labels.pacing, "Medium");
    }
  }

  if (labels.artStyle.length === 0) {
    if (hasAny(text, ["cartoony", "cartoon"])) {
      add(labels.artStyle, "Cartoon");
    } else if (hasAny(text, ["pixel graphics", "pixel"])) {
      add(labels.artStyle, "Pixel Art");
    } else if (hasAny(text, ["stylized", "colorful"])) {
      add(labels.artStyle, "Stylized");
    } else {
      add(labels.artStyle, "Realistic");
    }
  }
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => {
    if (/^[a-z0-9-]{2,4}$/i.test(keyword)) {
      return new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}([^a-z0-9]|$)`, "i").test(text);
    }

    return text.includes(keyword);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function add(values: string[], value: string) {
  if (!values.includes(value)) {
    values.push(value);
  }
}
