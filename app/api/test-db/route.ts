import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        current_database() AS database_name,
        COUNT(*)::int AS total_books
      FROM books
    `);

    return NextResponse.json(
      {
        success: true,
        message: "Conexión con PostgreSQL realizada correctamente.",
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible conectar con PostgreSQL.",
      },
      { status: 500 }
    );
  }
}