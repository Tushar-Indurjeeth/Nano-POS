import pool from "../lib/db";

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        color VARCHAR(50),
        sizing VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stock Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id SERIAL PRIMARY KEY,
        product_id INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Sales Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        total_amount NUMERIC(10, 2) NOT NULL,
        vat_amount NUMERIC(10, 2) NOT NULL,
        sale_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sale Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL
      );
    `);

    // Trigger to update 'updated_at' timestamp on product update
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query("COMMIT");
    console.log("Database schema initialized successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error initializing database schema:", error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

initDb();
