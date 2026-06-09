import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.created_at,

        COUNT(DISTINCT b.id)::int AS total_books,
        COUNT(DISTINCT m.id)::int AS total_magazines

      FROM categories c

      LEFT JOIN books b
        ON b.category_id = c.id
        AND b.is_active = TRUE

      LEFT JOIN magazines m
        ON m.category_id = c.id
        AND m.is_active = TRUE

      GROUP BY c.id

      ORDER BY c.name ASC
    `;

    const result = await db.query(query);

    return NextResponse.json(
      {
        success: true,
        count: result.rowCount,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar categorías:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar las categorías.",
      },
      { status: 500 }
    );
  }
}