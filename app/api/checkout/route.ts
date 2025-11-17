import { NextResponse } from "next/server";
import pool from "@/lib/db";

const processedRequests = new Set<string>();

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("X-Idempotency-Key");
  if (idempotencyKey && processedRequests.has(idempotencyKey)) {
    return NextResponse.json(
      { message: "Request already processed" },
      { status: 200 }
    );
  }

  const client = await pool.connect();

  try {
    const { total_amount, vat_amount, items } = await request.json();

    await client.query("BEGIN");

    // Stock validation
    for (const item of items) {
      const { product_id, quantity } = item;
      const stockResult = await client.query(
        "SELECT quantity FROM stock WHERE product_id = $1",
        [product_id]
      );
      if (
        stockResult.rows.length === 0 ||
        stockResult.rows[0].quantity < quantity
      ) {
        throw new Error(`Insufficient stock for product ID ${product_id}`);
      }
    }

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

    if (idempotencyKey) {
      processedRequests.add(idempotencyKey);
    }

    return NextResponse.json(
      { saleId, message: "Checkout successful" },
      { status: 201 }
    );
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    console.error("Error during checkout:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
