import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import AuthMenu from "@/components/AuthMenu";
import LanguageSelector from "@/components/LanguageSelector";
import { getLocale } from "@/lib/i18n/get-locale";

import {
  getBestSellingBooks,
  getBooks,
  type Book,
  type BookFilters,
} from "@/lib/data/books";

import styles from "./library.module.css";

export const metadata: Metadata = {
  title: "Librería universitaria | Nexus",
  description:
    "Consulta libros, categorías y recursos disponibles en la librería universitaria Nexus.",
};

/*
 * La página se renderiza dinámicamente para que el encabezado
 * reconozca siempre la sesión actual de Auth0.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  totalBooks: number;
}

interface LibraryPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    year?: string;
    language?: string;
  }>;
}

function parseOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
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

function getCategories(books: Book[]): CategorySummary[] {
  const categoriesMap = new Map<number, CategorySummary>();

  books.forEach((book) => {
    const existingCategory = categoriesMap.get(book.category_id);

    if (existingCategory) {
      existingCategory.totalBooks += 1;
      return;
    }

    categoriesMap.set(book.category_id, {
      id: book.category_id,
      name: book.category_name,
      slug: book.category_slug ?? String(book.category_id),
      totalBooks: 1,
    });
  });

  return Array.from(categoriesMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name, "es"),
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
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

function BookCover({
  book,
  featured = false,
}: {
  book: Book;
  featured?: boolean;
}) {
  const coverUrl = book.cover_url?.trim() || null;

  return (
    <div
      className={`${styles.bookCover} ${
        featured ? styles.bookCoverFeatured : ""
      } ${!coverUrl ? styles.bookCoverFallback : ""}`}
      aria-label={`Portada de ${book.title}`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Portada del libro ${book.title}`}
          fill
          sizes={featured ? "155px" : "145px"}
          className={styles.bookCoverImage}
        />
      ) : (
        <>
          <span className={styles.bookCoverCategory}>
            {book.category_name}
          </span>

          <div className={styles.bookCoverCenter}>
            <strong>{getBookInitials(book.title)}</strong>
            <span>{book.publication_year}</span>
          </div>

          <small>Nexus Library</small>
        </>
      )}
    </div>
  );
}

function CatalogBookCard({ book }: { book: Book }) {
  return (
    <article className={styles.catalogCard}>
      <BookCover book={book} />

      <div className={styles.catalogCardContent}>
        <span className={styles.categoryBadge}>{book.category_name}</span>

        <h3>{book.title}</h3>

        <p className={styles.bookAuthors}>{getAuthors(book)}</p>

        <p className={styles.bookDescription}>
          {book.description || "Descripción no disponible para este libro."}
        </p>

        <div className={styles.bookMeta}>
          <span>{book.publication_year}</span>
          <span>{book.language}</span>
          <span>{book.pages} páginas</span>
        </div>

        <div className={styles.catalogCardFooter}>
          <div>
            <strong>{formatPrice(book.price)}</strong>

            <small>
              {book.stock > 0
                ? `${book.stock} unidades disponibles`
                : "Sin existencias"}
            </small>
          </div>

          <Link
            href={`/library/books/${book.id}`}
            aria-label={`Consultar los detalles de ${book.title}`}
          >
            Ver detalles
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function LibraryPage({
  searchParams,
}: LibraryPageProps) {
  const [params, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);

  const selectedSearch = params.search?.trim() ?? "";
  const selectedCategoryId = params.categoryId ?? "";
  const selectedYear = params.year ?? "";
  const selectedLanguage = params.language ?? "";

  const filters: BookFilters = {
    search: selectedSearch || undefined,
    categoryId: parseOptionalNumber(selectedCategoryId),
    year: parseOptionalNumber(selectedYear),
    language: selectedLanguage || undefined,
  };

  const hasActiveFilters = Boolean(
    selectedSearch ||
      selectedCategoryId ||
      selectedYear ||
      selectedLanguage,
  );

  let allBooks: Book[] = [];
  let filteredBooks: Book[] = [];
  let bestSellingBooks: Book[] = [];
  let loadingError = false;

  try {
    [allBooks, filteredBooks, bestSellingBooks] = await Promise.all([
      getBooks(),
      getBooks(filters),
      getBestSellingBooks(),
    ]);
  } catch (error) {
    console.error("Error al cargar la librería universitaria:", error);
    loadingError = true;
  }

  const categories = getCategories(allBooks);

  const availableBooks = allBooks.filter((book) => book.stock > 0).length;

  const languages = Array.from(
    new Set(allBooks.map((book) => book.language).filter(Boolean)),
  ).sort((first, second) => first.localeCompare(second, "es"));

  const years = Array.from(
    new Set(allBooks.map((book) => book.publication_year)),
  ).sort((first, second) => second - first);

  return (
    <main className={styles.libraryPage}>
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

      <section className={styles.pageIntroduction}>
        <div className={styles.pageIntroductionContent}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <strong>Librería universitaria</strong>
          </nav>

          <div className={styles.introductionGrid}>
            <div className={styles.introductionText}>
              <span className={styles.eyebrow}>Biblioteca digital Nexus</span>

              <h1>Librería universitaria</h1>

              <p>
                Explora libros, autores, categorías y recursos académicos
                disponibles para acompañar tu proceso de formación.
              </p>
            </div>

            <Link
              href="/library/purchases"
              className={styles.purchasesButton}
            >
              Consultar mis compras
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <form
            className={styles.searchPanel}
            method="GET"
            action="/library"
          >
            <div className={styles.searchField}>
              <SearchIcon />

              <input
                type="search"
                name="search"
                aria-label="Buscar libros"
                placeholder="Buscar por título, descripción o ISBN"
                defaultValue={selectedSearch}
              />
            </div>

            <label className={styles.filterField}>
              <span>Categoría</span>

              <select
                name="categoryId"
                defaultValue={selectedCategoryId}
              >
                <option value="">Todas</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Año</span>

              <select name="year" defaultValue={selectedYear}>
                <option value="">Todos</option>

                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Idioma</span>

              <select
                name="language"
                defaultValue={selectedLanguage}
              >
                <option value="">Todos</option>

                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.filterButton}>
              <FilterIcon />
              Filtrar
            </button>
          </form>
        </div>
      </section>

      {loadingError ? (
        <section className={styles.errorSection}>
          <div>
            <span>No fue posible acceder a los datos</span>

            <h2>El catálogo no está disponible en este momento</h2>

            <p>
              Revisa la conexión con Neon y la configuración de la variable
              DATABASE_URL.
            </p>

            <Link href="/">Regresar al inicio</Link>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.summarySection}>
            <div className={styles.summaryGrid}>
              <article>
                <span className={styles.summaryIcon}>
                  <BookIcon />
                </span>

                <div>
                  <strong>{allBooks.length}</strong>
                  <span>Libros registrados</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <BookIcon />
                </span>

                <div>
                  <strong>{availableBooks}</strong>
                  <span>Libros disponibles</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <BookIcon />
                </span>

                <div>
                  <strong>{categories.length}</strong>
                  <span>Categorías</span>
                </div>
              </article>

              <article>
                <span className={styles.summaryIcon}>
                  <BookIcon />
                </span>

                <div>
                  <strong>{languages.length}</strong>
                  <span>Idiomas</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.categoriesSection}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Explorar por categoría</span>
                  <h2>Encuentra contenidos según tus intereses</h2>
                </div>

                <a href="#catalogo">Ver catálogo completo</a>
              </div>

              <div className={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/library?categoryId=${category.id}#catalogo`}
                    className={styles.categoryCard}
                  >
                    <span className={styles.categoryNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.categoryIcon}>
                      <BookIcon />
                    </span>

                    <h3>{category.name}</h3>

                    <p>
                      {category.totalBooks}{" "}
                      {category.totalBooks === 1 ? "libro" : "libros"}
                    </p>

                    <span className={styles.categoryArrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.bestSellersSection}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>Selección destacada</span>
                  <h2>Los libros más vendidos</h2>

                  <p>
                    Clasificación basada en las compras completadas durante las
                    últimas ocho semanas.
                  </p>
                </div>

                <span className={styles.isrBadge}>
                  Actualización automática cada hora
                </span>
              </div>

              <div className={styles.bestSellersGrid}>
                {bestSellingBooks.map((book, index) => (
                  <article key={book.id} className={styles.bestSellerCard}>
                    <span className={styles.ranking}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <BookCover book={book} featured />

                    <div className={styles.bestSellerContent}>
                      <span className={styles.categoryBadge}>
                        {book.category_name}
                      </span>

                      <h3>{book.title}</h3>

                      <p>{getAuthors(book)}</p>

                      <div className={styles.salesInformation}>
                        <span>
                          <strong>{book.total_sold ?? 0}</strong>
                          unidades vendidas
                        </span>

                        <strong>{formatPrice(book.price)}</strong>
                      </div>

                      <Link href={`/library/books/${book.id}`}>
                        Consultar libro
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.catalogSection} id="catalogo">
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>
                    {hasActiveFilters
                      ? "Resultados de la búsqueda"
                      : "Catálogo Nexus"}
                  </span>

                  <h2>
                    {hasActiveFilters
                      ? "Libros encontrados"
                      : "Todos los libros disponibles"}
                  </h2>

                  <p>
                    {hasActiveFilters
                      ? "El catálogo se ha actualizado de acuerdo con los filtros seleccionados."
                      : "Consulta información editorial, autores, disponibilidad y precio de cada publicación."}
                  </p>
                </div>

                <div className={styles.catalogCount}>
                  <strong>{filteredBooks.length}</strong>
                  <span>
                    {filteredBooks.length === 1
                      ? "resultado"
                      : "resultados"}
                  </span>
                </div>
              </div>

              {filteredBooks.length > 0 ? (
                <div className={styles.catalogGrid}>
                  {filteredBooks.map((book) => (
                    <CatalogBookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className={styles.errorSection}>
                  <div>
                    <span>Sin resultados</span>

                    <h2>No encontramos libros con esos criterios</h2>

                    <p>
                      Modifica la búsqueda o elimina los filtros para consultar
                      nuevamente el catálogo completo.
                    </p>

                    <Link href="/library">Limpiar filtros</Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className={styles.libraryCta}>
        <div>
          <span>Historial de compras</span>

          <h2>Consulta los libros que has adquirido en Nexus</h2>

          <p>
            Revisa tus compras y accede a la información de cada publicación
            desde un solo lugar.
          </p>
        </div>

        <Link href="/library/purchases">
          Consultar mis compras
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
            <a href="#catalogo">Catálogo de libros</a>
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
            © 2026 Nexus. Actividad 3 - Desarrollo Web con Frameworks Front-End.
          </span>

          <span>Por: Jenny Andrea Laverde Rodríguez</span>
        </div>
      </footer>
    </main>
  );
}