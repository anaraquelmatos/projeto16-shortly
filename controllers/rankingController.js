import connection from "../database.js";

export async function getRanking(req, res) {

        try{
            const visits = await connection.query(`
            SELECT users.id, users.name, COUNT(links."userId")
            AS "linksCount", SUM(links."visitCount") AS "visitCount"
            FROM links
            JOIN users
            ON links."userId" = users.id
            GROUP BY users.id
            ORDER BY "visitCount" DESC
            LIMIT 10`);
    
            res.status(200).send(visits.rows);
    
        }
        catch (e) {
            res.sendStatus(500);
            console.log(e);
        }
}