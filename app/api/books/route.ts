import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const year = searchParams.get("year");
    const language = searchParams.get("language");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const conditions: string[] = ["b.is_active = TRUE"];
    const values: Array<string | number> = [];

    if (categoryId) {
      values.push(Number(categoryId));
      conditions.push(`b.category_id = $${values.length}`);
    }

    if (year) {
      values.push(Number(year));
      conditions.push(`b.publication_year = $${values.length}`);
    }

    if (language) {
      values.push(language);
      conditions.push(`LOWER(b.language) = LOWER($${values.length})`);
    }

    if (minPrice) {
      values.push(Number(minPrice));
      conditions.push(`b.price >= $${values.length}`);
    }

    if (maxPrice) {
      values.push(Number(maxPrice));
      conditions.push(`b.price <= $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          b.title ILIKE $${values.length}
          OR b.description ILIKE $${values.length}
          OR b.isbn ILIKE $${values.length}
        )
      `);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
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
        b.is_active,
        b.created_at,
        b.updated_at,

        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,

        p.id AS publisher_id,
        p.name AS publisher_name,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS authors

      FROM books b

      INNER JOIN categories c
        ON c.id = b.category_id

      INNER JOIN publishers p
        ON p.id = b.publisher_id

      LEFT JOIN book_authors ba
        ON ba.book_id = b.id

      LEFT JOIN authors a
        ON a.id = ba.author_id

      ${whereClause}

      GROUP BY
        b.id,
        c.id,
        p.id

      ORDER BY b.title ASC
    `;

    const result = await db.query(query, values);

    return NextResponse.json(
      {
        success: true,
        count: result.rowCount,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar libros:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar los libros.",
      },
      { status: 500 }
    );
  }
}