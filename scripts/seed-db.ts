import pool from "../lib/db";

async function seedDb() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM sale_items");
    await client.query("DELETE FROM sales");
    await client.query("DELETE FROM stock");
    await client.query("DELETE FROM products");

    const products = [
      {
        sku: "TS-BLK-M",
        name: "T-Shirt",
        unit_price: 119.99,
        color: "Black",
        sizing: "M",
      },
      {
        sku: "TS-WHT-L",
        name: "T-Shirt",
        unit_price: 119.99,
        color: "White",
        sizing: "L",
      },
      {
        sku: "JN-BLU-32",
        name: "Jeans",
        unit_price: 349.99,
        color: "Blue",
        sizing: "32",
      },
      {
        sku: "SK-GRY-10",
        name: "Socks",
        unit_price: 99.99,
        color: "Grey",
        sizing: "10",
      },
    ];

    const productResult = await client.query(
      `INSERT INTO products (sku, name, unit_price, color, sizing)
       SELECT * FROM UNNEST(
         $1::text[], $2::text[], $3::numeric[], $4::text[], $5::text[]
       ) RETURNING id`,
      [
        products.map((p) => p.sku),
        products.map((p) => p.name),
        products.map((p) => p.unit_price),
        products.map((p) => p.color),
        products.map((p) => p.sizing),
      ]
    );
    const productIds = productResult.rows.map((row) => row.id);

    const stock = [
      { product_id: productIds[0], quantity: 100 },
      { product_id: productIds[1], quantity: 150 },
      { product_id: productIds[2], quantity: 50 },
      { product_id: productIds[3], quantity: 200 },
    ];

    await client.query(
      `INSERT INTO stock (product_id, quantity)
       SELECT * FROM UNNEST($1::int[], $2::int[])`,
      [stock.map((s) => s.product_id), stock.map((s) => s.quantity)]
    );

    const startDate = new Date("2025-11-10");
    const endDate = new Date("2025-11-18");

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const saleTimestamp = d.toISOString();

      // Generate a few random sales for each day
      const numSalesPerDay = Math.floor(Math.random() * 6) + 1;

      for (let i = 0; i < numSalesPerDay; i++) {
        let totalAmount = 0;
        let vatAmount = 0;
        const saleItems = [];

        const numItemsPerSale = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numItemsPerSale; j++) {
          const randomProductIndex = Math.floor(
            Math.random() * products.length
          );
          const product = products[randomProductIndex];
          const productId = productIds[randomProductIndex];
          const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 units

          const itemTotalPrice = product.unit_price * quantity;
          totalAmount += itemTotalPrice;
          vatAmount += itemTotalPrice * 0.15;

          saleItems.push({
            product_id: productId,
            quantity,
            unit_price: product.unit_price,
          });
        }

        const saleResult = await client.query(
          "INSERT INTO sales (total_amount, vat_amount, sale_timestamp) VALUES ($1, $2, $3) RETURNING id",
          [totalAmount, vatAmount, saleTimestamp]
        );
        const saleId = saleResult.rows[0].id;

        for (const item of saleItems) {
          await client.query(
            "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
            [saleId, item.product_id, item.quantity, item.unit_price]
          );
        }
      }
    }

    await client.query("COMMIT");
    console.log("Database seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seedDb();
