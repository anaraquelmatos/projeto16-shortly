import connection from "../database.js";

export async function tokenMiddleware(req, res, next) {

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "").trim();

    try {
        const session = await connection.query(`SELECT * FROM sessions WHERE token=$1`,
            [token]);

        if (session.rows.length === 0) {
            return res.sendStatus(401);
        }

        res.locals.token = token;
        res.locals.session = session.rows;
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }

    next();
}
