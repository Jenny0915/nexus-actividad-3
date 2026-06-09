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
    const magazineId = Number(id);

    if (!Number.isInteger(magazineId) || magazineId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "El identificador de la revista debe ser un número entero válido.",
        },
        { status: 400 }
      );
    }

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
        ) AS publisher

      FROM magazines m

      INNER JOIN categories c
        ON c.id = m.category_id

      INNER JOIN publishers p
        ON p.id = m.publisher_id

      WHERE m.id = $1
        AND m.is_active = TRUE
    `;

    const result = await db.query(query, [magazineId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró una revista activa con el identificador ${magazineId}.`,
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
    console.error("Error al consultar la revista:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar la información de la revista.",
      },
      { status: 500 }
    );
  }
}