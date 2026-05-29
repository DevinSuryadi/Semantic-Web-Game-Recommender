import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { datatypeProperties, objectProperties, ontologyClasses } from "../semantic/schema.js";
import { turtleLiteral } from "../utils/rdf.js";

const outputPath = resolve(process.cwd(), "../../ontology/gamefeel_ontology.ttl");

async function main() {
  const lines = [
    "@prefix gf: <http://example.org/gamefeel#> .",
    "@prefix owl: <http://www.w3.org/2002/07/owl#> .",
    "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
    "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
    "",
    "gf:GameFeelOntology a owl:Ontology ;",
    `  rdfs:label ${turtleLiteral("GameFeel KG ontology")} ;`,
    `  rdfs:comment ${turtleLiteral("Ontology for semantic game recommendation based on game feel, RDF, and SPARQL.")} .`,
    "",
    ...ontologyClasses.flatMap((className) => [
      `gf:${className} a owl:Class ;`,
      `  rdfs:label ${turtleLiteral(classLabel(className))} .`,
      ""
    ]),
    ...objectProperties.flatMap((property) => [
      `gf:${property.name} a owl:ObjectProperty ;`,
      "  rdfs:domain gf:Game ;",
      `  rdfs:range gf:${property.range} ;`,
      `  rdfs:label ${turtleLiteral(property.label)} .`,
      ""
    ]),
    ...datatypeProperties.flatMap((property) => [
      `gf:${property.name} a owl:DatatypeProperty ;`,
      "  rdfs:domain gf:Game ;",
      `  rdfs:range ${property.range} ;`,
      `  rdfs:label ${turtleLiteral(property.label)} .`,
      ""
    ])
  ];

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Generated ${outputPath}`);
}

function classLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
