import connection from "../database.js";
import joi from "joi";
import { v4 } from "uuid";
import bcrypt from "bcrypt";

export async function postSignIn(req, res) {

    const { email, password } = req.body;

    const user = {
        email,
        password
    }

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = userSchema.validateAsync(user, { abortEarly: false });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try {

        const userValidation = await connection.query(`SELECT * FROM users WHERE email=$1`,
            [email]);

        if(userValidation.rows.length === 0) return res.sendStatus(401);

        if (userValidation.rows[0].password && bcrypt.compareSync(password, userValidation.rows[0].password)) {
            const token = v4();
            await connection.query(`INSERT INTO sessions (token, "userId") VALUES ($1, $2)`, [token, userValidation.rows[0].id]);
            res.status(200).send(token);

        }else{
            res.sendStatus(401);
            return;
        }


    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}