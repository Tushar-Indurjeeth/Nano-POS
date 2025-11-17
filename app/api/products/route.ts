import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("search");

  try {
    const client = await pool.connect();
    let result;

    if (searchQuery) {
      result = await client.query(
        "SELECT id, sku, name, unit_price, color, sizing, created_at, updated_at FROM products WHERE name ILIKE $1 OR sku ILIKE $1",
        [`%${searchQuery}%`]
      );
    } else {
      result = await client.query(
        "SELECT id, sku, name, unit_price, color, sizing, created_at, updated_at FROM products"
      );
    }

    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { sku, name, unit_price, color, sizing } = await request.json();
    const client = await pool.connect();

    const result = await client.query(
      "INSERT INTO products (sku, name, unit_price, color, sizing) VALUES ($1, $2, $3, $4, $5) RETURNING * ",
      [sku, name, unit_price, color, sizing]
    );
    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
