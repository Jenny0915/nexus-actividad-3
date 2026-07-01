-- ============================================================
-- NEXUS - ACTIVIDAD 2
-- Desarrollo Web con Frameworks Front-End
-- Datos de prueba para PostgreSQL
-- Archivo: database/seed.sql
-- ============================================================

-- Limpia los datos existentes y reinicia los identificadores.
-- CASCADE respeta las relaciones entre las tablas.

TRUNCATE TABLE
    reservations,
    purchase_items,
    purchases,
    book_authors,
    magazines,
    books,
    authors,
    publishers,
    categories,
    coworking_spaces,
    users
RESTART IDENTITY CASCADE;


-- ============================================================
-- 1. USUARIOS
-- ============================================================

INSERT INTO users (
    auth0_id,
    first_name,
    last_name,
    email,
    role
)
VALUES
    (
        'auth0|admin-nexus-001',
        'Laura',
        'Martínez',
        'laura.martinez@nexus.edu',
        'admin'
    ),
    (
        'google-oauth2|student-001',
        'Daniel',
        'Ramírez',
        'daniel.ramirez@nexus.edu',
        'customer'
    ),
    (
        'google-oauth2|student-002',
        'Sofía',
        'Gómez',
        'sofia.gomez@nexus.edu',
        'customer'
    ),
    (
        'google-oauth2|student-003',
        'Mateo',
        'Rodríguez',
        'mateo.rodriguez@nexus.edu',
        'customer'
    ),
    (
        'google-oauth2|student-004',
        'Valentina',
        'Torres',
        'valentina.torres@nexus.edu',
        'customer'
    );


-- ============================================================
-- 2. CATEGORÍAS
-- ============================================================

INSERT INTO categories (
    name,
    slug,
    description
)
VALUES
    (
        'Tecnología',
        'tecnologia',
        'Libros y revistas sobre informática, programación y transformación digital.'
    ),
    (
        'Literatura',
        'literatura',
        'Novelas, cuentos, poesía y obras literarias.'
    ),
    (
        'Ciencias',
        'ciencias',
        'Publicaciones relacionadas con ciencias naturales y exactas.'
    ),
    (
        'Diseño',
        'diseno',
        'Libros de diseño gráfico, experiencia de usuario e interfaces digitales.'
    ),
    (
        'Negocios',
        'negocios',
        'Administración, emprendimiento, economía y gestión empresarial.'
    ),
    (
        'Humanidades',
        'humanidades',
        'Historia, filosofía, sociología y estudios culturales.'
    );


-- ============================================================
-- 3. EDITORIALES
-- ============================================================

INSERT INTO publishers (
    name,
    country,
    website
)
VALUES
    (
        'Nexus Academic Press',
        'España',
        'https://nexusacademic.example'
    ),
    (
        'Editorial Horizonte',
        'Colombia',
        'https://horizonte.example'
    ),
    (
        'TechBooks International',
        'Estados Unidos',
        'https://techbooks.example'
    ),
    (
        'Ediciones Universitarias',
        'México',
        'https://edicionesuniversitarias.example'
    ),
    (
        'Global Knowledge',
        'Reino Unido',
        'https://globalknowledge.example'
    );


-- ============================================================
-- 4. AUTORES
-- ============================================================

INSERT INTO authors (
    first_name,
    last_name,
    biography
)
VALUES
    (
        'Ana',
        'López',
        'Ingeniera de software y docente especializada en desarrollo web moderno.'
    ),
    (
        'Carlos',
        'Mendoza',
        'Consultor de arquitectura de software y sistemas distribuidos.'
    ),
    (
        'María',
        'Fernández',
        'Diseñadora de experiencia de usuario e investigadora en accesibilidad.'
    ),
    (
        'Javier',
        'Ruiz',
        'Especialista en bases de datos y análisis de información.'
    ),
    (
        'Elena',
        'Castro',
        'Escritora y profesora de literatura contemporánea.'
    ),
    (
        'Luis',
        'Herrera',
        'Investigador en ciencias ambientales y sostenibilidad.'
    ),
    (
        'Paula',
        'Sánchez',
        'Consultora en emprendimiento, innovación y modelos de negocio.'
    ),
    (
        'Andrés',
        'Morales',
        'Desarrollador especializado en JavaScript, React y Next.js.'
    ),
    (
        'Claudia',
        'Vargas',
        'Historiadora e investigadora en estudios culturales.'
    ),
    (
        'Miguel',
        'Navarro',
        'Especialista en inteligencia artificial y ciencia de datos.'
    );


