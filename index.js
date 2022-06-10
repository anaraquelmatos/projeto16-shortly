import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { postSignUp } from "./controllers/signupController.js";
import { postSignIn } from "./controllers/signinController.js";
import { getUserId } from "./controllers/userController.js";
import { getRanking } from "./controllers/rankingController.js";
import urlsRouters from "./routers/urlsRouters.js";
import { tokenMiddleware } from "./middlewares/tokenMiddleware.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.post('/signup', postSignUp)

app.post('/signin', postSignIn)

app.use(urlsRouters);

app.get('/users/:id', tokenMiddleware, getUserId)

app.get('/ranking', getRanking)

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})