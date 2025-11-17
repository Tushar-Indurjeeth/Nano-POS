import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get("sale_id");
    const client = await pool.connect();
    let result;

    if (saleId) {
      result = await client.query(
        "SELECT * FROM sale_items WHERE sale_id = $1",
        [saleId]
      );
    } else {
      result = await client.query("SELECT * FROM sale_items");
    }

    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sale items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
