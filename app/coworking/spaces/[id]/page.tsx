import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCoworkingSpaceById,
  getCoworkingSpaces,
  type CoworkingSpace,
  type UpcomingReservation,
} from "@/lib/data/coworking";

import styles from "./space-detail.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SpaceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function parseSpaceId(value: string): number | null {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

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

function formatSpaceType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function getSpaceInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatusLabel(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "confirmed") {
    return "Confirmada";
  }

  if (normalizedStatus === "pending") {
    return "Pendiente";
  }

  if (normalizedStatus === "cancelled") {
    return "Cancelada";
  }

  return status;
}

function getStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "confirmed") {
    return styles.statusConfirmed;
  }

  if (normalizedStatus === "pending") {
    return styles.statusPending;
  }

  return styles.statusCancelled;
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
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

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l8-3 8 3v16" />
      <path d="M9 21v-4h6v4M8 7h1M8 11h1M15 7h1M15 11h1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
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

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function UpcomingReservationCard({
  reservation,
}: {
  reservation: UpcomingReservation;
}) {
  return (
    <article className={styles.reservationCard}>
      <div className={styles.reservationDate}>
        <CalendarIcon />

        <div>
          <span>Fecha</span>
          <strong>{formatDate(reservation.start_time)}</strong>
        </div>
      </div>

      <div className={styles.reservationTime}>
        <ClockIcon />

        <div>
          <span>Horario</span>
          <strong>
            {formatTime(reservation.start_time)} a{" "}
            {formatTime(reservation.end_time)}
          </strong>
        </div>
      </div>

      <div className={styles.reservationAttendees}>
        <UsersIcon />

        <div>
          <span>Asistentes</span>
          <strong>{reservation.attendees}</strong>
        </div>
      </div>

      <span
        className={`${styles.statusBadge} ${getStatusClass(
          reservation.status,
        )}`}
      >
        {getStatusLabel(reservation.status)}
      </span>
    </article>
  );
}

export async function generateStaticParams() {
  try {
    const spaces = await getCoworkingSpaces();

    return spaces.map((space) => ({
      id: String(space.id),
    }));
  } catch (error) {
    console.error(
      "No fue posible generar las rutas de los espacios:",
      error,
    );

    return [];
  }
}

export async function generateMetadata({
  params,
}: SpaceDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const spaceId = parseSpaceId(resolvedParams.id);

  if (!spaceId) {
    return {
      title: "Espacio no encontrado | Nexus",
    };
  }

  try {
    const space = await getCoworkingSpaceById(spaceId);

    if (!space) {
      return {
        title: "Espacio no encontrado | Nexus",
      };
    }

    return {
      title: `${space.name} | Co-working Nexus`,
      description:
        space.description ??
        `Consulta la información y disponibilidad de ${space.name}.`,
    };
  } catch {
    return {
      title: "Detalle del espacio | Nexus",
    };
  }
}

