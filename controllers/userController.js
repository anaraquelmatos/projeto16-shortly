import connection from "../database.js";

export async function getUserId(req, res) {

        const { id } = req.params;
    
        const { authorization } = req.headers;
        const token = authorization?.replace("Bearer", "").trim();
    
        try {
    
            const user = await connection.query(`SELECT * FROM users WHERE id=$1`,
                [id]);
    
            if (user.rows.length === 0) return res.sendStatus(404);
    
            const session = await connection.query(`SELECT * FROM sessions WHERE token=$1`,
                [token]);
    
            if (session.rows.length === 0) return res.sendStatus(401);
    
            const visits = await connection.query(`
            SELECT 
            SUM(links."visitCount") 
            FROM links
            WHERE "userId"=$1`,
                [id]);
    
            const viewsUser = await connection.query(`
            SELECT id, "shortUrl", url, "visitCount"
            FROM links
            WHERE "userId"=$1`,
                [id]);
    
            const array = {
                id,
                name: user.rows[0].name,
                visitCount: visits.rows[0].sum,
                shortenedUrls: viewsUser.rows
            }
    
            res.status(200).send(array);
    
        }
        catch (e) {
            res.sendStatus(500);
            console.log(e);
        }
}