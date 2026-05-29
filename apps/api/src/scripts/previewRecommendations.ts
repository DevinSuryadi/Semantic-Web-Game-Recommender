import { tenPilotGames } from "../data/tenGames.js";
import { recommendBySlug } from "../recommendation/scoring.js";

const inputSlug = process.argv[2] ?? "elden-ring";
const recommendations = recommendBySlug(tenPilotGames, inputSlug).slice(0, 5);

console.log(`Recommendations for ${inputSlug}:`);
for (const [index, recommendation] of recommendations.entries()) {
  console.log(`${index + 1}. ${recommendation.title} (${recommendation.score})`);
  console.log(`   ${recommendation.reasons.slice(0, 8).join("; ")}`);
}
