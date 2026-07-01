import { db } from "@/lib/db";

export interface BookAuthor {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  description: string | null;
  publication_year: number;
  language: string;
  pages: number;
  price: string;
  stock: number;
  cover_url: string | null;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  category_id: number;
  category_name: string;
  category_slug?: string;

  publisher_id: number;
  publisher_name: string;

  authors: BookAuthor[];
  total_sold?: number;
}

export interface BookFilters {
  categoryId?: number;
  year?: number;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

type QueryValue = string | number;

function normalizeBookId(id: number | string): number | null {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

export async function getBooks(filters: BookFilters = {}): Promise<Book[]> {
  const conditions: string[] = ["b.is_active = TRUE"];
  const values: QueryValue[] = [];

  if (filters.categoryId !== undefined) {
    values.push(filters.categoryId);
    conditions.push(`b.category_id = $${values.length}`);
  }

  if (filters.year !== undefined) {
    values.push(filters.year);
    conditions.push(`b.publication_year = $${values.length}`);
  }

  if (filters.language?.trim()) {
    values.push(filters.language.trim());
    conditions.push(`LOWER(b.language) = LOWER($${values.length})`);
  }

  if (filters.minPrice !== undefined) {
    values.push(filters.minPrice);
    conditions.push(`b.price >= $${values.length}`);
  }

  if (filters.maxPrice !== undefined) {
    values.push(filters.maxPrice);
    conditions.push(`b.price <= $${values.length}`);
  }

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    conditions.push(`
      (
        b.title ILIKE $${values.length}
        OR b.description ILIKE $${values.length}
        OR b.isbn ILIKE $${values.length}
      )
    `);
  }

  const query = `
    SELECT
      b.id,
      b.title,
      b.isbn,
      b.description,
      b.publication_year,
      b.language,
      b.pages,
      b.price,
      b.stock,
      b.cover_url,
      b.is_active,
      b.created_at,
      b.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.id AS publisher_id,
      p.name AS publisher_name,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name
          )
          ORDER BY a.first_name, a.last_name
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS authors
    FROM books b
    INNER JOIN categories c ON c.id = b.category_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON a.id = ba.author_id
    WHERE ${conditions.join(" AND ")}
    GROUP BY b.id, c.id, p.id
    ORDER BY b.title ASC
  `;

  try {
    const result = await db.query<Book>(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error al consultar el catálogo de libros:", error);
    throw new Error("No fue posible consultar el catálogo de libros.");
  }
}

export async function getBestSellingBooks(): Promise<Book[]> {
  const query = `
    WITH book_sales AS (
      SELECT
        pi.book_id,
        SUM(pi.quantity)::int AS total_sold
      FROM purchase_items pi
      INNER JOIN purchases pu ON pu.id = pi.purchase_id
      WHERE pi.book_id IS NOT NULL
        AND pu.status = 'completed'
        AND pu.purchased_at >= CURRENT_TIMESTAMP - INTERVAL '8 weeks'
      GROUP BY pi.book_id
    ),
    book_author_data AS (
      SELECT
        ba.book_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name
          )
          ORDER BY a.first_name, a.last_name
        ) AS authors
      FROM book_authors ba
      INNER JOIN authors a ON a.id = ba.author_id
      GROUP BY ba.book_id
    )
    SELECT
      b.id,
      b.title,
      b.isbn,
      b.description,
      b.publication_year,
      b.language,
      b.pages,
      b.price,
      b.stock,
      b.cover_url,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.id AS publisher_id,
      p.name AS publisher_name,
      COALESCE(bs.total_sold, 0)::int AS total_sold,
      COALESCE(bad.authors, '[]'::json) AS authors
    FROM books b
    INNER JOIN categories c ON c.id = b.category_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_sales bs ON bs.book_id = b.id
    LEFT JOIN book_author_data bad ON bad.book_id = b.id
    WHERE b.is_active = TRUE
    ORDER BY total_sold DESC, b.title ASC
    LIMIT 10
  `;

  try {
    const result = await db.query<Book>(query);
    return result.rows;
  } catch (error) {
    console.error("Error al consultar los libros más vendidos:", error);
    throw new Error("No fue posible consultar los libros más vendidos.");
  }
}

export async function getBookById(
  id: number | string,
): Promise<Book | null> {
  const normalizedBookId = normalizeBookId(id);

  if (!normalizedBookId) {
    return null;
  }

  const query = `
    SELECT
      b.id,
      b.title,
      b.isbn,
      b.description,
      b.publication_year,
      b.language,
      b.pages,
      b.price,
      b.stock,
      b.cover_url,
      b.is_active,
      b.created_at,
      b.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.id AS publisher_id,
      p.name AS publisher_name,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name
          )
          ORDER BY a.first_name, a.last_name
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS authors
    FROM books b
    INNER JOIN categories c ON c.id = b.category_id
    INNER JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON a.id = ba.author_id
    WHERE b.id = $1
      AND b.is_active = TRUE
    GROUP BY b.id, c.id, p.id
    LIMIT 1
  `;

  try {
    const result = await db.query<Book>(query, [normalizedBookId]);
    return result.rows[0] ?? null;
  } catch (error) {
    console.error(
      `Error al consultar el libro con ID ${normalizedBookId}:`,
      error,
    );
    throw new Error("No fue posible consultar el libro.");
  }
}
