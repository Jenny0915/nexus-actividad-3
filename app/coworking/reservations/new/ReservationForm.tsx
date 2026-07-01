"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import styles from "./reservation.module.css";

interface ReservationSpace {
  id: number;
  name: string;
  code: string;
  capacity: number;
  hourlyRate: number;
}

interface ReservationUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface ReservationFormProps {
  space: ReservationSpace;
  user: ReservationUser;
}

interface ReservationResponse {
  success: boolean;
  message: string;
  conflict?: {
    id: number;
    start_time: string;
    end_time: string;
  };
  data?: {
    id: number;
    user_id: number;
    space_id: number;
    start_time: string;
    end_time: string;
    attendees: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    space: {
      id: number;
      name: string;
      code: string;
      capacity: number;
    };
  };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseLocalDateTime(localValue: string): Date | null {
  if (!localValue) {
    return null;
  }

  const match = localValue.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toIsoString(localValue: string): string | null {
  const date = parseLocalDateTime(localValue);

  return date ? date.toISOString() : null;
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getMinimumDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);

  return formatLocalDateTimeInput(now);
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 15a5 5 0 0 1 6 5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function ReservationForm({
  space,
  user,
}: ReservationFormProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [notes, setNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");
  const [reservation, setReservation] =
    useState<ReservationResponse["data"] | null>(null);

  const minimumDateTime = useMemo(
    () => getMinimumDateTime(),
    [],
  );

  const durationHours = useMemo(() => {
    if (!startTime || !endTime) {
      return 0;
    }

    const startDate = parseLocalDateTime(startTime);
    const endDate = parseLocalDateTime(endTime);

    if (!startDate || !endDate || endDate <= startDate) {
      return 0;
    }

    return (endDate.getTime() - startDate.getTime()) / 3_600_000;
  }, [startTime, endTime]);

  const estimatedTotal = useMemo(
    () => durationHours * space.hourlyRate,
    [durationHours, space.hourlyRate],
  );

  function handleAttendeesChange(value: number) {
    if (!Number.isFinite(value)) {
      return;
    }

    const normalizedValue = Math.min(
      Math.max(Math.trunc(value), 1),
      space.capacity,
    );

    setAttendees(normalizedValue);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setConflictMessage("");

    const startIso = toIsoString(startTime);
    const endIso = toIsoString(endTime);

    if (!startIso || !endIso) {
      setErrorMessage("Selecciona un horario de inicio y finalización válido.");
      return;
    }

    const startDate = new Date(startIso);
    const endDate = new Date(endIso);

    if (startDate <= new Date()) {
      setErrorMessage("La reserva debe realizarse para una fecha futura.");
      return;
    }

    if (endDate <= startDate) {
      setErrorMessage(
        "La hora de finalización debe ser posterior a la hora de inicio.",
      );
      return;
    }

    if (
      !Number.isInteger(attendees) ||
      attendees <= 0 ||
      attendees > space.capacity
    ) {
      setErrorMessage(
        `El número de asistentes debe estar entre 1 y ${space.capacity}.`,
      );
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(
        "Debes confirmar que la información de la reserva es correcta.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/coworking/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            spaceId: Number(space.id),
            startTime: startIso,
            endTime: endIso,
            attendees,
            notes: notes.trim() || undefined,
          }),
        },
      );

      const result =
        (await response.json()) as ReservationResponse;

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message ||
            "No fue posible registrar la reserva.",
        );

        if (result.conflict) {
          setConflictMessage(
            `Existe una reserva desde ${formatDateTime(
              result.conflict.start_time,
            )} hasta ${formatDateTime(
              result.conflict.end_time,
            )}.`,
          );
        }

        return;
      }

