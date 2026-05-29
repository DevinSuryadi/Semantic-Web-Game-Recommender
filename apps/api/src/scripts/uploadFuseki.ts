import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const fusekiDataEndpoint = process.env.FUSEKI_DATA_ENDPOINT ?? "http://localhost:3030/GameFeel/data";
const ontologyPath = resolve(process.cwd(), "../../ontology/gamefeel_ontology.ttl");
const rdfPath = resolve(process.cwd(), "../../rdf/gamefeel_data.ttl");

async function main() {
  await uploadTurtle(ontologyPath, "ontology");
  await uploadTurtle(rdfPath, "RDF data");
  console.log(`Uploaded ontology and RDF to ${fusekiDataEndpoint}`);
}

async function uploadTurtle(path: string, label: string) {
  const turtle = await readFile(path, "utf8");
  const response = await fetch(`${fusekiDataEndpoint}?default`, {
    method: "POST",
    headers: {
      "Content-Type": "text/turtle"
    },
    body: turtle
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to upload ${label} (${response.status}): ${message}`);
  }

  console.log(`Uploaded ${label}: ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
