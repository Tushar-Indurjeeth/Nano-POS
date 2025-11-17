import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM sales");
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const { total_amount, vat_amount, items } = await request.json();

    await client.query("BEGIN");

    const saleResult = await client.query(
      "INSERT INTO sales (total_amount, vat_amount) VALUES ($1, $2) RETURNING id",
      [total_amount, vat_amount]
    );
    const saleId = saleResult.rows[0].id;

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;
      await client.query(
        "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [saleId, product_id, quantity, unit_price]
      );
      await client.query(
        "UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2",
        [quantity, product_id]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { saleId, message: "Sale created successfully" },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
