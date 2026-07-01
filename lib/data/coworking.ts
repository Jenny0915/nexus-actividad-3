import { db } from "@/lib/db";

export interface ReservationUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CurrentReservation {
  reservation_id: number;
  start_time: Date | string;
  end_time: Date | string;
  attendees: number;
  status: string;
  user: ReservationUser;
}

export interface UpcomingReservation {
  id: number;
  start_time: Date | string;
  end_time: Date | string;
  attendees: number;
  status: string;
  user_id: number;
}

export interface CoworkingSpace {
  id: number;
  name: string;
  code: string;
  description: string | null;
  capacity: number;
  location: string;
  space_type: string;
  hourly_rate: string | number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  is_available: boolean;
  current_reservation: CurrentReservation | null;
  upcoming_reservations?: UpcomingReservation[];
}

export interface CoworkingSpaceFilters {
  available?: boolean;
  spaceType?: string;
  minCapacity?: number;
}

type QueryValue = string | number | boolean;

/**
 * Consulta todos los espacios activos de co-working.
 *
 * La función puede recibir filtros opcionales de disponibilidad,
 * tipo de espacio y capacidad mínima.
 */
export async function getCoworkingSpaces(
  filters: CoworkingSpaceFilters = {},
): Promise<CoworkingSpace[]> {
  const conditions: string[] = ["cs.is_active = TRUE"];
  const values: QueryValue[] = [];

  if (filters.spaceType?.trim()) {
    values.push(filters.spaceType.trim());
    conditions.push(`cs.space_type = $${values.length}`);
  }

  if (
    filters.minCapacity !== undefined &&
    Number.isFinite(filters.minCapacity) &&
    filters.minCapacity > 0
  ) {
    values.push(filters.minCapacity);
    conditions.push(`cs.capacity >= $${values.length}`);
  }

  let availabilityFilter = "";

  if (filters.available === true) {
    availabilityFilter = "AND active_reservation.id IS NULL";
  }

  if (filters.available === false) {
    availabilityFilter = "AND active_reservation.id IS NOT NULL";
  }

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

  try {
    const result = await db.query<CoworkingSpace>(query, values);

    return result.rows;
  } catch (error) {
    console.error(
      "Error al consultar los espacios de co-working:",
      error,
    );

    throw new Error(
      "No fue posible consultar los espacios de co-working.",
    );
  }
}

/**
 * Consulta la información completa de un espacio activo.
 *
 * Incluye la reserva actualmente activa y todas las reservas
 * futuras pendientes o confirmadas.
 */
export async function getCoworkingSpaceById(
  id: number,
): Promise<CoworkingSpace | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

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
        '[]'::json
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
  `;

  try {
    const result = await db.query<CoworkingSpace>(query, [id]);

    return result.rows[0] ?? null;
  } catch (error) {
    console.error(
      `Error al consultar el espacio de co-working ${id}:`,
      error,
    );

    throw new Error(
      "No fue posible consultar el espacio de co-working.",
    );
  }
}

/**
 * Obtiene los tipos de espacio activos disponibles en la base de datos.
 *
 * Servirá para construir dinámicamente el filtro de la página.
 */
export async function getCoworkingSpaceTypes(): Promise<string[]> {
  const query = `
    SELECT DISTINCT space_type
    FROM coworking_spaces
    WHERE is_active = TRUE
      AND space_type IS NOT NULL
      AND TRIM(space_type) <> ''
    ORDER BY space_type ASC
  `;

  try {
    const result = await db.query<{ space_type: string }>(query);

    return result.rows.map((row) => row.space_type);
  } catch (error) {
    console.error(
      "Error al consultar los tipos de espacios:",
      error,
    );

    throw new Error(
      "No fue posible consultar los tipos de espacios.",
    );
  }
}