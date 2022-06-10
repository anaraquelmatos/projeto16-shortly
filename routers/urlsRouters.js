import { Router } from "express";
import { deleteUrlId, getOpenShortUrl, getUrlId, postUrlShorten } from "../controllers/urlsController.js";
import { tokenMiddleware } from "../middlewares/tokenMiddleware.js";

const urlsRouters = Router();

urlsRouters.post("/urls/shorten", tokenMiddleware, postUrlShorten);

urlsRouters.get("/urls/:id", getUrlId);

urlsRouters.get("/urls/open/:shortUrl", getOpenShortUrl);

urlsRouters.delete("/urls/:id", tokenMiddleware, deleteUrlId);

export default urlsRouters;