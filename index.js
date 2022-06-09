import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import {v4} from "uuid";

import connection from "./database.js";

const app = express();

app.use(json());
app.use(cors());
dotenv.config();

app.post('/signup', async (req, res) => {

    const { name, email, password } = res.body;

    const user = {
        name,
        email,
        password
    }

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = userSchema.validateAsync({ user });

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

    const { email, password } = res.body;

    const user = {
        email,
        password
    }

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = userSchema.validateAsync({ user });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try{
        const userValidation = await connection.query(`SELECT * FROM users WHERE email=$1 AND password=$2`, 
        [email, password]);

        if (userValidation.rows.length !== 0) {
            const token = v4();
            res.status(200).send(token);
            await connection.query(`INSERT INTO sessions (token, userId) VALUES ($1, $2)`, [token, userValidation.rows[0]]);
        } else {
            res.sendStatus(401);
            return;
        }
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