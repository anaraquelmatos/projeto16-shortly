import connection from "../database.js";
import joi from "joi";
import bcrypt from "bcrypt";

export async function postSignUp(req, res) {

        const { name, email, password, confirmPassword } = req.body;
    
        const passwordHash = bcrypt.hashSync(password, 10);
    
        const user = {
            name,
            email,
            password,
            confirmPassword
        }
    
        const userSchema = joi.object({
            name: joi.string().required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
            confirmPassword: joi.string().required()
        });
    
        const { error } = userSchema.validateAsync(user, { abortEarly: false });
    
        if (error) {
            res.status(422).send(error.details.map(detail => detail.message));;
            return;
        }
    
        if ((password !== confirmPassword)) {
            res.status(422).send("As senhas digitadas não são iguais!");
            return;
        }
    
        try {
    
            const register = await connection.query(`SELECT * FROM users WHERE email=$1`, [email]);
    
            if (register.rows.length !== 0) return res.sendStatus(409);
    
            await connection.query(`INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3)`, [name, email, passwordHash]);
    
            res.sendStatus(201);
        }
        catch (e) {
            res.sendStatus(500);
            console.log(e);
        }
}