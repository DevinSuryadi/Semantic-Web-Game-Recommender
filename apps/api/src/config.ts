import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  fusekiQueryEndpoint: process.env.FUSEKI_QUERY_ENDPOINT ?? "http://localhost:3030/GameFeel/query",
  fusekiUpdateEndpoint: process.env.FUSEKI_UPDATE_ENDPOINT ?? "http://localhost:3030/GameFeel/update",
  fusekiDataEndpoint: process.env.FUSEKI_DATA_ENDPOINT ?? "http://localhost:3030/GameFeel/data"
};
