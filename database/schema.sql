-- ============================================================
-- NEXUS - ACTIVIDAD 2
-- Desarrollo Web con Frameworks Front-End
-- Base de datos PostgreSQL
-- Archivo: database/schema.sql
-- ============================================================

-- Este bloque permite ejecutar nuevamente el archivo durante
-- el desarrollo, eliminando primero las tablas existentes.
-- El orden es importante debido a las claves foráneas.

DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS coworking_spaces CASCADE;
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS book_authors CASCADE;
DROP TABLE IF EXISTS magazines CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS publishers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ============================================================
-- 1. USUARIOS
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    auth0_id VARCHAR(255) UNIQUE,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    role VARCHAR(30) NOT NULL DEFAULT 'customer',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_role
        CHECK (role IN ('customer', 'admin'))
);


-- ============================================================
-- 2. CATEGORÍAS
-- ============================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. EDITORIALES
-- ============================================================

CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,
    country VARCHAR(100),
    website VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 4. AUTORES
-- ============================================================

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    biography TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_author_name
        UNIQUE (first_name, last_name)
);


-- ============================================================
-- 5. LIBROS
-- ============================================================

CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,

    category_id INTEGER NOT NULL,
    publisher_id INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,

    description TEXT,

    publication_year INTEGER NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'Español',

    pages INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,

    cover_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_books_publisher
        FOREIGN KEY (publisher_id)
        REFERENCES publishers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_books_publication_year
        CHECK (publication_year BETWEEN 1000 AND 2100),

    CONSTRAINT chk_books_pages
        CHECK (pages > 0),

    CONSTRAINT chk_books_price
        CHECK (price >= 0),

    CONSTRAINT chk_books_stock
        CHECK (stock >= 0)
);


-- ============================================================
-- 6. RELACIÓN ENTRE LIBROS Y AUTORES
-- Un libro puede tener varios autores.
-- Un autor puede participar en varios libros.
-- ============================================================

CREATE TABLE book_authors (
    book_id BIGINT NOT NULL,
    author_id INTEGER NOT NULL,

    PRIMARY KEY (book_id, author_id),

    CONSTRAINT fk_book_authors_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_book_authors_author
        FOREIGN KEY (author_id)
        REFERENCES authors(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 7. REVISTAS
-- ============================================================

CREATE TABLE magazines (
    id BIGSERIAL PRIMARY KEY,

    category_id INTEGER NOT NULL,
    publisher_id INTEGER NOT NULL,

    title VARCHAR(255) NOT NULL,
    issn VARCHAR(20) NOT NULL,
    issue_number VARCHAR(50) NOT NULL,

    publication_date DATE NOT NULL,

    description TEXT,

    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,

    cover_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_magazines_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_magazines_publisher
        FOREIGN KEY (publisher_id)
        REFERENCES publishers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_magazine_issue
        UNIQUE (issn, issue_number, publication_date),

    CONSTRAINT chk_magazines_price
        CHECK (price >= 0),

    CONSTRAINT chk_magazines_stock
        CHECK (stock >= 0)
);


-- ============================================================
-- 8. COMPRAS
-- Cabecera general de cada compra realizada.
-- ============================================================

CREATE TABLE purchases (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,

    purchased_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchases_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_purchases_status
        CHECK (status IN ('pending', 'completed', 'cancelled')),

    CONSTRAINT chk_purchases_total
        CHECK (total_amount >= 0)
);


-- ============================================================
-- 9. DETALLE DE COMPRAS
-- Cada registro corresponde a un libro o una revista.
-- Nunca puede contener ambos simultáneamente.
-- ============================================================

CREATE TABLE purchase_items (
    id BIGSERIAL PRIMARY KEY,

    purchase_id BIGINT NOT NULL,

    book_id BIGINT,
    magazine_id BIGINT,

    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,

    subtotal NUMERIC(10, 2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,

    CONSTRAINT fk_purchase_items_purchase
        FOREIGN KEY (purchase_id)
        REFERENCES purchases(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_items_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_purchase_items_magazine
        FOREIGN KEY (magazine_id)
        REFERENCES magazines(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_purchase_items_product
        CHECK (
            (book_id IS NOT NULL AND magazine_id IS NULL)
            OR
            (book_id IS NULL AND magazine_id IS NOT NULL)
        ),

    CONSTRAINT chk_purchase_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_purchase_items_unit_price
        CHECK (unit_price >= 0)
);


-- ============================================================
-- 10. ESPACIOS DE CO-WORKING
-- ============================================================

CREATE TABLE coworking_spaces (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,

    description TEXT,

    capacity INTEGER NOT NULL,
    location VARCHAR(150) NOT NULL,

    space_type VARCHAR(50) NOT NULL,

    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_coworking_capacity
        CHECK (capacity > 0),

    CONSTRAINT chk_coworking_space_type
        CHECK (
            space_type IN (
                'individual',
                'group',
                'meeting_room',
                'silent_booth'
            )
        ),

    CONSTRAINT chk_coworking_hourly_rate
        CHECK (hourly_rate >= 0)
);


-- ============================================================
-- 11. RESERVAS DE CO-WORKING
-- ============================================================

CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    space_id INTEGER NOT NULL,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    attendees INTEGER NOT NULL DEFAULT 1,

    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_reservations_space
        FOREIGN KEY (space_id)
        REFERENCES coworking_spaces(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_reservations_dates
        CHECK (end_time > start_time),

    CONSTRAINT chk_reservations_attendees
        CHECK (attendees > 0),

    CONSTRAINT chk_reservations_status
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        )
);


-- ============================================================
-- ÍNDICES
-- Mejoran el rendimiento de búsquedas y filtros frecuentes.
-- ============================================================

CREATE INDEX idx_books_category
    ON books(category_id);

CREATE INDEX idx_books_publisher
    ON books(publisher_id);

CREATE INDEX idx_books_publication_year
    ON books(publication_year);

CREATE INDEX idx_books_price
    ON books(price);

CREATE INDEX idx_books_active
    ON books(is_active);

CREATE INDEX idx_magazines_category
    ON magazines(category_id);

CREATE INDEX idx_magazines_publication_date
    ON magazines(publication_date);

CREATE INDEX idx_purchases_user
    ON purchases(user_id);

CREATE INDEX idx_purchases_status
    ON purchases(status);

CREATE INDEX idx_purchase_items_purchase
    ON purchase_items(purchase_id);

CREATE INDEX idx_purchase_items_book
    ON purchase_items(book_id);

CREATE INDEX idx_purchase_items_magazine
    ON purchase_items(magazine_id);

CREATE INDEX idx_reservations_user
    ON reservations(user_id);

CREATE INDEX idx_reservations_space
    ON reservations(space_id);

CREATE INDEX idx_reservations_schedule
    ON reservations(space_id, start_time, end_time);

CREATE INDEX idx_reservations_status
    ON reservations(status);


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================