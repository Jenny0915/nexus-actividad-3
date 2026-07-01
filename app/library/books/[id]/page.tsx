import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getBookById,
  getBooks,
  type Book,
} from "@/lib/data/books";

import styles from "./book-detail.module.css";

export const revalidate = 3600;
export const runtime = "nodejs";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function parseBookId(value: string): number | null {
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

function getAuthors(book: Book): string {
  if (!book.authors || book.authors.length === 0) {
    return "Autor no disponible";
  }

  return book.authors
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

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
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

function ShoppingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H7" />
    </svg>
  );
}

export async function generateStaticParams() {
  try {
    const books = await getBooks();

    return books.map((book) => ({
      id: String(book.id),
    }));
  } catch (error) {
    console.error(
      "No fue posible generar las rutas estáticas de libros:",
      error,
    );

    return [];
  }
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const bookId = parseBookId(resolvedParams.id);

  if (!bookId) {
    return {
      title: "Libro no encontrado | Nexus",
    };
  }

  try {
    const book = await getBookById(bookId);

    if (!book) {
      return {
        title: "Libro no encontrado | Nexus",
      };
    }

    return {
      title: `${book.title} | Librería Nexus`,
      description:
        book.description ??
        `Consulta la información del libro ${book.title} en Nexus.`,
    };
  } catch {
    return {
      title: "Detalle del libro | Nexus",
    };
  }
}

export default async function BookDetailPage({
  params,
}: BookDetailPageProps) {
  const resolvedParams = await params;
  const bookId = parseBookId(resolvedParams.id);

  if (!bookId) {
    notFound();
  }

  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const isAvailable = book.stock > 0;

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

          <nav
            className={styles.navigation}
            aria-label="Navegación principal"
          >
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
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>

            <Link href="/library">Librería universitaria</Link>
            <span aria-hidden="true">/</span>

            <strong>{book.title}</strong>
          </nav>

          <Link href="/library#catalogo" className={styles.backLink}>
            <ArrowLeftIcon />
            Regresar al catálogo
          </Link>
        </div>
      </section>

      <section className={styles.bookSection}>
        <div className={styles.bookLayout}>
          <aside className={styles.coverColumn}>
            {book.cover_url ? (
              <div className={styles.bookCoverImageWrapper}>
                <Image
                  src={book.cover_url}
                  alt={`Portada de ${book.title}`}
                  fill
                  priority
                  sizes="(max-width: 780px) 300px, 315px"
                  className={styles.bookCoverImage}
                />
              </div>
            ) : (
              <div className={styles.bookCover}>
                <span className={styles.coverCategory}>
                  {book.category_name}
                </span>

                <div className={styles.coverCenter}>
                  <strong>{getBookInitials(book.title)}</strong>
                  <span>{book.publication_year}</span>
                </div>

                <small>Nexus Library</small>
              </div>
            )}

            <div
              className={`${styles.availabilityCard} ${
                isAvailable
                  ? styles.availabilityCardAvailable
                  : styles.availabilityCardUnavailable
              }`}
            >
              <span className={styles.availabilityIcon}>
                {isAvailable ? <CheckIcon /> : "!"}
              </span>

              <div>
                <strong>
                  {isAvailable ? "Disponible" : "Sin existencias"}
                </strong>

                <span>
                  {isAvailable
                    ? `${book.stock} unidades disponibles`
                    : "El libro no tiene unidades disponibles actualmente"}
                </span>
              </div>
            </div>
          </aside>

          <article className={styles.bookInformation}>
            <span className={styles.categoryBadge}>
              {book.category_name}
            </span>

            <h1>{book.title}</h1>

            <p className={styles.authors}>{getAuthors(book)}</p>

            <div className={styles.priceRow}>
              <strong>{formatPrice(book.price)}</strong>

              <span>Precio unitario</span>
            </div>

            <p className={styles.description}>
              {book.description ||
                "No hay una descripción disponible para esta publicación."}
            </p>

            <div className={styles.detailGrid}>
              <article>
                <span>ISBN</span>
                <strong>{book.isbn}</strong>
              </article>

              <article>
                <span>Editorial</span>
                <strong>{book.publisher_name}</strong>
              </article>

              <article>
                <span>Año de publicación</span>
                <strong>{book.publication_year}</strong>
              </article>

              <article>
                <span>Idioma</span>
                <strong>{book.language}</strong>
              </article>

              <article>
                <span>Número de páginas</span>
                <strong>{book.pages}</strong>
              </article>

              <article>
                <span>Categoría</span>
                <strong>{book.category_name}</strong>
              </article>
            </div>

            <div className={styles.actionPanel}>
              <div className={styles.actionInformation}>
                <BookIcon />

                <div>
                  <strong>Compra académica</strong>

                  <span>
                    El registro de la compra quedará asociado al usuario
                    autenticado.
                  </span>
                </div>
              </div>

              {isAvailable ? (
                <Link
                  href={`/library/purchases/new?bookId=${book.id}`}
                  className={styles.purchaseButton}
                >
                  <ShoppingIcon />
                  Comprar libro
                </Link>
              ) : (
                <span className={styles.disabledButton}>
                  No disponible
                </span>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.additionalInformation}>
        <div className={styles.additionalGrid}>
          <article>
            <span className={styles.additionalNumber}>01</span>

            <h2>Información editorial</h2>

            <dl>
              <div>
                <dt>Editorial</dt>
                <dd>{book.publisher_name}</dd>
              </div>

              <div>
                <dt>ISBN</dt>
                <dd>{book.isbn}</dd>
              </div>

              <div>
                <dt>Publicación</dt>
                <dd>{book.publication_year}</dd>
              </div>
            </dl>
          </article>

          <article>
            <span className={styles.additionalNumber}>02</span>

            <h2>Información del contenido</h2>

            <dl>
              <div>
                <dt>Idioma</dt>
                <dd>{book.language}</dd>
              </div>

              <div>
                <dt>Páginas</dt>
                <dd>{book.pages}</dd>
              </div>

              <div>
                <dt>Categoría</dt>
                <dd>{book.category_name}</dd>
              </div>
            </dl>
          </article>

          <article>
            <span className={styles.additionalNumber}>03</span>

            <h2>Disponibilidad</h2>

            <dl>
              <div>
                <dt>Estado</dt>
                <dd>{isAvailable ? "Disponible" : "Agotado"}</dd>
              </div>

              <div>
                <dt>Unidades</dt>
                <dd>{book.stock}</dd>
              </div>

              <div>
                <dt>Precio</dt>
                <dd>{formatPrice(book.price)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span>Continúa explorando</span>

          <h2>Descubre más publicaciones disponibles en Nexus</h2>

          <p>
            Regresa al catálogo para consultar libros de diferentes categorías,
            autores e idiomas.
          </p>
        </div>

        <Link href="/library#catalogo">
          Ver catálogo completo
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
            <span>Autenticación con Auth0</span>
            <span>Despliegue en Vercel</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 Nexus. Proyecto académico de Desarrollo Web con Frameworks
            Front-End.
          </span>

          <span>Por: Jenny Andrea Laverde Rodríguez</span>
        </div>
      </footer>
    </main>
  );
}