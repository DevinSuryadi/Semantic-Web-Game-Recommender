import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "../config.js";

const rootDir = resolve(import.meta.dirname, "../../../..");
const ttlFiles = [
  resolve(rootDir, "ontology/gamefeel_ontology.ttl"),
  resolve(rootDir, "rdf/gamefeel_data.ttl")
];

async function main() {
  await runUpdate("CLEAR DEFAULT");

  for (const filePath of ttlFiles) {
    const turtle = await readFile(filePath, "utf8");
    await uploadTurtle(turtle);
    console.log(`Loaded ${filePath}`);
  }

  console.log("Fuseki default graph is up to date.");
}

async function runUpdate(update: string) {
  const response = await fetch(config.fusekiUpdateEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ update })
  });

  if (!response.ok) {
    throw new Error(`Fuseki update failed (${response.status}): ${await response.text()}`);
  }
}

async function uploadTurtle(turtle: string) {
  const response = await fetch(`${config.fusekiDataEndpoint}?default`, {
    method: "POST",
    headers: {
      "Content-Type": "text/turtle"
    },
    body: turtle
  });

  if (!response.ok) {
    throw new Error(`Fuseki Turtle upload failed (${response.status}): ${await response.text()}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
