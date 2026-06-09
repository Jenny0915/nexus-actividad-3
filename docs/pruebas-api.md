# Pruebas de la API REST

## Nexus – Actividad 2

Las pruebas de la API REST se realizaron con Postman sobre el entorno local de desarrollo.

La URL base utilizada fue:

```text
http://localhost:3000/api
```

El servidor de Next.js se ejecutó mediante:

```bash
npm run dev
```

Las solicitudes se organizaron en una colección de Postman llamada:

```text
Nexus API - Actividad 2
```

El objetivo de las pruebas fue comprobar:

* Acceso real a los datos almacenados en PostgreSQL.
* Funcionamiento de los métodos `GET` y `POST`.
* Uso de path params.
* Uso de query params.
* Creación de compras.
* Creación de reservas.
* Actualización del stock.
* Validación de errores.
* Uso correcto de códigos HTTP.

---

# 1. Pruebas del módulo de librería

## 1.1. Listar todos los libros

### Solicitud

```http
GET http://localhost:3000/api/books
```

### Resultado esperado

* Código HTTP `200 OK`.
* Propiedad `success` con valor `true`.
* Cantidad total de libros.
* Información de categoría, editorial y autores.

### Resultado obtenido

```text
200 OK
```

La API devolvió correctamente los doce libros registrados en PostgreSQL.

---

## 1.2. Filtrar libros por categoría

### Solicitud

```http
GET http://localhost:3000/api/books?categoryId=1
```

### Parámetro utilizado

| Parámetro    | Valor |
| ------------ | ----: |
| `categoryId` |   `1` |

### Resultado esperado

* Código HTTP `200 OK`.
* Solo libros pertenecientes a la categoría con ID `1`.

### Resultado obtenido

```text
200 OK
```

La respuesta devolvió cinco libros pertenecientes a la categoría Tecnología.

---

## 1.3. Consultar un libro por ID

### Solicitud

```http
GET http://localhost:3000/api/books/1
```

### Resultado esperado

* Código HTTP `200 OK`.
* Información detallada del libro.
* Categoría.
* Editorial.
* Autores.

### Resultado obtenido

```text
200 OK
```

Se obtuvo correctamente el libro:

```text
Desarrollo web moderno con React
```

---

## 1.4. Consultar libros más vendidos

### Solicitud

```http
GET http://localhost:3000/api/books/best-sellers
```

### Resultado esperado

* Código HTTP `200 OK`.
* Máximo diez libros.
* Orden descendente por unidades vendidas.
* Periodo de las últimas ocho semanas.

### Resultado obtenido

```text
200 OK
```

Los libros se devolvieron correctamente ordenados por el campo:

```text
total_sold
```

Durante esta prueba se detectó inicialmente una duplicación de las ventas cuando un libro tenía varios autores. La consulta fue corregida separando el cálculo de ventas y la agrupación de autores.

---

## 1.5. Listar categorías

### Solicitud

```http
GET http://localhost:3000/api/categories
```

### Resultado esperado

* Código HTTP `200 OK`.
* Listado de categorías.
* Total de libros y revistas por categoría.

### Resultado obtenido

```text
200 OK
```

La API devolvió correctamente seis categorías.

---

## 1.6. Listar revistas

### Solicitud

```http
GET http://localhost:3000/api/magazines
```

### Resultado esperado

* Código HTTP `200 OK`.
* Listado de revistas activas.
* Categoría.
* Editorial.
* Precio.
* Stock.

### Resultado obtenido

```text
200 OK
```

Se obtuvieron correctamente las cuatro revistas registradas.

---

## 1.7. Consultar una revista por ID

### Solicitud

```http
GET http://localhost:3000/api/magazines/1
```

### Resultado esperado

* Código HTTP `200 OK`.
* Información detallada de la revista.
* Categoría.
* Editorial.

### Resultado obtenido

```text
200 OK
```

