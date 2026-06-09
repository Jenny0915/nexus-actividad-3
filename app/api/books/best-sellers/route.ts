import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const query = `
      WITH book_sales AS (
        SELECT
          pi.book_id,
          SUM(pi.quantity)::int AS total_sold
        FROM purchase_items pi
        INNER JOIN purchases pu
          ON pu.id = pi.purchase_id
        WHERE pi.book_id IS NOT NULL
          AND pu.status = 'completed'
          AND pu.purchased_at >= CURRENT_TIMESTAMP - INTERVAL '8 weeks'
        GROUP BY pi.book_id
      ),

      book_author_data AS (
        SELECT
          ba.book_id,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name
            )
            ORDER BY a.first_name, a.last_name
          ) AS authors
        FROM book_authors ba
        INNER JOIN authors a
          ON a.id = ba.author_id
        GROUP BY ba.book_id
      )

      SELECT
        b.id,
        b.title,
        b.isbn,
        b.description,
        b.publication_year,
        b.language,
        b.pages,
        b.price,
        b.stock,
        b.cover_url,

        c.id AS category_id,
        c.name AS category_name,

        p.id AS publisher_id,
        p.name AS publisher_name,

        COALESCE(bs.total_sold, 0)::int AS total_sold,

        COALESCE(bad.authors, '[]'::json) AS authors

      FROM books b

      INNER JOIN categories c
        ON c.id = b.category_id

      INNER JOIN publishers p
        ON p.id = b.publisher_id

      LEFT JOIN book_sales bs
        ON bs.book_id = b.id

      LEFT JOIN book_author_data bad
        ON bad.book_id = b.id

      WHERE b.is_active = TRUE

      ORDER BY
        total_sold DESC,
        b.title ASC

      LIMIT 10
    `;

    const result = await db.query(query);

    return NextResponse.json(
      {
        success: true,
        count: result.rowCount,
        period: "Últimas 8 semanas",
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar los libros más vendidos:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar los libros más vendidos.",
      },
      { status: 500 }
    );
  }
}