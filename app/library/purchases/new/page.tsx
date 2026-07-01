import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";
import { getBookById } from "@/lib/data/books";

import PurchaseForm from "./PurchaseForm";
import styles from "./purchase.module.css";

export const metadata: Metadata = {
  title: "Comprar libro | Nexus",
  description:
    "Registra la compra de un libro disponible en la librería universitaria Nexus.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NewPurchasePageProps {
  searchParams: Promise<{
    bookId?: string;
  }>;
}

function parseBookId(value?: string): number | null {
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

function getAuthors(
  authors: Array<{
    first_name: string;
    last_name: string;
  }>,
): string {
  if (!authors || authors.length === 0) {
    return "Autor no disponible";
  }

  return authors
    .map((author) => `${author.first_name} ${author.last_name}`)
    .join(", ");
}

function getBookInitials(title: string): string {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
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

export default async function NewPurchasePage({
  searchParams,
}: NewPurchasePageProps) {
  const params = await searchParams;
  const bookId = parseBookId(params.bookId);

  if (!bookId) {
    notFound();
  }

  const [book, authenticatedUser] = await Promise.all([
    getBookById(bookId),
    getAuthenticatedDatabaseUser(),
  ]);

  if (!book) {
    notFound();
  }

  const purchasePath = `/library/purchases/new?bookId=${book.id}`;
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(purchasePath)}`;
  const purchasesHref = authenticatedUser
    ? `/library/purchases?userId=${authenticatedUser.id}`
    : `/auth/login?returnTo=${encodeURIComponent("/library/purchases")}`;

  if (book.stock <= 0) {
    return (
      <main className={styles.page}>
        <section className={styles.unavailableSection}>
          <Image
            src="/nexus.png"
            alt="Nexus"
            width={190}
            height={130}
            priority
          />

          <span>Libro no disponible</span>

          <h1>No hay unidades disponibles para esta compra</h1>

          <p>
            El libro seleccionado no tiene existencias en este momento.
            Regresa al catálogo para consultar otras publicaciones.
          </p>

          <Link href="/library#catalogo">
            Regresar al catálogo
          </Link>
        </section>
      </main>
    );
  }

  const numericPrice = Number(book.price);
  const coverUrl = book.cover_url?.trim() || null;

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

            <Link href="/library">Librería</Link>
            <span aria-hidden="true">/</span>

            <Link href={`/library/books/${book.id}`}>
              {book.title}
            </Link>
            <span aria-hidden="true">/</span>

            <strong>Comprar</strong>
          </nav>

          <Link
            href={`/library/books/${book.id}`}
            className={styles.backLink}
          >
            <ArrowLeftIcon />
            Regresar al libro
          </Link>
        </div>
      </section>

      <section className={styles.purchaseSection}>
        <div className={styles.purchaseHeading}>
          <span>Proceso de compra</span>

          <h1>Confirma los datos de tu compra</h1>

          <p>
            Define la cantidad de unidades que deseas adquirir. La compra
            quedará asociada automáticamente a tu cuenta y el sistema validará
            nuevamente el inventario antes de registrarla.
          </p>
        </div>

        <div className={styles.purchaseLayout}>
          <aside className={styles.bookSummary}>
            <span className={styles.summaryLabel}>
              Publicación seleccionada
            </span>

            {coverUrl ? (
              <div className={styles.bookCoverImageWrapper}>
                <Image
                  src={coverUrl}
                  alt={`Portada de ${book.title}`}
                  fill
                  priority
                  sizes="190px"
                  className={styles.bookCoverImage}
                />
              </div>
            ) : (
              <div className={styles.bookCover}>
                <span>{book.category_name}</span>

                <div>
                  <strong>{getBookInitials(book.title)}</strong>
                  <small>{book.publication_year}</small>
                </div>

                <em>Nexus Library</em>
              </div>
            )}

            <div className={styles.bookInformation}>
              <span className={styles.categoryBadge}>
                {book.category_name}
              </span>

              <h2>{book.title}</h2>

              <p>{getAuthors(book.authors)}</p>

              <dl>
                <div>
                  <dt>Precio unitario</dt>
                  <dd>{formatPrice(book.price)}</dd>
                </div>

                <div>
                  <dt>Disponibilidad</dt>
                  <dd>{book.stock} unidades</dd>
                </div>

                <div>
                  <dt>Editorial</dt>
                  <dd>{book.publisher_name}</dd>
                </div>

                <div>
                  <dt>ISBN</dt>
                  <dd>{book.isbn}</dd>
                </div>
              </dl>
            </div>
          </aside>

          {authenticatedUser ? (
            <PurchaseForm
              book={{
                id: book.id,
                title: book.title,
                price: numericPrice,
                stock: book.stock,
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

              <h2>Inicia sesión para comprar este libro</h2>

              <p>
                Debes ingresar a tu cuenta de Nexus para registrar la compra,
                asociarla a tu historial y actualizar el inventario.
              </p>

              <Link href={loginHref} className={styles.loginRequiredButton}>
                Iniciar sesión y continuar
              </Link>

              <Link
                href={`/library/books/${book.id}`}
                className={styles.loginRequiredBackLink}
              >
                Regresar al detalle del libro
              </Link>
            </section>
          )}
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
            <h3>Librería</h3>
            <Link href="/library#catalogo">Catálogo de libros</Link>
            <Link href={purchasesHref}>Mis compras</Link>
            <Link href="/library/magazines">Revistas universitarias</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Tecnología</h3>
            <span>Next.js y TypeScript</span>
            <span>PostgreSQL en Neon</span>
            <span>Transacciones SQL</span>
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
