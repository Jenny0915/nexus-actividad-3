import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";
import {
  getUserReservationHistory,
  type UserReservation,
} from "@/lib/data/reservations";

import styles from "./reservation.module.css";

export const metadata: Metadata = {
  title: "Historial de reservas | Nexus",
  description:
    "Consulta las reservas realizadas en los espacios de co-working de Nexus.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatPrice(value: string | number): string {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value);

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  group: "Grupal",
  meeting_room: "Sala de reuniones",
  silent_booth: "Cabina silenciosa",
};

function formatSpaceType(value: string): string {
  const normalizedValue = value.trim().toLowerCase();

  return (
    SPACE_TYPE_LABELS[normalizedValue] ??
    normalizedValue
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getDurationHours(reservation: UserReservation): number {
  const startDate = new Date(reservation.start_time);
  const endDate = new Date(reservation.end_time);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return 0;
  }

  return (endDate.getTime() - startDate.getTime()) / 3_600_000;
}

function getEstimatedCost(reservation: UserReservation): number {
  return (
    getDurationHours(reservation) *
    Number(reservation.space.hourly_rate)
  );
}

function getTemporalStatusLabel(status: string): string {
  if (status === "upcoming") {
    return "Próxima";
  }

  if (status === "active") {
    return "En curso";
  }

  if (status === "finished") {
    return "Finalizada";
  }

  if (status === "cancelled") {
    return "Cancelada";
  }

  return status;
}

function getTemporalStatusClass(status: string): string {
  if (status === "upcoming") {
    return styles.statusUpcoming;
  }

  if (status === "active") {
    return styles.statusActive;
  }

  if (status === "finished") {
    return styles.statusFinished;
  }

  return styles.statusCancelled;
}

function countReservationsByStatus(
  reservations: UserReservation[],
  temporalStatus: string,
): number {
  return reservations.filter(
    (reservation) =>
      reservation.temporal_status === temporalStatus,
  ).length;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
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

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l8-3 8 3v16" />
      <path d="M9 21v-4h6v4M8 7h1M8 11h1M15 7h1M15 11h1" />
    </svg>
  );
}