      setReservation(result.data ?? null);
    } catch (error) {
      console.error("Error al enviar la reserva:", error);

      setErrorMessage(
        "No fue posible conectar con el servicio de reservas.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (reservation) {
    return (
      <section className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckIcon />
        </div>

        <span>Reserva confirmada</span>

        <h2>El espacio fue reservado correctamente</h2>

        <p>
          La reserva fue registrada en la base de datos y el horario quedó
          bloqueado para evitar cruces con otras solicitudes.
        </p>

        <div className={styles.reservationReference}>
          <div>
            <span>Número de reserva</span>
            <strong>#{reservation.id}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>
              {reservation.status === "confirmed"
                ? "Confirmada"
                : reservation.status}
            </strong>
          </div>

          <div>
            <span>Asistentes</span>
            <strong>{reservation.attendees}</strong>
          </div>
        </div>

        <div className={styles.confirmedSchedule}>
          <div>
            <CalendarIcon />

            <span>
              <small>Inicio</small>
              <strong>
                {formatDateTime(reservation.start_time)}
              </strong>
            </span>
          </div>

          <div>
            <ClockIcon />

            <span>
              <small>Finalización</small>
              <strong>
                {formatDateTime(reservation.end_time)}
              </strong>
            </span>
          </div>
        </div>

        <div className={styles.successActions}>
          <Link href="/coworking/reservations">
            Consultar mis reservas
          </Link>

          <Link href={`/coworking/spaces/${space.id}`}>
            Regresar al espacio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      className={styles.reservationForm}
      onSubmit={handleSubmit}
    >
      <div className={styles.formHeader}>
        <span>Datos de la operación</span>

        <h2>Información de la reserva</h2>

        <p>
          La reserva se asociará automáticamente a la cuenta con la que
          iniciaste sesión.
        </p>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage} role="alert">
          <strong>No fue posible continuar</strong>
          <span>{errorMessage}</span>

          {conflictMessage && <small>{conflictMessage}</small>}
        </div>
      )}

      <section className={styles.authenticatedBuyer}>
        <span className={styles.authenticatedBuyerIcon}>
          <UserIcon />
        </span>

        <div>
          <small>Usuario responsable</small>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
        </div>
      </section>

      <div className={styles.dateGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="reservation-start">
            Inicio de la reserva
            <span>*</span>
          </label>

          <input
            id="reservation-start"
            type="datetime-local"
            min={minimumDateTime}
            value={startTime}
            onChange={(event) => {
              setStartTime(event.target.value);

              const selectedStart = parseLocalDateTime(
                event.target.value,
              );
              const selectedEnd = parseLocalDateTime(endTime);

              if (
                selectedStart &&
                selectedEnd &&
                selectedEnd <= selectedStart
              ) {
                setEndTime("");
              }
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reservation-end">
            Finalización
            <span>*</span>
          </label>

          <input
            id="reservation-end"
            type="datetime-local"
            min={startTime || minimumDateTime}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            disabled={isSubmitting || !startTime}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reservation-attendees">
          Número de asistentes
          <span>*</span>
        </label>

        <div className={styles.attendeesControl}>
          <button
            type="button"
            onClick={() =>
              handleAttendeesChange(attendees - 1)
            }
            disabled={attendees <= 1 || isSubmitting}
            aria-label="Disminuir asistentes"
          >
            −
          </button>

          <input
            id="reservation-attendees"
            type="number"
            min="1"
            max={space.capacity}
            value={attendees}
            onChange={(event) =>
              handleAttendeesChange(Number(event.target.value))
            }
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() =>
              handleAttendeesChange(attendees + 1)
            }
            disabled={
              attendees >= space.capacity || isSubmitting
            }
            aria-label="Aumentar asistentes"
          >
            +
          </button>
        </div>

        <small>
          Capacidad máxima del espacio: {space.capacity}{" "}
          {space.capacity === 1 ? "persona" : "personas"}.
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reservation-notes">
          Notas adicionales
          <span className={styles.optionalLabel}>Opcional</span>
        </label>

        <textarea
          id="reservation-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ejemplo: reunión de proyecto, tutoría o actividad académica."
          maxLength={500}
          disabled={isSubmitting}
        />

        <small>{notes.length}/500 caracteres</small>
      </div>

      <div className={styles.orderSummary}>
        <h3>Resumen de la reserva</h3>

        <dl>
          <div>
            <dt>Espacio</dt>
            <dd>{space.name}</dd>
          </div>

          <div>
            <dt>Tarifa por hora</dt>
            <dd>{formatPrice(space.hourlyRate)}</dd>
          </div>

          <div>
            <dt>Duración estimada</dt>
            <dd>
              {durationHours > 0
                ? `${durationHours.toLocaleString("es-CO", {
                    maximumFractionDigits: 2,
                  })} hora(s)`
                : "Pendiente"}
            </dd>
          </div>

          <div>
            <dt>Asistentes</dt>
            <dd>{attendees}</dd>
          </div>
        </dl>

        <div className={styles.totalRow}>
          <span>Costo estimado</span>

          <strong>
            {durationHours > 0
              ? formatPrice(estimatedTotal)
              : "$0"}
          </strong>
        </div>

        <p>
          El costo se calcula multiplicando la tarifa por la duración
          seleccionada.
        </p>
      </div>

      <label className={styles.confirmationField}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(event) =>
            setAcceptTerms(event.target.checked)
          }
          disabled={isSubmitting}
        />

        <span>
          Confirmo que el horario y el número de asistentes son correctos.
        </span>
      </label>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={
          isSubmitting ||
          durationHours <= 0 ||
          !acceptTerms
        }
      >
        <CalendarIcon />

        {isSubmitting
          ? "Validando disponibilidad..."
          : "Confirmar reserva"}
      </button>

    </form>
  );
}
