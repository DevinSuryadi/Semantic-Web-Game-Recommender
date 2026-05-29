import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  fusekiQueryEndpoint: process.env.FUSEKI_QUERY_ENDPOINT ?? "http://localhost:3030/GameFeel/query"
};
