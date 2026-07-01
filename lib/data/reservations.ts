import { db } from "@/lib/db";

export interface ReservationHistoryUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ReservationSpaceSummary {
  id: number;
  name: string;
  code: string;
  capacity: number;
  location: string;
  space_type: string;
  hourly_rate: string | number;
}

export type ReservationTemporalStatus =
  | "upcoming"
  | "active"
  | "finished"
  | "cancelled";

export interface UserReservation {
  id: number;
  start_time: Date | string;
  end_time: Date | string;
  attendees: number;
  status: string;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  space: ReservationSpaceSummary;
  temporal_status: ReservationTemporalStatus;
}

export interface UserReservationHistory {
  user: ReservationHistoryUser;
  reservations: UserReservation[];
}

function normalizeUserId(userId: number | string): number | null {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
}

export async function getUserReservationHistory(
  userId: number | string,
): Promise<UserReservationHistory | null> {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) {
    return null;
  }

  try {
    const userResult = await db.query<ReservationHistoryUser>(
      `
        SELECT
          id,
          first_name,
          last_name,
          email
        FROM users
        WHERE id = $1
      `,
      [normalizedUserId],
    );

    if ((userResult.rowCount ?? 0) === 0) {
      return null;
    }

    const reservationsResult = await db.query<UserReservation>(
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
      [normalizedUserId],
    );

    return {
      user: userResult.rows[0],
      reservations: reservationsResult.rows,
    };
  } catch (error) {
    console.error(
      `Error al consultar las reservas del usuario ${normalizedUserId}:`,
      error,
    );

    throw new Error(
      "No fue posible consultar el historial de reservas del usuario.",
    );
  }
}
