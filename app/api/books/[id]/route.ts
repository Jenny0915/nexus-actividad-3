import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const bookId = Number(id);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador del libro debe ser un número entero válido.",
        },
        { status: 400 }
      );
    }

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

        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'description', c.description
        ) AS category,

        JSON_BUILD_OBJECT(
          'id', p.id,
          'name', p.name,
          'country', p.country,
          'website', p.website
        ) AS publisher,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'first_name', a.first_name,
              'last_name', a.last_name,
              'biography', a.biography
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

      WHERE b.id = $1
        AND b.is_active = TRUE

      GROUP BY
        b.id,
        c.id,
        p.id
    `;

    const result = await db.query(query, [bookId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un libro activo con el identificador ${bookId}.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar el libro:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar la información del libro.",
      },
      { status: 500 }
    );
  }
}