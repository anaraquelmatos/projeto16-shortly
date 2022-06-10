import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const user = 'postgres';
const password = 'filipeana';
const host = 'localhost';
const port = 5432;
const database = 'postgres';

const { Pool } = pg;
const connection = new Pool({
  user,
  password,
  host,
  port,
  database

  // connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

export default connection;