import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER || "nano_pos",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "nano_pos",
  password: process.env.DB_PASSWORD || "nano_pos",
  port: Number(process.env.DB_PORT) || 5432,
});

export default pool;
