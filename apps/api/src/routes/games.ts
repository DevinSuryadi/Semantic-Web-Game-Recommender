import { Router } from "express";
import { getGameDetail, getRecommendations, searchGames } from "../services/gameService.js";

export const gamesRouter = Router();

gamesRouter.get("/search", async (request, response, next) => {
  try {
    const searchTerm = typeof request.query.q === "string" ? request.query.q : "";
    const games = await searchGames(searchTerm);
    response.json({ data: games });
  } catch (error) {
    next(error);
  }
});

gamesRouter.get("/:slug/recommendations", async (request, response, next) => {
  try {
    const recommendations = await getRecommendations(request.params.slug);
    response.json({ data: recommendations });
  } catch (error) {
    next(error);
  }
});

gamesRouter.get("/:slug", async (request, response, next) => {
  try {
    const game = await getGameDetail(request.params.slug);

    if (!game) {
      response.status(404).json({ error: "Game not found" });
      return;
    }

    response.json({ data: game });
  } catch (error) {
    next(error);
  }
});
