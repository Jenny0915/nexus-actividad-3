import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";
import { getCoworkingSpaceById } from "@/lib/data/coworking";

import ReservationForm from "./ReservationForm";
import styles from "./reservation.module.css";

export const metadata: Metadata = {
  title: "Reservar espacio | Nexus",
  description:
    "Crea una reserva para uno de los espacios de co-working de Nexus.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NewReservationPageProps {
  searchParams: Promise<{
    spaceId?: string;
  }>;
}

function parseSpaceId(value?: string): number | null {
  if (!value) {
    return null;
  }

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

function getSpaceInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function NewReservationPage({
  searchParams,
}: NewReservationPageProps) {
  const params = await searchParams;
  const spaceId = parseSpaceId(params.spaceId);

  if (!spaceId) {
    notFound();
  }

  const [space, authenticatedUser] = await Promise.all([
    getCoworkingSpaceById(spaceId),
    getAuthenticatedDatabaseUser(),
  ]);

  if (!space) {
    notFound();
  }

  const numericHourlyRate = Number(space.hourly_rate);
  const reservationPath = `/coworking/reservations/new?spaceId=${space.id}`;
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(
    reservationPath,
  )}`;
  const reservationsHref = authenticatedUser
    ? `/coworking/reservations?userId=${authenticatedUser.id}`
    : `/auth/login?returnTo=${encodeURIComponent(
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
                <span className={styles.userAvatar}>
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

            <Link href={`/coworking/spaces/${space.id}`}>
              {space.name}
            </Link>
            <span aria-hidden="true">/</span>

            <strong>Reservar</strong>
          </nav>

          <Link
            href={`/coworking/spaces/${space.id}`}
            className={styles.backLink}
          >
            <ArrowLeftIcon />
            Regresar al espacio
          </Link>
        </div>
      </section>

      <section className={styles.reservationSection}>
        <div className={styles.reservationHeading}>
          <span>Proceso de reserva</span>

          <h1>Confirma los datos de tu reserva</h1>

          <p>
            Selecciona el horario y el número de asistentes. La reserva quedará
            asociada automáticamente a tu cuenta y Nexus comprobará que no
            existan cruces con otras reservas.
          </p>
        </div>

        <div className={styles.reservationLayout}>
          <aside className={styles.spaceSummary}>
            <span className={styles.summaryLabel}>
              Espacio seleccionado
            </span>

            <div className={styles.spaceVisual}>
              <span>{space.code}</span>

              <div>
                <strong>{getSpaceInitials(space.name)}</strong>
                <small>{formatSpaceType(space.space_type)}</small>
              </div>

              <em>Nexus Co-working</em>
            </div>

            <div className={styles.spaceInformation}>
              <span className={styles.spaceType}>
                {formatSpaceType(space.space_type)}
              </span>

              <h2>{space.name}</h2>

              <p>
                {space.description ||
                  "Espacio acondicionado para actividades académicas y colaborativas."}
              </p>

              <dl>
                <div>
                  <dt>
                    <LocationIcon />
                    Ubicación
                  </dt>

                  <dd>{space.location}</dd>
                </div>

                <div>
                  <dt>
                    <UsersIcon />
                    Capacidad
                  </dt>

                  <dd>{space.capacity} personas</dd>
                </div>

                <div>
                  <dt>
                    <ClockIcon />
                    Tarifa
                  </dt>

                  <dd>{formatPrice(space.hourly_rate)} por hora</dd>
                </div>
              </dl>
            </div>
          </aside>

          {authenticatedUser ? (
            <ReservationForm
              space={{
                id: Number(space.id),
                name: space.name,
                code: space.code,
                capacity: Number(space.capacity),
                hourlyRate: numericHourlyRate,
              }}
              user={{
                id: authenticatedUser.id,
                firstName: authenticatedUser.first_name,
                lastName: authenticatedUser.last_name,
                email: authenticatedUser.email,
              }}
            />
          ) : (
            <section className={styles.loginRequiredCard}>
              <div className={styles.loginRequiredIcon}>
                <LockIcon />
              </div>

              <span>Autenticación requerida</span>

              <h2>Inicia sesión para reservar este espacio</h2>

              <p>
                Debes ingresar a tu cuenta de Nexus para registrar la reserva,
                asociarla a tu historial y bloquear el horario seleccionado.
              </p>

              <Link href={loginHref} className={styles.loginRequiredButton}>
                Iniciar sesión y continuar
              </Link>

              <Link
                href={`/coworking/spaces/${space.id}`}
                className={styles.loginRequiredBackLink}
              >
                Regresar al detalle del espacio
              </Link>
            </section>
          )}
        </div>
      </section>

      <section className={styles.helpSection}>
        <div className={styles.helpGrid}>
          <article>
            <span>01</span>
            <ClockIcon />

            <h2>Selecciona un horario futuro</h2>

            <p>
              La hora de finalización debe ser posterior a la hora de inicio.
            </p>
          </article>

          <article>
            <span>02</span>
            <UsersIcon />

            <h2>Respeta la capacidad</h2>

            <p>
              Este espacio permite un máximo de {space.capacity} personas.
            </p>
          </article>

          <article>
            <span>03</span>
            <LocationIcon />

            <h2>Evita cruces de agenda</h2>

            <p>
              El sistema comprobará que el espacio se encuentre libre en el
              horario solicitado.
            </p>
          </article>
        </div>
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
            <Link href={reservationsHref}>Mis reservas</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Tecnología</h3>
            <span>Next.js y TypeScript</span>
            <span>PostgreSQL en Neon</span>
            <span>Validación de horarios</span>
            <span>Transacciones SQL</span>
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