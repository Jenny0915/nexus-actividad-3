import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import AuthMenu from "@/components/AuthMenu";
import LanguageSelector from "@/components/LanguageSelector";
import { getLocale } from "@/lib/i18n/get-locale";

import {
  getCoworkingSpaces,
  getCoworkingSpaceTypes,
  type CoworkingSpace,
  type CoworkingSpaceFilters,
} from "@/lib/data/coworking";

import styles from "./coworking.module.css";

export const metadata: Metadata = {
  title: "Espacios de co-working | Nexus",
  description:
    "Consulta y reserva espacios de co-working disponibles para la comunidad universitaria Nexus.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CoworkingPageProps {
  searchParams: Promise<{
    available?: string;
    spaceType?: string;
    minCapacity?: string;
  }>;
}

function parseAvailability(value?: string): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
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

function getAvailableCount(spaces: CoworkingSpace[]): number {
  return spaces.filter((space) => space.is_available).length;
}

function getTotalCapacity(spaces: CoworkingSpace[]): number {
  return spaces.reduce(
    (total, space) => total + Number(space.capacity),
    0,
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

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l8-3 8 3v16" />
      <path d="M9 21v-4h6v4M8 7h1M8 11h1M15 7h1M15 11h1" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
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

function SpaceCard({ space }: { space: CoworkingSpace }) {
  return (
    <article className={styles.spaceCard}>
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

        <div className={styles.spaceVisualCenter}>
          <span className={styles.spaceInitials}>
            {getSpaceInitials(space.name)}
          </span>

          <small>{formatSpaceType(space.space_type)}</small>
        </div>

        <span className={styles.spaceVisualBrand}>Nexus Co-working</span>
      </div>

      <div className={styles.spaceCardContent}>
        <span className={styles.spaceType}>
          {formatSpaceType(space.space_type)}
        </span>

        <h3>{space.name}</h3>

        <p>
          {space.description ||
            "Espacio universitario acondicionado para actividades académicas y colaborativas."}
        </p>

        <div className={styles.spaceDetails}>
          <span>
            <LocationIcon />
            {space.location}
          </span>

          <span>
            <UsersIcon />
            Hasta {space.capacity} personas
          </span>

          <span>
            <ClockIcon />
            {formatPrice(space.hourly_rate)} por hora
          </span>
        </div>

        {!space.is_available && space.current_reservation && (
          <div className={styles.occupiedInformation}>
            <span>Reserva activa</span>

            <strong>
              Hasta{" "}
              {new Intl.DateTimeFormat("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(space.current_reservation.end_time))}
            </strong>
          </div>
        )}

        <div className={styles.spaceCardFooter}>
          <div>
            <span>Tarifa por hora</span>
            <strong>{formatPrice(space.hourly_rate)}</strong>
          </div>

          <Link href={`/coworking/spaces/${space.id}`}>
            Ver espacio
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function CoworkingPage({
  searchParams,
}: CoworkingPageProps) {
  const [params, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);

  const selectedAvailability = params.available ?? "";
  const selectedSpaceType = params.spaceType ?? "";
  const selectedMinCapacity = params.minCapacity ?? "";

  const filters: CoworkingSpaceFilters = {
    available: parseAvailability(selectedAvailability),
    spaceType: selectedSpaceType || undefined,
    minCapacity: parseOptionalNumber(selectedMinCapacity),
  };

  const hasActiveFilters = Boolean(
    selectedAvailability ||
      selectedSpaceType ||
      selectedMinCapacity,
  );

  let allSpaces: CoworkingSpace[] = [];
  let filteredSpaces: CoworkingSpace[] = [];
  let spaceTypes: string[] = [];
  let loadingError = false;

  try {
    [allSpaces, filteredSpaces, spaceTypes] = await Promise.all([
      getCoworkingSpaces(),
      getCoworkingSpaces(filters),
      getCoworkingSpaceTypes(),
    ]);
  } catch (error) {
    console.error("Error al cargar el módulo de co-working:", error);
    loadingError = true;
  }

  const availableSpaces = getAvailableCount(allSpaces);
  const occupiedSpaces = allSpaces.length - availableSpaces;
  const totalCapacity = getTotalCapacity(allSpaces);

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

            <LanguageSelector locale={locale} />

            <AuthMenu
              loginClassName={styles.loginButton}
              containerClassName={styles.authMenu}
              userClassName={styles.authUser}
              logoutClassName={styles.logoutButton}
            />
          </nav>
        </div>
      </header>

      <section className={styles.introduction}>
        <div className={styles.introductionContent}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <strong>Espacios de co-working</strong>
          </nav>

          <div className={styles.introductionGrid}>
            <div>
              <span className={styles.eyebrow}>
                Espacios para aprender y colaborar
              </span>

              <h1>Co-working universitario</h1>

              <p>
                Consulta espacios disponibles, revisa su capacidad y ubicación,
                y organiza tus actividades académicas desde Nexus.
              </p>
            </div>

            <Link
              href="/coworking/reservations"
              className={styles.reservationsButton}
            >
              Mis reservas
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <form
            className={styles.filtersPanel}
            method="GET"
            action="/coworking"
          >
            <label className={styles.filterField}>
              <span>Disponibilidad</span>

              <select
                name="available"
                defaultValue={selectedAvailability}
              >
                <option value="">Todos los espacios</option>
                <option value="true">Disponibles ahora</option>
                <option value="false">Ocupados ahora</option>
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Tipo de espacio</span>

              <select
                name="spaceType"
                defaultValue={selectedSpaceType}
              >
                <option value="">Todos los tipos</option>

                {spaceTypes.map((spaceType) => (
                  <option key={spaceType} value={spaceType}>
                    {formatSpaceType(spaceType)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Capacidad mínima</span>

              <input
                type="number"
                name="minCapacity"
                min="1"
                placeholder="Ejemplo: 6"
                defaultValue={selectedMinCapacity}
              />
            </label>

            <button type="submit" className={styles.filterButton}>
              <FilterIcon />
              Filtrar espacios
            </button>

            {hasActiveFilters && (
              <Link href="/coworking" className={styles.clearFiltersButton}>
                Limpiar filtros
              </Link>
            )}
          </form>
        </div>
      </section>

      {loadingError ? (
        <section className={styles.errorSection}>
          <span>No fue posible cargar los datos</span>

          <h2>Los espacios no están disponibles en este momento</h2>

          <p>
            Revisa la conexión con Neon y la configuración de la base de datos.
          </p>

          <Link href="/">Regresar al inicio</Link>
        </section>
      ) : (
        <>
          <section className={styles.summarySection}>
            <div className={styles.summaryGrid}>
              <article>
                <span className={styles.summaryIcon}>
                  <BuildingIcon />
                </span>

                <div>
                  <strong>{allSpaces.length}</strong>
                  <span>Espacios registrados</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <CalendarIcon />
                </span>

                <div>
                  <strong>{availableSpaces}</strong>
                  <span>Disponibles ahora</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <ClockIcon />
                </span>

                <div>
                  <strong>{occupiedSpaces}</strong>
                  <span>Ocupados actualmente</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <UsersIcon />
                </span>

                <div>
                  <strong>{totalCapacity}</strong>
                  <span>Capacidad total</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.spacesSection}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>
                    {hasActiveFilters
                      ? "Resultados filtrados"
                      : "Espacios Nexus"}
                  </span>

                  <h2>
                    {hasActiveFilters
                      ? "Espacios encontrados"
                      : "Encuentra el espacio ideal"}
                  </h2>

                  <p>
                    Revisa las características de cada espacio antes de realizar
                    una reserva.
                  </p>
                </div>

                <div className={styles.resultsCount}>
                  <strong>{filteredSpaces.length}</strong>

                  <span>
                    {filteredSpaces.length === 1
                      ? "resultado"
                      : "resultados"}
                  </span>
                </div>
              </div>

              {filteredSpaces.length > 0 ? (
                <div className={styles.spacesGrid}>
                  {filteredSpaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyStateIcon}>
                    <BuildingIcon />
                  </span>

                  <span>Sin resultados</span>

                  <h3>No encontramos espacios con esos criterios</h3>

                  <p>
                    Modifica los filtros o consulta nuevamente todos los
                    espacios disponibles.
                  </p>

                  <Link href="/coworking">Limpiar filtros</Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className={styles.processSection}>
        <div className={styles.processContent}>
          <div className={styles.processHeading}>
            <span>Reserva en pocos pasos</span>

            <h2>Organiza tu próxima actividad académica</h2>

            <p>
              Consulta el espacio, selecciona el horario y confirma la reserva
              para el usuario correspondiente.
            </p>
          </div>

          <div className={styles.processGrid}>
            <article>
              <span>01</span>
              <BuildingIcon />
              <h3>Selecciona el espacio</h3>
              <p>
                Revisa ubicación, capacidad, tipo de espacio y tarifa por hora.
              </p>
            </article>

            <article>
              <span>02</span>
              <CalendarIcon />
              <h3>Define el horario</h3>
              <p>
                Selecciona la fecha, hora de inicio y hora de finalización.
              </p>
            </article>

            <article>
              <span>03</span>
              <UsersIcon />
              <h3>Confirma asistentes</h3>
              <p>
                Indica el número de participantes sin superar la capacidad.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span>Historial de reservas</span>

          <h2>Consulta tus espacios reservados</h2>

          <p>
            Revisa reservas pendientes, confirmadas y canceladas desde un solo
            lugar.
          </p>
        </div>

        <Link href="/coworking/reservations">
          Consultar mis reservas
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
            <span>Despliegue en Vercel</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 Nexus. Actividad 3 - Desarrollo Web con Frameworks Front-End.
          </span>

          <span>Por: Jenny Andrea Laverde Rodríguez</span>
        </div>
      </footer>
    </main>
  );
}