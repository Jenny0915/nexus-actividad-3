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
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "El identificador del usuario debe ser un número entero válido.",
        },
        { status: 400 }
      );
    }

    const userResult = await db.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un usuario con el identificador ${userId}.`,
        },
        { status: 404 }
      );
    }

    const reservationsResult = await db.query(
      `
        SELECT
          r.id,
          r.start_time,
          r.end_time,
          r.attendees,
          r.status,
          r.notes,
          r.created_at,
          r.updated_at,

          JSON_BUILD_OBJECT(
            'id', cs.id,
            'name', cs.name,
            'code', cs.code,
            'capacity', cs.capacity,
            'location', cs.location,
            'space_type', cs.space_type,
            'hourly_rate', cs.hourly_rate
          ) AS space,

          CASE
            WHEN r.status = 'cancelled' THEN 'cancelled'
            WHEN CURRENT_TIMESTAMP < r.start_time THEN 'upcoming'
            WHEN CURRENT_TIMESTAMP >= r.start_time
              AND CURRENT_TIMESTAMP < r.end_time THEN 'active'
            ELSE 'finished'
          END AS temporal_status

        FROM reservations r

        INNER JOIN coworking_spaces cs
          ON cs.id = r.space_id

        WHERE r.user_id = $1

        ORDER BY r.start_time DESC
      `,
      [userId]
    );

    return NextResponse.json(
      {
        success: true,
        user: userResult.rows[0],
        count: reservationsResult.rowCount,
        data: reservationsResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar reservas del usuario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar las reservas del usuario.",
      },
      { status: 500 }
    );
  }
}