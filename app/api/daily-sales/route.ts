import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required query parameters." },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const result = await client.query(
      `SELECT
        DATE(sale_timestamp) as date,
        SUM(total_amount) as total_sales,
        COUNT(id) as num_sales
      FROM sales
      WHERE sale_timestamp >= $1 AND sale_timestamp < $2
      GROUP BY DATE(sale_timestamp)
      ORDER BY DATE(sale_timestamp);`,
      [startDate, adjustedEndDate.toISOString().split("T")[0]]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
