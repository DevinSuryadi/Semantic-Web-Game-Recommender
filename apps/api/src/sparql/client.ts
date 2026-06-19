import { config } from "../config.js";

export type SparqlBindingValue = {
  type: string;
  value: string;
  datatype?: string;
  "xml:lang"?: string;
};

export type SparqlBinding = Record<string, SparqlBindingValue | undefined>;

export type SparqlSelectResult = {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlBinding[];
  };
};

export async function runSelectQuery(query: string): Promise<SparqlSelectResult> {
  const body = new URLSearchParams({ query });

  const response = await fetch(config.fusekiQueryEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Fuseki query failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<SparqlSelectResult>;
}
