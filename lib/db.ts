import { Pool } from "pg";

const pool = new Pool({
  user: "nano_pos",
  host: "localhost",
  database: "nano_pos",
  password: "nano_pos",
  port: 5432,
});

export default pool;
