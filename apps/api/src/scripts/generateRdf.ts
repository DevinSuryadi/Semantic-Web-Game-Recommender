import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { csvObjectMappings, type CsvGame } from "../semantic/schema.js";
import { parseCsv } from "../utils/csv.js";
import { resourceLocalName, splitMultiValue, turtleLiteral, typedLiteral } from "../utils/rdf.js";

const inputPath = resolve(process.cwd(), "../../data/curated/gamefeel_dataset.csv");
const outputPath = resolve(process.cwd(), "../../rdf/gamefeel_data.ttl");

async function main() {
  const games = parseCsv<CsvGame>(await readFile(inputPath, "utf8"));
  const ttl = buildTurtle(games);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${ttl}\n`, "utf8");

  console.log(`Generated ${outputPath} from ${games.length} games`);
}

function buildTurtle(games: CsvGame[]): string {
  return [
    "@prefix gf: <http://example.org/gamefeel#> .",
    "@prefix game: <http://example.org/gamefeel/game/> .",
    "@prefix res: <http://example.org/gamefeel/resource/> .",
    "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
    "",
    ...buildResourceTriples(games),
    ...games.flatMap(buildGameTriples)
  ].join("\n");
}

function buildResourceTriples(games: CsvGame[]): string[] {
  const resources = new Map<string, { className: string; value: string }>();

  for (const game of games) {
    for (const mapping of csvObjectMappings) {
      for (const value of splitMultiValue(game[mapping.column])) {
        const key = `${mapping.className}:${value}`;
        resources.set(key, {
          className: mapping.className,
          value
        });
      }
    }
  }

  return [...resources.values()]
    .sort((left, right) => left.className.localeCompare(right.className) || left.value.localeCompare(right.value))
    .flatMap(({ className, value }) => [
      `${resourceIri(className, value)} a gf:${className} ;`,
      `  rdfs:label ${turtleLiteral(value)} .`,
      ""
    ]);
}

function buildGameTriples(game: CsvGame): string[] {
  const lines = [
    `${gameIri(game.slug)} a gf:Game ;`,
    `  gf:rawgId "${Number(game.rawgId)}"^^xsd:integer ;`,
    `  gf:title ${turtleLiteral(game.title)} ;`,
    `  gf:slug ${turtleLiteral(game.slug)} ;`
  ];

  pushOptionalTyped(lines, "releaseDate", game.released, "xsd:date");
  pushOptionalTyped(lines, "rating", game.rating, "xsd:decimal");
  pushOptionalTyped(lines, "metacriticScore", game.metacritic, "xsd:integer");
  pushOptionalTyped(lines, "playtime", game.playtime, "xsd:integer");
  pushOptionalLiteral(lines, "description", game.description);
  pushOptionalTyped(lines, "imageUrl", game.imageUrl, "xsd:anyURI");

  for (const mapping of csvObjectMappings) {
    for (const value of splitMultiValue(game[mapping.column])) {
      lines.push(`  gf:${mapping.property} ${resourceIri(mapping.className, value)} ;`);
    }
  }

  const last = lines.pop();
  return [...lines, `${last?.slice(0, -2)} .`, ""];
}

function pushOptionalLiteral(lines: string[], property: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) {
    lines.push(`  gf:${property} ${turtleLiteral(trimmed)} ;`);
  }
}

function pushOptionalTyped(lines: string[], property: string, value: string, datatype: string) {
  const literal = typedLiteral(value, datatype);
  if (literal) {
    lines.push(`  gf:${property} ${literal} ;`);
  }
}

function gameIri(slug: string): string {
  return `game:${resourceLocalName(slug)}`;
}

function resourceIri(className: string, value: string): string {
  return `res:${resourceLocalName(className, value)}`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
