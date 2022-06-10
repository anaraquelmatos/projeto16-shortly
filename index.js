import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { v4 } from "uuid";
import { nanoid } from "nanoid";

import connection from "./database.js";


const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.post('/signup', async (req, res) => {

    const { name, email, password } = req.body;

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = userSchema.validateAsync({ name, email, password });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try {

        const register = await connection.query(`SELECT * FROM users WHERE email=$1`, [email]);

        if (register.rows.length !== 0) return res.sendStatus(409);

        await connection.query(`INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3)`, [name, email, password]);

        res.sendStatus(201);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/signin', async (req, res) => {

    const { email, password } = req.body;

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = userSchema.validateAsync({ email, password });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try {
        const userValidation = await connection.query(`SELECT * FROM users WHERE email=$1 AND password=$2`,
            [email, password]);

        if (userValidation.rows.length === 0) {
            res.sendStatus(401);
            return;
        }

        const token = v4();
        await connection.query(`INSERT INTO sessions (token, "userId") VALUES ($1, $2)`, [token, userValidation.rows[0].id]);
        res.status(200).send(token);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.post('/urls/shorten', async (req, res) => {

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "").trim();

    const { url } = req.body;

    const view = 0;

    const bodySchema = joi.object({
        url: joi.string().pattern(/^https?:\/\/(www\.)[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}$/).required(),
    });

    const { error } = bodySchema.validateAsync({ url });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try {
        const session = await connection.query(`SELECT * FROM sessions WHERE token=$1`,
            [token]);

        if (session.rows.length === 0) {
            return res.sendStatus(401);
        } else {
            const shortUrl = nanoid();
            await connection.query(`INSERT INTO links ("shortUrl", url, "userId") VALUES ($1, $2, $3)`,
                [shortUrl, url, session.rows[0].userId]);
            res.status(201).send({shortUrl});
        }
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.get('/urls/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const links = await connection.query(`SELECT * FROM links WHERE id=$1`,
            [id]);

        if (links.rows.length === 0) {
            return res.sendStatus(404);
        }

        delete links.rows[0].createdAt;
        delete links.rows[0].visitCount;
        delete links.rows[0].userId;

        res.status(200).send(links.rows[0]);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

app.get('/urls/open/:shortUrl', async (req, res) => {

    const { shortUrl } = req.params;
    const view = 1;

    try {
        const links = await connection.query(`SELECT * FROM links WHERE "shortUrl"=$1`,
            [shortUrl]);

        if (links.rows.length === 0) {
            return res.sendStatus(404);
        }

        const sumViews = parseInt(links.rows[0].visitCount + view);

        await connection.query(`UPDATE links SET "visitCount"=$1 WHERE id=$2`, [sumViews, links.rows[0].id])

        res.redirect(`/urls/open/${shortUrl}`);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Servidor conectado!");
})