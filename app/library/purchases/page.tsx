import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getUserPurchaseHistory,
  type PurchaseItem,
  type UserPurchase,
} from "@/lib/data/purchases";

import { getUsers } from "@/lib/data/users";

import styles from "./purchases.module.css";

export const metadata: Metadata = {
  title: "Historial de compras | Nexus",
  description:
    "Consulta el historial de compras realizadas en la librería universitaria Nexus.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PurchasesPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

function parseUserId(value?: string): number | null {
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

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completada";
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

  if (normalizedStatus === "completed") {
    return styles.statusCompleted;
  }

  if (normalizedStatus === "pending") {
    return styles.statusPending;
  }

  return styles.statusCancelled;
}

function getTotalItems(purchases: UserPurchase[]): number {
  return purchases.reduce(
    (total, purchase) =>
      total +
      purchase.items.reduce(
        (purchaseTotal, item) => purchaseTotal + Number(item.quantity),
        0,
      ),
    0,
  );
}

function getTotalSpent(purchases: UserPurchase[]): number {
  return purchases.reduce(
    (total, purchase) => total + Number(purchase.total_amount),
    0,
  );
}

function ShoppingBagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function PurchaseProduct({ item }: { item: PurchaseItem }) {
  const productHref =
    item.product_type === "book"
      ? `/library/books/${item.product_id}`
      : `/library/magazines/${item.product_id}`;

  const coverUrl = item.cover_url?.trim() || null;

  return (
    <article className={styles.productItem}>
      {coverUrl ? (
        <Link
          href={productHref}
          className={styles.productCover}
          aria-label={`Ver ${item.title}`}
        >
          <Image
            src={coverUrl}
            alt={`Portada de ${item.title}`}
            fill
            sizes="64px"
            className={styles.productCoverImage}
          />
        </Link>
      ) : (
        <span className={styles.productIcon}>
          <BookIcon />
        </span>
      )}

      <div className={styles.productInformation}>
        <span>
          {item.product_type === "book" ? "Libro" : "Revista"}
        </span>

        <h4>{item.title}</h4>

        <div className={styles.productMeta}>
          <span>Cantidad: {item.quantity}</span>
          <span>Precio: {formatPrice(item.unit_price)}</span>
        </div>
      </div>

      <div className={styles.productSubtotal}>
        <span>Subtotal</span>
        <strong>{formatPrice(item.subtotal)}</strong>

        <Link href={productHref}>
          Ver publicación
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default async function PurchasesPage({
  searchParams,
}: PurchasesPageProps) {
  const params = await searchParams;
  const selectedUserId = parseUserId(params.userId);

  const users = await getUsers();

  let history = null;

  if (selectedUserId) {
    history = await getUserPurchaseHistory(selectedUserId);

    if (!history) {
      notFound();
    }
  }

  const totalPurchases = history?.purchases.length ?? 0;
  const totalProducts = history ? getTotalItems(history.purchases) : 0;
  const totalSpent = history ? getTotalSpent(history.purchases) : 0;

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

            <Link href="/library" className={styles.activeLink}>
              Librería
            </Link>

            <Link href="/coworking">Co-working</Link>

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

            <Link href="/library">Librería universitaria</Link>
            <span aria-hidden="true">/</span>

            <strong>Historial de compras</strong>
          </nav>

          <div className={styles.introductionGrid}>
            <div>
              <span className={styles.eyebrow}>
                Actividad de la librería
              </span>

              <h1>Historial de compras</h1>

              <p>
                Consulta las publicaciones adquiridas, sus cantidades, valores
                y fechas de compra.
              </p>
            </div>

            <Link href="/library#catalogo" className={styles.catalogButton}>
              Explorar catálogo
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <form
            className={styles.userSelector}
            method="GET"
            action="/library/purchases"
          >
            <span className={styles.selectorIcon}>
              <UserIcon />
            </span>

            <label htmlFor="history-user">
              <span>Usuario</span>

              <select
                id="history-user"
                name="userId"
                defaultValue={selectedUserId ? String(selectedUserId) : ""}
                required
              >
                <option value="">Selecciona un usuario</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} — {user.email}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit">Consultar historial</button>
          </form>
        </div>
      </section>

      {!selectedUserId ? (
        <section className={styles.initialState}>
          <div className={styles.initialStateIcon}>
            <ShoppingBagIcon />
          </div>

          <span>Consulta de compras</span>

          <h2>Selecciona un usuario para consultar su historial</h2>

          <p>
            Mientras configuramos la autenticación con Auth0, puedes seleccionar
            temporalmente cualquiera de los usuarios registrados.
          </p>
        </section>
      ) : (
        <>
          <section className={styles.userSummarySection}>
            <div className={styles.userCard}>
              <span className={styles.userAvatar}>
                {history?.user.first_name.charAt(0)}
                {history?.user.last_name.charAt(0)}
              </span>

              <div>
                <span>Historial consultado para</span>

                <h2>
                  {history?.user.first_name} {history?.user.last_name}
                </h2>

                <p>{history?.user.email}</p>
              </div>
            </div>

            <div className={styles.summaryCards}>
              <article>
                <span className={styles.summaryIcon}>
                  <ShoppingBagIcon />
                </span>

                <div>
                  <strong>{totalPurchases}</strong>
                  <span>Compras realizadas</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <BookIcon />
                </span>

                <div>
                  <strong>{totalProducts}</strong>
                  <span>Productos adquiridos</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <CalendarIcon />
                </span>

                <div>
                  <strong>{formatPrice(totalSpent)}</strong>
                  <span>Total invertido</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.historySection}>
            <div className={styles.historyContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Registro de operaciones</span>

                  <h2>Compras realizadas</h2>

                  <p>
                    Las compras se presentan desde la más reciente hasta la más
                    antigua.
                  </p>
                </div>

                <strong>
                  {totalPurchases}{" "}
                  {totalPurchases === 1 ? "compra" : "compras"}
                </strong>
              </div>

              {history && history.purchases.length > 0 ? (
                <div className={styles.purchaseList}>
                  {history.purchases.map((purchase) => (
                    <article
                      key={purchase.id}
                      className={styles.purchaseCard}
                    >
                      <header className={styles.purchaseHeader}>
                        <div className={styles.purchaseReference}>
                          <span>Compra</span>
                          <strong>#{purchase.id}</strong>
                        </div>

                        <div className={styles.purchaseDate}>
                          <CalendarIcon />

                          <div>
                            <span>Fecha de compra</span>
                            <strong>
                              {formatDate(purchase.purchased_at)}
                            </strong>
                          </div>
                        </div>

                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            purchase.status,
                          )}`}
                        >
                          {getStatusLabel(purchase.status)}
                        </span>

                        <div className={styles.purchaseTotal}>
                          <span>Total</span>
                          <strong>
                            {formatPrice(purchase.total_amount)}
                          </strong>
                        </div>
                      </header>

                      <div className={styles.productsList}>
                        {purchase.items.map((item) => (
                          <PurchaseProduct key={item.id} item={item} />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <ShoppingBagIcon />
                  </span>

                  <span>Sin compras registradas</span>

                  <h3>Este usuario todavía no ha realizado compras</h3>

                  <p>
                    Explora el catálogo para consultar las publicaciones
                    disponibles.
                  </p>

                  <Link href="/library#catalogo">
                    Explorar catálogo
                  </Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className={styles.cta}>
        <div>
          <span>Catálogo Nexus</span>

          <h2>Encuentra tu próxima publicación</h2>

          <p>
            Consulta libros de diferentes categorías, autores e idiomas.
          </p>
        </div>

        <Link href="/library#catalogo">
          Ver catálogo
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
            <h3>Librería</h3>
            <Link href="/library#catalogo">Catálogo de libros</Link>
            <Link href="/library/purchases">Mis compras</Link>
            <Link href="/library/magazines">Revistas universitarias</Link>
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
            © 2026 Nexus. Proyecto académico de Desarrollo Web con Frameworks
            Front-End.
          </span>

          <span>Universidad Internacional de La Rioja</span>
        </div>
      </footer>
    </main>
  );
}