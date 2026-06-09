import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ReservationRequestBody {
  userId: number;
  spaceId: number;
  startTime: string;
  endTime: string;
  attendees: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  const client = await db.connect();

  try {
    const body = (await request.json()) as ReservationRequestBody;

    const {
      userId,
      spaceId,
      startTime,
      endTime,
      attendees,
      notes,
    } = body;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(spaceId) ||
      spaceId <= 0 ||
      !Number.isInteger(attendees) ||
      attendees <= 0 ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Debe enviar un usuario, espacio, horario y número de asistentes válidos.",
        },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Las fechas enviadas no tienen un formato válido.",
        },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "La hora de finalización debe ser posterior a la hora de inicio.",
        },
        { status: 400 }
      );
    }

    if (startDate <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "La reserva debe realizarse para una fecha futura.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const userResult = await client.query(
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
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un usuario con el identificador ${userId}.`,
        },
        { status: 404 }
      );
    }

    const spaceResult = await client.query(
      `
        SELECT
          id,
          name,
          code,
          capacity,
          is_active
        FROM coworking_spaces
        WHERE id = $1
        FOR UPDATE
      `,
      [spaceId]
    );

    if (spaceResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un espacio con el identificador ${spaceId}.`,
        },
        { status: 404 }
      );
    }

    const space = spaceResult.rows[0];

    if (!space.is_active) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "El espacio solicitado se encuentra inactivo.",
        },
        { status: 400 }
      );
    }

    if (attendees > space.capacity) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: `El espacio tiene una capacidad máxima de ${space.capacity} persona(s).`,
        },
        { status: 409 }
      );
    }

    const overlapResult = await client.query(
      `
        SELECT
          id,
          start_time,
          end_time
        FROM reservations
        WHERE space_id = $1
          AND status IN ('pending', 'confirmed')
          AND start_time < $3
          AND end_time > $2
        LIMIT 1
      `,
      [spaceId, startDate.toISOString(), endDate.toISOString()]
    );

    if ((overlapResult.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "El espacio ya tiene una reserva que se cruza con el horario solicitado.",
          conflict: overlapResult.rows[0],
        },
        { status: 409 }
      );
    }

    const reservationResult = await client.query(
      `
        INSERT INTO reservations (
          user_id,
          space_id,
          start_time,
          end_time,
          attendees,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
        RETURNING
          id,
          user_id,
          space_id,
          start_time,
          end_time,
          attendees,
          status,
          notes,
          created_at,
          updated_at
      `,
      [
        userId,
        spaceId,
        startDate.toISOString(),
        endDate.toISOString(),
        attendees,
        notes?.trim() || null,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Reserva creada correctamente.",
        data: {
          ...reservationResult.rows[0],
          user: userResult.rows[0],
          space: {
            id: space.id,
            name: space.name,
            code: space.code,
            capacity: space.capacity,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error al crear la reserva:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible crear la reserva.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}