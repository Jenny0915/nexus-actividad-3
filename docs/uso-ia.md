# Uso de Inteligencia Artificial

## Actividad 2 – Implementación de API REST y acceso a datos

Durante esta actividad se utilizó ChatGPT como herramienta de apoyo principalmente para la generación inicial del modelo relacional y de los datos de prueba solicitados en el enunciado.

Las respuestas obtenidas fueron revisadas y adaptadas antes de incorporarlas al proyecto. La creación del entorno, configuración de PostgreSQL, ejecución de scripts, implementación de los endpoints, pruebas y correcciones se realizaron durante el proceso de desarrollo.

---

## 1. Generación inicial del modelo relacional

### Prompt utilizado

> Diseña un modelo de datos relacional en PostgreSQL para una aplicación universitaria llamada Nexus, compuesta por un módulo de librería y otro de espacios de coworking.
> La librería debe gestionar usuarios, libros, revistas, autores, categorías, editoriales, compras y detalles de compra.
> El módulo de coworking debe gestionar espacios y reservas.
> Define las entidades, sus atributos, claves primarias, claves foráneas y relaciones.

### Resultado obtenido

La respuesta propuso como punto de partida las siguientes tablas:

* `users`
* `categories`
* `publishers`
* `authors`
* `books`
* `book_authors`
* `magazines`
* `purchases`
* `purchase_items`
* `coworking_spaces`
* `reservations`

### Revisión realizada

A partir de la propuesta inicial se revisaron y ajustaron manualmente:

* Tipos de datos.
* Claves primarias y foráneas.
* Relaciones y cardinalidades.
* Restricciones `NOT NULL`, `UNIQUE` y `CHECK`.
* Reglas de eliminación y actualización.
* Índices para consultas frecuentes.
* Validaciones de cantidades, precios, estados y fechas.

El resultado final quedó almacenado en:

```text
database/schema.sql
```

---

## 2. Generación de datos de prueba

### Prompt utilizado

> A partir del modelo relacional de Nexus, genera sentencias `INSERT` de PostgreSQL con datos de prueba coherentes para usuarios, categorías, editoriales, autores, libros, revistas, compras, espacios de coworking y reservas.

### Resultado obtenido

La respuesta permitió construir una base inicial de datos de prueba con:

* 5 usuarios.
* 6 categorías.
* 5 editoriales.
* 10 autores.
* 12 libros.
* 4 revistas.
* Compras y detalles de compra.
* 5 espacios de coworking.
* Reservas pasadas, actuales y futuras.

El resultado final quedó almacenado en:

```text
database/seed.sql
```

### Revisión realizada

Antes de ejecutar el script se comprobaron:

* Las claves foráneas.
* La coherencia entre identificadores.
* Los estados permitidos.
* Las cantidades y precios.
* Las fechas de las reservas.
* Las relaciones entre compras y productos.

El script fue ejecutado y validado en PostgreSQL mediante pgAdmin.

---

## 3. Apoyo puntual durante el desarrollo

La IA también se utilizó de forma puntual para consultar dudas relacionadas con:

* La estructura de los Route Handlers de Next.js.
* El uso de parámetros dinámicos y parámetros de consulta.
* La conexión con PostgreSQL.
* El manejo de transacciones.
* La validación de cruces de reservas.

Estas orientaciones se tomaron únicamente como referencia. Cada fragmento fue revisado, adaptado y probado antes de ser incorporado al proyecto.

---

## 4. Ejemplo de corrección realizada

Durante la consulta de libros más vendidos se detectó que una primera versión duplicaba las unidades vendidas cuando un libro tenía más de un autor.

El problema se produjo por la combinación de las tablas de ventas y autores en una misma consulta.

La consulta fue revisada y se separaron:

* El cálculo de ventas por libro.
* La agrupación de autores.

Después de la corrección, los resultados se validaron con los datos almacenados en PostgreSQL.

Este caso demuestra que las respuestas proporcionadas por la IA no fueron utilizadas de forma automática, sino verificadas durante el desarrollo.

---

## 5. Evaluación aproximada del uso de IA

### Respuestas correctas o parcialmente correctas

Se estima que aproximadamente el:

```text
85 %
```

de las respuestas fueron correctas o sirvieron como base útil después de realizar ajustes.

### Respuestas incorrectas o que necesitaron cambios importantes

Se estima que aproximadamente el:

```text
15 %
```

de las respuestas necesitaron correcciones importantes o no se utilizaron directamente.

### Líneas aproximadas generadas con apoyo de IA

Se estima que se utilizaron como referencia aproximadamente:

```text
450 a 600 líneas
```

Principalmente correspondientes a:

* Estructura inicial del archivo DDL.
* Sentencias de datos de prueba.
* Fragmentos puntuales de consultas y validaciones.

### Tiempo ahorrado estimado

Se estima un ahorro aproximado de:

```text
4 a 6 horas
```

El ahorro se concentró especialmente en:

* La definición inicial de entidades.
* La preparación de datos de prueba.
* La consulta de dudas técnicas concretas.

---

## 6. Conclusión

La IA se utilizó como una herramienta de apoyo para acelerar algunas tareas iniciales y consultar dudas puntuales.

El diseño definitivo, la adaptación del código, la configuración del proyecto, la ejecución de los scripts, la implementación de la API, las pruebas en Postman y las correcciones fueron realizadas y verificadas durante el desarrollo de la actividad.
