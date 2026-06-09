import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const available = searchParams.get("available");
    const spaceType = searchParams.get("spaceType");
    const minCapacity = searchParams.get("minCapacity");

    const conditions: string[] = ["cs.is_active = TRUE"];
    const values: Array<string | number | boolean> = [];

    if (spaceType) {
      values.push(spaceType);
      conditions.push(`cs.space_type = $${values.length}`);
    }

    if (minCapacity) {
      values.push(Number(minCapacity));
      conditions.push(`cs.capacity >= $${values.length}`);
    }

    const availabilityFilter =
      available === "true"
        ? "AND active_reservation.id IS NULL"
        : available === "false"
          ? "AND active_reservation.id IS NOT NULL"
          : "";

    const query = `
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
        END AS current_reservation

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

      WHERE ${conditions.join(" AND ")}
      ${availabilityFilter}

      ORDER BY
        is_available DESC,
        cs.name ASC
    `;

    const result = await db.query(query, values);

    return NextResponse.json(
      {
        success: true,
        count: result.rowCount,
        filters: {
          available:
            available === null ? null : available === "true",
          spaceType: spaceType ?? null,
          minCapacity: minCapacity ? Number(minCapacity) : null,
        },
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar espacios de coworking:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar los espacios de coworking.",
      },
      { status: 500 }
    );
  }
}