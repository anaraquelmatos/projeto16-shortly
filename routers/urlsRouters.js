import { Router } from "express";
import { deleteUrlId, getOpenShortUrl, getUrlId, postUrlShorten } from "../controllers/urlsController.js";

const urlsRouters = Router();

urlsRouters.post("/urls/shorten", postUrlShorten);

urlsRouters.get("/urls/:id", getUrlId);

urlsRouters.get("/urls/open/:shortUrl", getOpenShortUrl);

urlsRouters.delete("/urls/:id", deleteUrlId);


export default urlsRouters;