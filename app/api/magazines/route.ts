import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const year = searchParams.get("year");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const conditions: string[] = ["m.is_active = TRUE"];
    const values: Array<string | number> = [];

    if (categoryId) {
      values.push(Number(categoryId));
      conditions.push(`m.category_id = $${values.length}`);
    }

    if (year) {
      values.push(Number(year));
      conditions.push(
        `EXTRACT(YEAR FROM m.publication_date) = $${values.length}`
      );
    }

    if (minPrice) {
      values.push(Number(minPrice));
      conditions.push(`m.price >= $${values.length}`);
    }

    if (maxPrice) {
      values.push(Number(maxPrice));
      conditions.push(`m.price <= $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          m.title ILIKE $${values.length}
          OR m.description ILIKE $${values.length}
          OR m.issn ILIKE $${values.length}
          OR m.issue_number ILIKE $${values.length}
        )
      `);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const query = `
      SELECT
        m.id,
        m.title,
        m.issn,
        m.issue_number,
        m.publication_date,
        m.description,
        m.price,
        m.stock,
        m.cover_url,
        m.is_active,
        m.created_at,
        m.updated_at,

        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,

        p.id AS publisher_id,
        p.name AS publisher_name,
        p.country AS publisher_country

      FROM magazines m

      INNER JOIN categories c
        ON c.id = m.category_id

      INNER JOIN publishers p
        ON p.id = m.publisher_id

      ${whereClause}

      ORDER BY
        m.publication_date DESC,
        m.title ASC
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
    console.error("Error al consultar revistas:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar las revistas.",
      },
      { status: 500 }
    );
  }
}