-- ============================================================
-- 5. LIBROS
-- ============================================================

INSERT INTO books (
    category_id,
    publisher_id,
    title,
    isbn,
    description,
    publication_year,
    language,
    pages,
    price,
    stock,
    cover_url,
    is_active
)
VALUES
    (
        1,
        3,
        'Desarrollo web moderno con React',
        '978-84-10001-01-1',
        'Introducción práctica al desarrollo de interfaces con React.',
        2024,
        'Español',
        420,
        29900,
        18,
        '/images/books/react-moderno.png',
        TRUE
    ),
    (
        1,
        3,
        'Next.js: aplicaciones web de alto rendimiento',
        '978-84-10001-02-8',
        'Guía para desarrollar aplicaciones híbridas utilizando Next.js.',
        2025,
        'Español',
        510,
        35000,
        15,
        '/images/books/nextjs-rendimiento.png',
        TRUE
    ),
    (
        1,
        1,
        'Diseño de API REST',
        '978-84-10001-03-5',
        'Principios, patrones y buenas prácticas para construir API REST.',
        2023,
        'Español',
        360,
        42500,
        10,
        '/images/books/api-rest.png',
        TRUE
    ),
    (
        4,
        1,
        'Fundamentos de experiencia de usuario',
        '978-84-10001-04-2',
        'Metodologías para investigar, diseñar y evaluar experiencias digitales.',
        2022,
        'Español',
        300,
        27900,
        12,
        '/images/books/experiencia-usuario.png',
        TRUE
    ),
    (
        4,
        2,
        'Interfaces accesibles',
        '978-84-10001-05-9',
        'Diseño de productos digitales inclusivos y accesibles.',
        2024,
        'Español',
        280,
        31500,
        20,
        '/images/books/interfaces-accesibles.png',
        TRUE
    ),
    (
        1,
        4,
        'PostgreSQL desde cero',
        '978-84-10001-06-6',
        'Modelado relacional, consultas SQL y administración de PostgreSQL.',
        2023,
        'Español',
        460,
        48000,
        9,
        '/images/books/postgresql.png',
        TRUE
    ),
    (
        2,
        2,
        'Historias de una ciudad invisible',
        '978-84-10001-07-3',
        'Relatos contemporáneos sobre memoria, identidad y vida urbana.',
        2021,
        'Español',
        220,
        22900,
        25,
        '/images/books/ciudad-invisible.png',
        TRUE
    ),
    (
        3,
        4,
        'Ciencia y sostenibilidad',
        '978-84-10001-08-0',
        'Análisis de los desafíos ambientales de la sociedad contemporánea.',
        2024,
        'Español',
        390,
        39900,
        14,
        '/images/books/sostenibilidad.png',
        TRUE
    ),
    (
        5,
        5,
        'Emprendimiento universitario',
        '978-84-10001-09-7',
        'Herramientas para transformar ideas académicas en proyectos sostenibles.',
        2022,
        'Español',
        250,
        26500,
        16,
        '/images/books/emprendimiento.png',
        TRUE
    ),
    (
        6,
        2,
        'Historia de las ideas contemporáneas',
        '978-84-10001-10-3',
        'Recorrido por los principales movimientos intelectuales contemporáneos.',
        2020,
        'Español',
        540,
        33800,
        8,
        '/images/books/historia-ideas.png',
        TRUE
    ),
    (
        1,
        5,
        'Inteligencia artificial aplicada',
        '978-84-10001-11-0',
        'Conceptos y aplicaciones prácticas de inteligencia artificial.',
        2025,
        'Español',
        430,
        44900,
        11,
        '/images/books/inteligencia-artificial.png',
        TRUE
    ),
    (
        5,
        1,
        'Innovación y modelos de negocio',
        '978-84-10001-12-7',
        'Diseño y validación de modelos de negocio innovadores.',
        2023,
        'Español',
        310,
        36000,
        13,
        '/images/books/modelos-negocio.png',
        TRUE
    );


