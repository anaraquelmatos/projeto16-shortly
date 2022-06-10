import connection from "../database.js";
import joi from "joi";
import { nanoid } from "nanoid";

export async function postUrlShorten(req, res) {

    const { url } = req.body;

    const { session } = res.locals;

    const bodySchema = joi.object({
        url: joi.string().pattern(/^https?:\/\/(www\.)[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}$/).required(),
    });

    const { error } = bodySchema.validateAsync({ url });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));;
        return;
    }

    try {
        const shortUrl = nanoid();
        await connection.query(`INSERT INTO links ("shortUrl", url, "userId") VALUES ($1, $2, $3)`,
            [shortUrl, url, session[0].userId]);
        res.status(201).send({ shortUrl });
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function getUrlId(req, res) {

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
}

export async function getOpenShortUrl(req, res) {

    const { shortUrl } = req.params;
    const view = 1;

    try {
        const links = await connection.query(`SELECT * FROM links WHERE "shortUrl"=$1`,
            [shortUrl]);

        if (links.rows.length === 0) {
            return res.sendStatus(404);
        }

        const sumViews = Number(links.rows[0].visitCount) + view;

        await connection.query(`UPDATE links SET "visitCount"=$1 WHERE id=$2`, [sumViews, links.rows[0].id])

        res.redirect(links.rows[0].url);
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function deleteUrlId(req, res) {

    const { id } = req.params;

    const { token } = res.locals;

    try {

        const shortUrl = await connection.query(`SELECT * FROM links WHERE id=$1`,
            [id]);

        if (shortUrl.rows.length === 0) return res.sendStatus(404);

        const user = await connection.query(`
            SELECT links."shortUrl", links."userId" AS id
            FROM links 
            JOIN sessions
            ON links."userId" = sessions."userId"
            WHERE sessions.token=$1
            AND links."shortUrl"=$2`,
            [token, shortUrl.rows[0].shortUrl]);

        if (user.rows.length === 0) return res.sendStatus(401);

        await connection.query(`DELETE FROM links WHERE "shortUrl"=$1`, [shortUrl.rows[0].shortUrl]);

        res.sendStatus(204);

    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}
