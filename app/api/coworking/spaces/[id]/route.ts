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
    const spaceId = Number(id);

    if (!Number.isInteger(spaceId) || spaceId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "El identificador del espacio debe ser un número entero válido.",
        },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
        SELECT
          cs.id,
          cs.name,
          cs.code,
          cs.description,
          cs.capacity,
          cs.location,
          cs.space_type,
          cs.hourly_rate,
          cs.is_active,
          cs.created_at,
          cs.updated_at,

          CASE
            WHEN active_reservation.id IS NULL THEN TRUE
            ELSE FALSE
          END AS is_available,

          CASE
            WHEN active_reservation.id IS NULL THEN NULL
            ELSE JSON_BUILD_OBJECT(
              'reservation_id', active_reservation.id,
              'start_time', active_reservation.start_time,
              'end_time', active_reservation.end_time,
              'attendees', active_reservation.attendees,
              'status', active_reservation.status,
              'user', JSON_BUILD_OBJECT(
                'id', active_reservation.user_id,
                'first_name', active_reservation.first_name,
                'last_name', active_reservation.last_name,
                'email', active_reservation.email
              )
            )
          END AS current_reservation,

          COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', r.id,
                  'start_time', r.start_time,
                  'end_time', r.end_time,
                  'attendees', r.attendees,
                  'status', r.status,
                  'user_id', r.user_id
                )
                ORDER BY r.start_time ASC
              )
              FROM reservations r
              WHERE r.space_id = cs.id
                AND r.start_time >= CURRENT_TIMESTAMP
                AND r.status IN ('pending', 'confirmed')
            ),
            '[]'
          ) AS upcoming_reservations

        FROM coworking_spaces cs

        LEFT JOIN LATERAL (
          SELECT
            r.id,
            r.user_id,
            r.start_time,
            r.end_time,
            r.attendees,
            r.status,
            u.first_name,
            u.last_name,
            u.email

          FROM reservations r

          INNER JOIN users u
            ON u.id = r.user_id

          WHERE r.space_id = cs.id
            AND r.status = 'confirmed'
            AND CURRENT_TIMESTAMP >= r.start_time
            AND CURRENT_TIMESTAMP < r.end_time

          ORDER BY r.start_time ASC
          LIMIT 1
        ) AS active_reservation
          ON TRUE

        WHERE cs.id = $1
          AND cs.is_active = TRUE
      `,
      [spaceId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un espacio activo con el identificador ${spaceId}.`,
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
    console.error("Error al consultar el espacio:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar el espacio de coworking.",
      },
      { status: 500 }
    );
  }
}