export default async function SpaceDetailPage({
  params,
}: SpaceDetailPageProps) {
  const resolvedParams = await params;
  const spaceId = parseSpaceId(resolvedParams.id);

  if (!spaceId) {
    notFound();
  }

  let space: CoworkingSpace | null = null;

  try {
    space = await getCoworkingSpaceById(spaceId);
  } catch (error) {
    console.error("Error al cargar el detalle del espacio:", error);
  }

  if (!space) {
    notFound();
  }

  const upcomingReservations = space.upcoming_reservations ?? [];

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

            <button type="button" className={styles.loginButton}>
              Iniciar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className={styles.introduction}>
        <div className={styles.introductionContent}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>

            <Link href="/coworking">Espacios de co-working</Link>
            <span aria-hidden="true">/</span>

            <strong>{space.name}</strong>
          </nav>

          <Link href="/coworking" className={styles.backLink}>
            <ArrowLeftIcon />
            Regresar a los espacios
          </Link>
        </div>
      </section>

      <section className={styles.spaceSection}>
        <div className={styles.spaceLayout}>
          <aside className={styles.visualColumn}>
            <div className={styles.spaceVisual}>
              <span className={styles.spaceCode}>{space.code}</span>

              <span
                className={`${styles.availabilityBadge} ${
                  space.is_available
                    ? styles.availabilityAvailable
                    : styles.availabilityOccupied
                }`}
              >
                {space.is_available ? "Disponible" : "Ocupado"}
              </span>

              <div className={styles.visualCenter}>
                <strong>{getSpaceInitials(space.name)}</strong>
                <span>{formatSpaceType(space.space_type)}</span>
              </div>

              <small>Nexus Co-working</small>
            </div>

            <div
              className={`${styles.currentStatusCard} ${
                space.is_available
                  ? styles.currentStatusAvailable
                  : styles.currentStatusOccupied
              }`}
            >
              <span className={styles.currentStatusIcon}>
                {space.is_available ? <CheckIcon /> : <ClockIcon />}
              </span>

              <div>
                <strong>
                  {space.is_available
                    ? "Disponible actualmente"
                    : "Reserva activa"}
                </strong>

                <span>
                  {space.is_available
                    ? "El espacio no está siendo utilizado en este momento."
                    : `Ocupado hasta las ${formatTime(
                        space.current_reservation?.end_time ?? "",
                      )}.`}
                </span>
              </div>
            </div>
          </aside>

          <article className={styles.spaceInformation}>
            <span className={styles.spaceType}>
              {formatSpaceType(space.space_type)}
            </span>

            <h1>{space.name}</h1>

            <p className={styles.spaceDescription}>
              {space.description ||
                "Espacio universitario acondicionado para actividades académicas, colaborativas y de estudio."}
            </p>

            <div className={styles.priceRow}>
              <strong>{formatPrice(space.hourly_rate)}</strong>
              <span>por hora</span>
            </div>

            <div className={styles.detailGrid}>
              <article>
                <span className={styles.detailIcon}>
                  <LocationIcon />
                </span>

                <div>
                  <span>Ubicación</span>
                  <strong>{space.location}</strong>
                </div>
              </article>

              <article>
                <span className={styles.detailIcon}>
                  <UsersIcon />
                </span>

                <div>
                  <span>Capacidad máxima</span>
                  <strong>{space.capacity} personas</strong>
                </div>
              </article>

              <article>
                <span className={styles.detailIcon}>
                  <BuildingIcon />
                </span>

                <div>
                  <span>Tipo de espacio</span>
                  <strong>{formatSpaceType(space.space_type)}</strong>
                </div>
              </article>

              <article>
                <span className={styles.detailIcon}>
                  <ClockIcon />
                </span>

                <div>
                  <span>Tarifa por hora</span>
                  <strong>{formatPrice(space.hourly_rate)}</strong>
                </div>
              </article>

              <article>
                <span className={styles.detailIcon}>
                  <BuildingIcon />
                </span>

                <div>
                  <span>Código</span>
                  <strong>{space.code}</strong>
                </div>
              </article>

              <article>
                <span className={styles.detailIcon}>
                  <CalendarIcon />
                </span>

                <div>
                  <span>Próximas reservas</span>
                  <strong>{upcomingReservations.length}</strong>
                </div>
              </article>
            </div>

            {space.current_reservation && (
              <div className={styles.activeReservationPanel}>
                <div className={styles.activeReservationHeading}>
                  <span className={styles.activeReservationIcon}>
                    <ClockIcon />
                  </span>

                  <div>
                    <span>Reserva actualmente activa</span>
                    <strong>
                      {formatTime(space.current_reservation.start_time)} a{" "}
                      {formatTime(space.current_reservation.end_time)}
                    </strong>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>Asistentes</dt>
                    <dd>{space.current_reservation.attendees}</dd>
                  </div>

                  <div>
                    <dt>Estado</dt>
                    <dd>
                      {getStatusLabel(space.current_reservation.status)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className={styles.actionPanel}>
              <div>
                <CalendarIcon />

                <span>
                  <strong>Reserva este espacio</strong>

                  <small>
                    Selecciona un horario futuro sin cruces con otras reservas.
                  </small>
                </span>
              </div>

              <Link
                href={`/coworking/reservations/new?spaceId=${space.id}`}
                className={styles.reserveButton}
              >
                Reservar espacio
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.scheduleSection}>
        <div className={styles.scheduleContainer}>
          <div className={styles.sectionHeading}>
            <div>
              <span>Agenda del espacio</span>

              <h2>Próximas reservas</h2>

              <p>
                Consulta los horarios ocupados antes de solicitar una nueva
                reserva.
              </p>
            </div>

            <strong>
              {upcomingReservations.length}{" "}
              {upcomingReservations.length === 1
                ? "reserva"
                : "reservas"}
            </strong>
          </div>

          {upcomingReservations.length > 0 ? (
            <div className={styles.reservationsList}>
              {upcomingReservations.map((reservation) => (
                <UpcomingReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptySchedule}>
              <span className={styles.emptyScheduleIcon}>
                <CalendarIcon />
              </span>

              <span>Agenda disponible</span>

              <h3>No hay próximas reservas registradas</h3>

              <p>
                Puedes seleccionar un horario futuro para utilizar este
                espacio.
              </p>

              <Link
                href={`/coworking/reservations/new?spaceId=${space.id}`}
              >
                Crear una reserva
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.informationSection}>
        <div className={styles.informationGrid}>
          <article>
            <span>01</span>
            <LocationIcon />

            <h2>Ubicación</h2>

            <p>{space.location}</p>
          </article>

          <article>
            <span>02</span>
            <UsersIcon />

            <h2>Capacidad</h2>

            <p>
              El espacio admite hasta {space.capacity} personas por reserva.
            </p>
          </article>

          <article>
            <span>03</span>
            <ClockIcon />

            <h2>Tarifa</h2>

            <p>
              El valor de uso es de {formatPrice(space.hourly_rate)} por cada
              hora reservada.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span>¿Listo para reservar?</span>

          <h2>Organiza tu próxima actividad en Nexus</h2>

          <p>
            Define el horario, número de asistentes y usuario responsable de la
            reserva.
          </p>
        </div>

        <Link href={`/coworking/reservations/new?spaceId=${space.id}`}>
          Reservar este espacio
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
            <span>Validación de horarios</span>
            <span>Despliegue en Vercel</span>
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