import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { postSignUp } from "./controllers/signupController.js";
import { postSignIn } from "./controllers/signinController.js";
import { deleteUrlId, getOpenShortUrl, getUrlId, postUrlShorten } from "./controllers/urlsController.js";
import { getUserId } from "./controllers/userController.js";
import { getRanking } from "./controllers/rankingController.js";


const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.post('/signup', postSignUp)

app.post('/signin', postSignIn)

app.post('/urls/shorten', postUrlShorten)

app.get('/urls/:id', getUrlId)

app.get('/urls/open/:shortUrl', getOpenShortUrl)

app.delete('/urls/:id', deleteUrlId)

app.get('/users/:id', getUserId)

app.get('/ranking',getRanking)

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})