Se obtuvo correctamente la revista:

```text
Tecnología Universitaria
```

---

# 2. Pruebas del módulo de compras

## 2.1. Consultar compras de un usuario

### Solicitud

```http
GET http://localhost:3000/api/users/3/purchases
```

### Resultado esperado

* Código HTTP `200 OK`.
* Información del usuario.
* Compras asociadas.
* Detalle de libros y revistas adquiridos.

### Resultado obtenido

```text
200 OK
```

La API devolvió correctamente las compras del usuario con ID `3`, incluyendo:

* Estado.
* Total.
* Fecha.
* Productos.
* Cantidad.
* Precio unitario.
* Subtotal.

---

## 2.2. Registrar una compra

### Solicitud

```http
POST http://localhost:3000/api/purchases
```

### Body enviado

```json
{
  "userId": 5,
  "items": [
    {
      "productType": "book",
      "productId": 4,
      "quantity": 1
    },
    {
      "productType": "magazine",
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

### Resultado esperado

* Código HTTP `201 Created`.
* Compra creada.
* Detalles registrados.
* Total calculado.
* Stock actualizado.

### Resultado obtenido

```text
201 Created
```

La respuesta indicó:

```json
{
  "success": true,
  "message": "Compra registrada correctamente."
}
```

La compra fue almacenada en PostgreSQL y posteriormente pudo consultarse mediante el endpoint de compras del usuario.

---

# 3. Pruebas del módulo de co-working

## 3.1. Listar espacios de co-working

### Solicitud

```http
GET http://localhost:3000/api/coworking/spaces
```

### Resultado esperado

* Código HTTP `200 OK`.
* Listado de espacios.
* Capacidad.
* Tipo.
* Tarifa.
* Disponibilidad.
* Reserva activa, cuando exista.

### Resultado obtenido

```text
200 OK
```

La API devolvió correctamente cinco espacios.

También se identificó el espacio ocupado y el usuario responsable de la reserva activa.

---

## 3.2. Filtrar espacios disponibles

### Solicitud

```http
GET http://localhost:3000/api/coworking/spaces?available=true
```

### Resultado esperado

* Código HTTP `200 OK`.
* Únicamente espacios sin una reserva activa.

### Resultado obtenido

```text
200 OK
```

El filtro devolvió correctamente los espacios disponibles.

---

## 3.3. Consultar un espacio por ID

### Solicitud

```http
GET http://localhost:3000/api/coworking/spaces/3
```

### Resultado esperado

* Código HTTP `200 OK`.
* Información del espacio.
* Estado de disponibilidad.
* Reserva actual.
* Usuario.
* Próximas reservas.

### Resultado obtenido

```text
200 OK
```

Se obtuvo correctamente la información de:

```text
Mesa colaborativa A
```

La respuesta indicó que el espacio se encontraba ocupado y mostró la reserva activa.

---

## 3.4. Consultar reservas de un usuario

### Solicitud

```http
GET http://localhost:3000/api/users/4/reservations
```

### Resultado esperado

* Código HTTP `200 OK`.
* Información del usuario.
* Reservas asociadas.
* Información del espacio.
* Estado temporal.

### Resultado obtenido

```text
200 OK
```

La API devolvió correctamente las reservas del usuario con ID `4`.

Los estados temporales se mostraron como:

* `upcoming`
* `active`
* `finished`
* `cancelled`

según las fechas y el estado registrado.

---

## 3.5. Crear una reserva

### Solicitud

```http
POST http://localhost:3000/api/coworking/reservations
```

### Body enviado

```json
{
  "userId": 2,
  "spaceId": 1,
  "startTime": "2026-06-20T15:00:00-05:00",
  "endTime": "2026-06-20T17:00:00-05:00",
  "attendees": 1,
  "notes": "Reserva de prueba desde Postman."
}
```

### Resultado esperado

* Código HTTP `201 Created`.
* Reserva registrada.
* Usuario asociado.
* Espacio asociado.
* Estado `confirmed`.

### Resultado obtenido

```text
201 Created
```

La respuesta indicó:

```json
{
  "success": true,
  "message": "Reserva creada correctamente."
}
```

La reserva fue almacenada correctamente en PostgreSQL.

---

# 4. Pruebas de errores controlados

## 4.1. Error 400 – Identificador inválido

### Solicitud

```http
GET http://localhost:3000/api/books/abc
```

### Resultado esperado

```text
400 Bad Request
```

### Resultado obtenido

La API rechazó el valor porque no corresponde a un número entero válido.

Respuesta esperada:

```json
{
  "success": false,
  "message": "El identificador del libro debe ser un número entero válido."
}
```

---

## 4.2. Error 404 – Libro no encontrado

### Solicitud

```http
GET http://localhost:3000/api/books/999
```

### Resultado esperado

```text
404 Not Found
```

### Resultado obtenido

La API indicó que no existe un libro activo con el identificador solicitado.

Respuesta esperada:

```json
{
  "success": false,
  "message": "No se encontró un libro activo con el identificador 999."
}
```

---

## 4.3. Error 409 – Cruce de reserva

### Solicitud

```http
POST http://localhost:3000/api/coworking/reservations
```

### Body enviado

Se utilizó nuevamente el mismo espacio y horario de una reserva previamente creada:

```json
{
  "userId": 2,
  "spaceId": 1,
  "startTime": "2026-06-20T15:00:00-05:00",
  "endTime": "2026-06-20T17:00:00-05:00",
  "attendees": 1,
  "notes": "Reserva de prueba desde Postman."
}
```

### Resultado esperado

```text
409 Conflict
```

### Resultado obtenido

```text
409 Conflict
```

La API devolvió el mensaje:

```json
{
  "success": false,
  "message": "El espacio ya tiene una reserva que se cruza con el horario solicitado."
}
```

La prueba confirma que el sistema impide registrar dos reservas superpuestas para el mismo espacio.

---

# 5. Resumen de resultados

| Prueba                        | Método | Resultado         |
| ----------------------------- | ------ | ----------------- |
| Listar libros                 | `GET`  | `200 OK`          |
| Filtrar libros por categoría  | `GET`  | `200 OK`          |
| Consultar libro por ID        | `GET`  | `200 OK`          |
| Consultar libros más vendidos | `GET`  | `200 OK`          |
| Listar categorías             | `GET`  | `200 OK`          |
| Listar revistas               | `GET`  | `200 OK`          |
| Consultar revista por ID      | `GET`  | `200 OK`          |
| Consultar compras de usuario  | `GET`  | `200 OK`          |
| Registrar compra              | `POST` | `201 Created`     |
| Listar espacios               | `GET`  | `200 OK`          |
| Filtrar espacios disponibles  | `GET`  | `200 OK`          |
| Consultar espacio por ID      | `GET`  | `200 OK`          |
| Consultar reservas de usuario | `GET`  | `200 OK`          |
| Crear reserva                 | `POST` | `201 Created`     |
| ID inválido                   | `GET`  | `400 Bad Request` |
| Libro inexistente             | `GET`  | `404 Not Found`   |
| Cruce de reserva              | `POST` | `409 Conflict`    |

---

# 6. Conclusión

Las pruebas confirmaron que la API REST:

* Accede correctamente a PostgreSQL.
* Devuelve información real de la base de datos.
* Permite aplicar filtros mediante query params.
* Permite consultar recursos mediante path params.
* Registra compras y reservas.
* Actualiza el stock.
* Utiliza transacciones en operaciones críticas.
* Evita reservas superpuestas.
* Maneja correctamente errores de validación.
* Utiliza códigos HTTP coherentes.

La colección utilizada para las pruebas quedó almacenada en Postman con el nombre:

```text
Nexus API - Actividad 2
```