-- ============================================================
-- 6. RELACIÓN ENTRE LIBROS Y AUTORES
-- ============================================================

INSERT INTO book_authors (
    book_id,
    author_id
)
VALUES
    (1, 1),
    (1, 8),
    (2, 8),
    (2, 2),
    (3, 2),
    (3, 4),
    (4, 3),
    (5, 3),
    (6, 4),
    (7, 5),
    (8, 6),
    (9, 7),
    (10, 9),
    (11, 10),
    (11, 8),
    (12, 7);


-- ============================================================
-- 7. REVISTAS
-- ============================================================

INSERT INTO magazines (
    category_id,
    publisher_id,
    title,
    issn,
    issue_number,
    publication_date,
    description,
    price,
    stock,
    cover_url,
    is_active
)
VALUES
    (
        1,
        3,
        'Tecnología Universitaria',
        '2789-1001',
        'Vol. 8 - Núm. 1',
        CURRENT_DATE - INTERVAL '30 days',
        'Tendencias recientes en desarrollo web, nube e inteligencia artificial.',
        12500,
        30,
        '/images/magazines/tecnologia-universitaria.jpg',
        TRUE
    ),
    (
        3,
        4,
        'Ciencia Abierta',
        '2789-1002',
        'Vol. 5 - Núm. 2',
        CURRENT_DATE - INTERVAL '60 days',
        'Divulgación científica y resultados de investigaciones universitarias.',
        10900,
        24,
        '/images/magazines/ciencia-abierta.jpg',
        TRUE
    ),
    (
        4,
        1,
        'Diseño e Innovación',
        '2789-1003',
        'Vol. 4 - Núm. 3',
        CURRENT_DATE - INTERVAL '15 days',
        'Diseño de productos digitales, accesibilidad y experiencia de usuario.',
        14000,
        18,
        '/images/magazines/diseno-innovacion.jpg',
        TRUE
    ),
    (
        5,
        5,
        'Negocios del Futuro',
        '2789-1004',
        'Vol. 10 - Núm. 1',
        CURRENT_DATE - INTERVAL '45 days',
        'Emprendimiento, economía digital e innovación empresarial.',
        13250,
        22,
        '/images/magazines/negocios-futuro.jpg',
        TRUE
    );


-- ============================================================
-- 8. COMPRAS
-- ============================================================

INSERT INTO purchases (
    user_id,
    status,
    total_amount,
    purchased_at
)
VALUES
    (
        2,
        'completed',
        102300,
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    ),
    (
        3,
        'completed',
        47500,
        CURRENT_TIMESTAMP - INTERVAL '15 days'
    ),
    (
        4,
        'completed',
        59400,
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    ),
    (
        5,
        'completed',
        93800,
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ),
    (
        2,
        'pending',
        39900,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );


-- ============================================================
-- 9. DETALLE DE COMPRAS
-- El subtotal se calcula automáticamente en PostgreSQL.
-- ============================================================

INSERT INTO purchase_items (
    purchase_id,
    book_id,
    magazine_id,
    quantity,
    unit_price
)
VALUES
    -- Compra 1
    (1, 1, NULL, 2, 29900),
    (1, 3, NULL, 1, 42500),

    -- Compra 2
    (2, 2, NULL, 1, 35000),
    (2, NULL, 1, 1, 12500),

    -- Compra 3
    (3, 4, NULL, 1, 27900),
    (3, 5, NULL, 1, 31500),

    -- Compra 4
    (4, 6, NULL, 1, 48000),
    (4, 7, NULL, 2, 22900),

    -- Compra pendiente
    (5, 8, NULL, 1, 39900);


