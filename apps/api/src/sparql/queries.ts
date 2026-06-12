const prefixes = `
PREFIX gf: <http://example.org/gamefeel#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
`;

export function buildSearchGamesQuery(searchTerm: string): string {
  const safeTerm = sparqlString(searchTerm.trim());

  return `${prefixes}
SELECT ?game ?title ?slug
  (SAMPLE(?descriptionValue) AS ?description)
  (SAMPLE(?imageUrlValue) AS ?imageUrl)
  (SAMPLE(?ratingValue) AS ?rating)
  (GROUP_CONCAT(DISTINCT ?genreLabel; separator="|") AS ?genres)
WHERE {
  ?game a gf:Game ;
    gf:title ?title ;
    gf:slug ?slug .

  OPTIONAL { ?game gf:description ?descriptionValue . }
  OPTIONAL { ?game gf:imageUrl ?imageUrlValue . }
  OPTIONAL { ?game gf:rating ?ratingValue . }
  OPTIONAL {
    ?game gf:hasGenre ?genre .
    ?genre rdfs:label ?genreLabel .
  }

  FILTER(CONTAINS(LCASE(?title), LCASE(${safeTerm})))
}
GROUP BY ?game ?title ?slug
ORDER BY ?title
LIMIT 20`;
}

export function buildGameDetailQuery(slug: string): string {
  const safeSlug = sparqlString(slug);

  return `${prefixes}
SELECT ?game ?title ?slug ?predicate ?valueLabel
  (SAMPLE(?imageUrlValue) AS ?imageUrl)
  (SAMPLE(?ratingValue) AS ?rating)
WHERE {
  ?game a gf:Game ;
    gf:title ?title ;
    gf:slug ?slug .

  VALUES ?slug { ${safeSlug} }

  OPTIONAL { ?game gf:imageUrl ?imageUrlValue . }
  OPTIONAL { ?game gf:rating ?ratingValue . }

  ?game ?predicate ?value .
  OPTIONAL { ?value rdfs:label ?label . }

  FILTER(?predicate != rdf:type)

  BIND(COALESCE(?label, STR(?value)) AS ?valueLabel)
}
GROUP BY ?game ?title ?slug ?predicate ?valueLabel
ORDER BY ?predicate ?valueLabel`;
}

export function buildRecommendationsQuery(slug: string): string {
  const safeSlug = sparqlString(slug);

  return `${prefixes}
SELECT ?game ?title ?slug
  (SAMPLE(?descriptionValue) AS ?description)
  (SAMPLE(?imageUrlValue) AS ?imageUrl)
  (SAMPLE(?ratingValue) AS ?rating)
  (SUM(?weight) AS ?score)
  (GROUP_CONCAT(DISTINCT ?reason; separator="|") AS ?reasons)
WHERE {
  ?input a gf:Game ;
    gf:slug ?inputSlug .

  VALUES ?inputSlug { ${safeSlug} }

  ?game a gf:Game ;
    gf:title ?title ;
    gf:slug ?slug .

  OPTIONAL { ?game gf:description ?descriptionValue . }
  OPTIONAL { ?game gf:imageUrl ?imageUrlValue . }
  OPTIONAL { ?game gf:rating ?ratingValue . }

  FILTER(?game != ?input)

  {
    ?input gf:hasGenre ?shared .
    ?game gf:hasGenre ?shared .
    ?shared rdfs:label ?label .
    BIND(3 AS ?weight)
    BIND(CONCAT("Genre: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasSubGenre ?shared .
    ?game gf:hasSubGenre ?shared .
    ?shared rdfs:label ?label .
    BIND(3 AS ?weight)
    BIND(CONCAT("SubGenre: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasMood ?shared .
    ?game gf:hasMood ?shared .
    ?shared rdfs:label ?label .
    BIND(2 AS ?weight)
    BIND(CONCAT("Mood: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasTheme ?shared .
    ?game gf:hasTheme ?shared .
    ?shared rdfs:label ?label .
    BIND(2 AS ?weight)
    BIND(CONCAT("Theme: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasMechanic ?shared .
    ?game gf:hasMechanic ?shared .
    ?shared rdfs:label ?label .
    BIND(2 AS ?weight)
    BIND(CONCAT("Mechanic: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasMode ?shared .
    ?game gf:hasMode ?shared .
    ?shared rdfs:label ?label .
    BIND(2 AS ?weight)
    BIND(CONCAT("Mode: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasCombatStyle ?shared .
    ?game gf:hasCombatStyle ?shared .
    ?shared rdfs:label ?label .
    BIND(2 AS ?weight)
    BIND(CONCAT("CombatStyle: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasDifficulty ?shared .
    ?game gf:hasDifficulty ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("Difficulty: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasPacing ?shared .
    ?game gf:hasPacing ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("Pacing: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasPerspective ?shared .
    ?game gf:hasPerspective ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("Perspective: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasArtStyle ?shared .
    ?game gf:hasArtStyle ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("ArtStyle: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:availableOn ?shared .
    ?game gf:availableOn ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("Platform: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasTag ?shared .
    ?game gf:hasTag ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("Tag: ", ?label) AS ?reason)
  }
  UNION
  {
    ?input gf:hasQualityTier ?shared .
    ?game gf:hasQualityTier ?shared .
    ?shared rdfs:label ?label .
    BIND(1 AS ?weight)
    BIND(CONCAT("QualityTier: ", ?label) AS ?reason)
  }
}
GROUP BY ?game ?title ?slug
ORDER BY DESC(?score) ?title
LIMIT 10`;
}

function sparqlString(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}"`;
}
