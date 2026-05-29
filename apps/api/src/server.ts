import express, { type ErrorRequestHandler } from "express";
import { config } from "./config.js";
import { gamesRouter } from "./routes/games.js";

const app = express();

app.use(express.json());
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  response.header("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/games", gamesRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: error instanceof Error ? error.message : "Unexpected server error"
  });
};

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GameFeel API running at http://localhost:${config.port}`);
});