function ReservationCard({
  reservation,
}: {
  reservation: UserReservation;
}) {
  const durationHours = getDurationHours(reservation);
  const estimatedCost = getEstimatedCost(reservation);

  return (
    <article className={styles.reservationCard}>
      <header className={styles.reservationHeader}>
        <div className={styles.reservationReference}>
          <span>Reserva</span>
          <strong>#{reservation.id}</strong>
        </div>

        <div className={styles.reservationDate}>
          <CalendarIcon />

          <div>
            <span>Fecha</span>
            <strong>{formatDate(reservation.start_time)}</strong>
          </div>
        </div>

        <span
          className={`${styles.statusBadge} ${getTemporalStatusClass(
            reservation.temporal_status,
          )}`}
        >
          {getTemporalStatusLabel(reservation.temporal_status)}
        </span>

        <div className={styles.estimatedCost}>
          <span>Costo estimado</span>
          <strong>{formatPrice(estimatedCost)}</strong>
        </div>
      </header>

      <div className={styles.reservationBody}>
        <div className={styles.spaceVisual}>
          <span>{reservation.space.code}</span>

          <strong>
            {reservation.space.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join("")
              .toUpperCase()}
          </strong>

          <small>
            {formatSpaceType(reservation.space.space_type)}
          </small>
        </div>

        <div className={styles.reservationInformation}>
          <span className={styles.spaceType}>
            {formatSpaceType(reservation.space.space_type)}
          </span>

          <h3>{reservation.space.name}</h3>

          <div className={styles.reservationDetails}>
            <span>
              <LocationIcon />
              {reservation.space.location}
            </span>

            <span>
              <ClockIcon />
              {formatTime(reservation.start_time)} a{" "}
              {formatTime(reservation.end_time)}
            </span>

            <span>
              <UsersIcon />
              {reservation.attendees}{" "}
              {reservation.attendees === 1
                ? "asistente"
                : "asistentes"}
            </span>

            <span>
              <CalendarIcon />
              {durationHours.toLocaleString("es-CO", {
                maximumFractionDigits: 2,
              })}{" "}
              hora(s)
            </span>
          </div>

          {reservation.notes && (
            <div className={styles.notes}>
              <span>Notas</span>
              <p>{reservation.notes}</p>
            </div>
          )}
        </div>

        <div className={styles.reservationActions}>
          <div>
            <span>Estado de la reserva</span>
            <strong>
              {reservation.status === "confirmed"
                ? "Confirmada"
                : reservation.status === "pending"
                  ? "Pendiente"
                  : reservation.status === "cancelled"
                    ? "Cancelada"
                    : reservation.status}
            </strong>
          </div>

          <Link href={`/coworking/spaces/${reservation.space.id}`}>
            Ver espacio
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ReservationsPage() {
  const authenticatedUser = await getAuthenticatedDatabaseUser();

  const history = authenticatedUser
    ? await getUserReservationHistory(authenticatedUser.id)
    : null;

  const reservations = history?.reservations ?? [];

  const upcomingCount = countReservationsByStatus(
    reservations,
    "upcoming",
  );

  const activeCount = countReservationsByStatus(
    reservations,
    "active",
  );

  const finishedCount = countReservationsByStatus(
    reservations,
    "finished",
  );

  const loginHref = `/auth/login?returnTo=${encodeURIComponent(
    "/coworking/reservations",
  )}`;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Regresar al inicio de Nexus"
          >
            <Image
              src="/nexus2.png"
              alt="Isotipo Nexus"
              width={72}
              height={72}
              priority
            />

            <span>
              <strong>Nexus</strong>
              <small>Comunidad universitaria</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/library">Librería</Link>

            <Link href="/coworking" className={styles.activeLink}>
              Co-working
            </Link>

            <button type="button" className={styles.languageButton}>
              ES
              <span aria-hidden="true">⌄</span>
            </button>

            {authenticatedUser ? (
              <div className={styles.authenticatedUser}>
                <span className={styles.headerUserAvatar}>
                  {getUserInitials(
                    authenticatedUser.first_name,
                    authenticatedUser.last_name,
                  )}
                </span>

                <span className={styles.userIdentity}>
                  <small>Sesión iniciada</small>
                  <strong>
                    {authenticatedUser.first_name}{" "}
                    {authenticatedUser.last_name}
                  </strong>
                </span>

                <Link href="/auth/logout" className={styles.logoutButton}>
                  Cerrar sesión
                </Link>
              </div>
            ) : (
              <Link href={loginHref} className={styles.loginButton}>
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className={styles.introduction}>
        <div className={styles.introductionContent}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>

            <Link href="/coworking">Co-working</Link>
            <span aria-hidden="true">/</span>

            <strong>Historial de reservas</strong>
          </nav>

          <div className={styles.introductionGrid}>
            <div>
              <span className={styles.eyebrow}>
                Actividad de co-working
              </span>

              <h1>Historial de reservas</h1>

              <p>
                Consulta los espacios reservados, sus horarios, asistentes y
                estado actual.
              </p>
            </div>

            <Link href="/coworking" className={styles.spacesButton}>
              Explorar espacios
              <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>
      </section>

      {!authenticatedUser ? (
        <section className={styles.loginRequiredSection}>
          <div className={styles.loginRequiredIcon}>
            <CalendarIcon />
          </div>

          <span>Autenticación requerida</span>

          <h2>Inicia sesión para consultar tus reservas</h2>

          <p>
            Tu historial es privado y se muestra únicamente a la cuenta
            autenticada en Nexus.
          </p>

          <Link href={loginHref} className={styles.loginRequiredButton}>
            Iniciar sesión y continuar
          </Link>

          <Link href="/coworking" className={styles.loginRequiredBackLink}>
            Explorar espacios disponibles
          </Link>
        </section>
      ) : (
        <>
          <section className={styles.userSummarySection}>
            <div className={styles.userCard}>
              <span className={styles.userAvatar}>
                {getUserInitials(
                  authenticatedUser.first_name,
                  authenticatedUser.last_name,
                )}
              </span>

              <div>
                <span>Historial de reservas de</span>

                <h2>
                  {authenticatedUser.first_name}{" "}
                  {authenticatedUser.last_name}
                </h2>

                <p>{authenticatedUser.email}</p>
              </div>
            </div>

            <div className={styles.summaryCards}>
              <article>
                <span className={styles.summaryIcon}>
                  <CalendarIcon />
                </span>

                <div>
                  <strong>{reservations.length}</strong>
                  <span>Total de reservas</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <ClockIcon />
                </span>

                <div>
                  <strong>{upcomingCount}</strong>
                  <span>Próximas</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <BuildingIcon />
                </span>

                <div>
                  <strong>{activeCount}</strong>
                  <span>En curso</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <UsersIcon />
                </span>

                <div>
                  <strong>{finishedCount}</strong>
                  <span>Finalizadas</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.historySection}>
            <div className={styles.historyContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Registro de operaciones</span>

                  <h2>Reservas realizadas</h2>

                  <p>
                    Las reservas se presentan desde la fecha más reciente hasta
                    la más antigua.
                  </p>
                </div>

                <strong>
                  {reservations.length}{" "}
                  {reservations.length === 1
                    ? "reserva"
                    : "reservas"}
                </strong>
              </div>

              {reservations.length > 0 ? (
                <div className={styles.reservationList}>
                  {reservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <CalendarIcon />
                  </span>

                  <span>Sin reservas registradas</span>

                  <h3>Todavía no has reservado ningún espacio</h3>

                  <p>
                    Consulta los espacios disponibles y selecciona un horario
                    futuro.
                  </p>

                  <Link href="/coworking">
                    Explorar espacios
                  </Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className={styles.cta}>
        <div>
          <span>Co-working Nexus</span>

          <h2>Reserva un espacio para tu próxima actividad</h2>

          <p>
            Consulta disponibilidad, capacidad, ubicación y tarifa por hora.
          </p>
        </div>

        <Link href="/coworking">
          Ver espacios
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Image
              src="/nexus.png"
              alt="Nexus"
              width={190}
              height={130}
            />

            <p>
              Plataforma universitaria que conecta conocimiento, servicios y
              espacios para toda la comunidad académica.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h3>Navegación</h3>
            <Link href="/">Inicio</Link>
            <Link href="/library">Librería universitaria</Link>
            <Link href="/coworking">Espacios de co-working</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Co-working</h3>
            <Link href="/coworking">Consultar espacios</Link>
            <Link href="/coworking/reservations">Mis reservas</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Tecnología</h3>
            <span>Next.js y TypeScript</span>
            <span>PostgreSQL en Neon</span>
            <span>Server Components</span>
            <span>Validación de horarios</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 Nexus. Proyecto académico de Desarrollo Web con Frameworks
            Front-End.
          </span>

          <span>Universidad Internacional de La Rioja</span>
        </div>
      </footer>
    </main>
  );
}