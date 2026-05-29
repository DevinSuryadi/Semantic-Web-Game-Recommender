import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { tenPilotGames } from "../data/tenGames.js";
import type { PilotGame, SemanticDimension } from "../semantic/types.js";

const outputPath = resolve(process.cwd(), "../../rdf/gamefeel_10_games.ttl");
const baseIri = "http://example.org/gamefeel";

const dimensionProperties: Record<SemanticDimension, string> = {
  Genre: "hasGenre",
  SubGenre: "hasSubGenre",
  Mood: "hasMood",
  Theme: "hasTheme",
  GameplayMechanic: "hasMechanic",
  GameMode: "hasMode",
  CombatStyle: "hasCombatStyle",
  Perspective: "hasPerspective",
  Difficulty: "hasDifficulty",
  Pacing: "hasPacing",
  ArtStyle: "hasArtStyle",
  Platform: "availableOn",
  QualityTier: "hasQualityTier",
  Tag: "hasTag"
};

async function main() {
  const ttl = [
    "@prefix gf: <http://example.org/gamefeel#> .",
    "@prefix game: <http://example.org/gamefeel/game/> .",
    "@prefix res: <http://example.org/gamefeel/resource/> .",
    "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
    "",
    ...buildResourceTriples(tenPilotGames),
    ...tenPilotGames.flatMap(buildGameTriples)
  ].join("\n");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${ttl}\n`, "utf8");
  console.log(`Generated ${outputPath}`);
}

function buildResourceTriples(games: PilotGame[]): string[] {
  const resources = new Map<string, { dimension: SemanticDimension; value: string }>();

  for (const game of games) {
    for (const [dimension, values] of Object.entries(game.semantics)) {
      for (const value of values ?? []) {
        resources.set(resourceKey(dimension as SemanticDimension, value), {
          dimension: dimension as SemanticDimension,
          value
        });
      }
    }

    for (const developer of game.developers) {
      resources.set(resourceKey("Developer", developer), {
        dimension: "Developer" as SemanticDimension,
        value: developer
      });
    }

    for (const publisher of game.publishers) {
      resources.set(resourceKey("Publisher", publisher), {
        dimension: "Publisher" as SemanticDimension,
        value: publisher
      });
    }
  }

  return [...resources.values()].flatMap(({ dimension, value }) => [
    `${resourceIri(dimension, value)} a gf:${dimension} ;`,
    `  rdfs:label ${literal(value)} .`,
    ""
  ]);
}

function buildGameTriples(game: PilotGame): string[] {
  const lines = [
    `${gameIri(game.slug)} a gf:Game ;`,
    `  gf:title ${literal(game.title)} ;`,
    `  gf:slug ${literal(game.slug)} ;`,
    `  gf:releaseDate "${game.released}"^^xsd:date ;`,
    `  gf:rating "${game.rating}"^^xsd:decimal ;`,
    `  gf:playtime "${game.playtime}"^^xsd:integer ;`
  ];

  if (game.metacritic !== undefined) {
    lines.push(`  gf:metacriticScore "${game.metacritic}"^^xsd:integer ;`);
  }

  lines.push(`  gf:description ${literal(game.description)} ;`);

  for (const developer of game.developers) {
    lines.push(`  gf:developedBy ${resourceIri("Developer", developer)} ;`);
  }

  for (const publisher of game.publishers) {
    lines.push(`  gf:publishedBy ${resourceIri("Publisher", publisher)} ;`);
  }

  for (const [dimension, values] of Object.entries(game.semantics)) {
    const property = dimensionProperties[dimension as SemanticDimension];
    for (const value of values ?? []) {
      lines.push(`  gf:${property} ${resourceIri(dimension, value)} ;`);
    }
  }

  const lastLine = lines.pop();
  return [...lines, `${lastLine?.slice(0, -2)} .`, ""];
}

function gameIri(slug: string): string {
  return `game:${slug}`;
}

function resourceIri(dimension: string, value: string): string {
  return `res:${encodeLocalName(`${dimension}-${value}`)}`;
}

function resourceKey(dimension: string, value: string): string {
  return `${dimension}:${value}`;
}

function encodeLocalName(value: string): string {
  return encodeURIComponent(value.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-"));
}

function literal(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}"`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
