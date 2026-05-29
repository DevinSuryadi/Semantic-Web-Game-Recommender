import type { PilotGame, SemanticMappingInput } from "./types.js";

export function buildSemanticMappings(game: PilotGame): SemanticMappingInput[] {
  return Object.entries(game.semantics).flatMap(([dimension, values]) =>
    (values ?? []).map((value) => ({
      dimension: dimension as SemanticMappingInput["dimension"],
      value,
      source: "manual-pilot",
      confidence: 5,
      evidence: "Curated pilot label for the first 10 game dataset."
    }))
  );
}