-- ============================================================
-- 10. ESPACIOS DE CO-WORKING
-- ============================================================

INSERT INTO coworking_spaces (
    name,
    code,
    description,
    capacity,
    location,
    space_type,
    hourly_rate,
    is_active
)
VALUES
    (
        'Puesto individual Norte',
        'IND-001',
        'Puesto silencioso con escritorio, silla ergonómica y conexión eléctrica.',
        1,
        'Planta única - Zona norte',
        'individual',
        5000,
        TRUE
    ),
    (
        'Puesto individual Sur',
        'IND-002',
        'Espacio individual cercano a la zona de librería.',
        1,
        'Planta única - Zona sur',
        'individual',
        5.00,
        TRUE
    ),
    (
        'Mesa colaborativa A',
        'GRP-001',
        'Mesa para trabajo colaborativo con conexión eléctrica y pantalla.',
        6,
        'Planta única - Zona central',
        'group',
        12000,
        TRUE
    ),
    (
        'Sala de reuniones Nexus',
        'MEET-001',
        'Sala cerrada con pantalla, tablero y sistema de videoconferencia.',
        10,
        'Planta única - Zona oriental',
        'meeting_room',
        20000,
        TRUE
    ),
    (
        'Cabina silenciosa',
        'SIL-001',
        'Cabina insonorizada para llamadas, estudio o concentración.',
        1,
        'Planta única - Zona occidental',
        'silent_booth',
        8000,
        TRUE
    );


-- ============================================================
-- 11. RESERVAS
-- Se incluyen reservas pasadas, actuales y futuras.
-- ============================================================

INSERT INTO reservations (
    user_id,
    space_id,
    start_time,
    end_time,
    attendees,
    status,
    notes
)
VALUES
    (
        2,
        1,
        CURRENT_TIMESTAMP - INTERVAL '30 minutes',
        CURRENT_TIMESTAMP + INTERVAL '90 minutes',
        1,
        'confirmed',
        'Estudio individual para evaluación.'
    ),
    (
        3,
        3,
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        4,
        'confirmed',
        'Trabajo grupal para proyecto universitario.'
    ),
    (
        4,
        4,
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours',
        8,
        'confirmed',
        'Reunión del semillero de investigación.'
    ),
    (
        5,
        5,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '1 hour',
        1,
        'completed',
        'Videollamada académica.'
    ),
    (
        2,
        2,
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        CURRENT_TIMESTAMP + INTERVAL '3 days 2 hours',
        1,
        'pending',
        'Preparación de exposición.'
    ),
    (
        3,
        3,
        CURRENT_TIMESTAMP + INTERVAL '5 days',
        CURRENT_TIMESTAMP + INTERVAL '5 days 3 hours',
        5,
        'cancelled',
        'Reserva cancelada por cambio de horario.'
    );


-- ============================================================
-- VERIFICACIONES BÁSICAS
-- ============================================================

SELECT 'Usuarios' AS entidad, COUNT(*) AS total
FROM users

UNION ALL

SELECT 'Categorías', COUNT(*)
FROM categories

UNION ALL

SELECT 'Editoriales', COUNT(*)
FROM publishers

UNION ALL

SELECT 'Autores', COUNT(*)
FROM authors

UNION ALL

SELECT 'Libros', COUNT(*)
FROM books

UNION ALL

SELECT 'Revistas', COUNT(*)
FROM magazines

UNION ALL

SELECT 'Compras', COUNT(*)
FROM purchases

UNION ALL

SELECT 'Espacios de coworking', COUNT(*)
FROM coworking_spaces

UNION ALL

SELECT 'Reservas', COUNT(*)
FROM reservations;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================