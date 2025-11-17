import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT s.id, s.product_id, p.name as product_name, s.quantity FROM stock s JOIN products p ON s.product_id = p.id"
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { product_id, quantity } = await request.json();
    const client = await pool.connect();

    const result = await client.query(
      "INSERT INTO stock (product_id, quantity) VALUES ($1, $2) ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity RETURNING * ",
      [product_id, quantity]
    );
    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error updating/adding stock:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
