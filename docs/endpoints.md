# Documentación de la API REST

## Nexus – Actividad 2

Esta API REST fue desarrollada con Route Handlers de Next.js y se conecta a una base de datos PostgreSQL.

La URL base utilizada durante el desarrollo local es:

```text
http://localhost:3000/api
```

Las respuestas se entregan en formato JSON e incluyen una propiedad `success` que indica si la operación fue realizada correctamente.

---

# 1. Endpoints de librería

## 1.1. Listar y filtrar libros

### Solicitud

```http
GET /api/books
```

### Descripción

Devuelve el listado de libros activos registrados en la base de datos.

Incluye información de:

* Categoría.
* Editorial.
* Autores.
* Precio.
* Stock.
* Año de publicación.
* Idioma.

### Query params disponibles

| Parámetro    | Tipo   | Obligatorio | Descripción                                        |
| ------------ | ------ | ----------: | -------------------------------------------------- |
| `categoryId` | Número |          No | Filtra los libros por categoría.                   |
| `year`       | Número |          No | Filtra por año de publicación.                     |
| `language`   | Texto  |          No | Filtra por idioma.                                 |
| `minPrice`   | Número |          No | Define el precio mínimo.                           |
| `maxPrice`   | Número |          No | Define el precio máximo.                           |
| `search`     | Texto  |          No | Busca coincidencias en título, descripción o ISBN. |

### Ejemplos

```http
GET /api/books
```

```http
GET /api/books?categoryId=1
```

```http
GET /api/books?year=2024
```

```http
GET /api/books?minPrice=20&maxPrice=40
```

```http
GET /api/books?search=React
```

### Respuesta exitosa

```text
200 OK
```

```json
{
  "success": true,
  "count": 12,
  "data": []
}
```

### Posibles errores

```text
500 Internal Server Error
```

---

## 1.2. Consultar un libro por ID

### Solicitud

```http
GET /api/books/{id}
```

### Descripción

Devuelve la información detallada de un libro específico.

Incluye:

* Información general del libro.
* Categoría.
* Editorial.
* Autores.

### Path param

| Parámetro | Tipo          | Descripción              |
| --------- | ------------- | ------------------------ |
| `id`      | Número entero | Identificador del libro. |

### Ejemplo

```http
GET /api/books/1
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

| Código                      | Motivo                                          |
| --------------------------- | ----------------------------------------------- |
| `400 Bad Request`           | El identificador no es un número entero válido. |
| `404 Not Found`             | El libro no existe o está inactivo.             |
| `500 Internal Server Error` | Error inesperado al consultar PostgreSQL.       |

---

## 1.3. Consultar los libros más vendidos

### Solicitud

```http
GET /api/books/best-sellers
```

### Descripción

Devuelve hasta diez libros ordenados por la cantidad de unidades vendidas durante las últimas ocho semanas.

La consulta considera únicamente compras con estado:

```text
completed
```

### Respuesta exitosa

```text
200 OK
```

```json
{
  "success": true,
  "count": 10,
  "period": "Últimas 8 semanas",
  "data": []
}
```

### Posibles errores

```text
500 Internal Server Error
```

---

## 1.4. Listar categorías

### Solicitud

```http
GET /api/categories
```

### Descripción

Devuelve las categorías registradas en el sistema.

Para cada categoría se muestra:

* Nombre.
* Slug.
* Descripción.
* Total de libros activos.
* Total de revistas activas.

### Respuesta exitosa

```text
200 OK
```

```json
{
  "success": true,
  "count": 6,
  "data": []
}
```

### Posibles errores

```text
500 Internal Server Error
```

---

## 1.5. Listar y filtrar revistas

### Solicitud

```http
GET /api/magazines
```

### Descripción

Devuelve el listado de revistas activas junto con su categoría y editorial.

### Query params disponibles

| Parámetro    | Tipo   | Obligatorio | Descripción                                             |
| ------------ | ------ | ----------: | ------------------------------------------------------- |
| `categoryId` | Número |          No | Filtra las revistas por categoría.                      |
| `year`       | Número |          No | Filtra por el año de publicación.                       |
| `minPrice`   | Número |          No | Define el precio mínimo.                                |
| `maxPrice`   | Número |          No | Define el precio máximo.                                |
| `search`     | Texto  |          No | Busca en título, descripción, ISSN o número de edición. |

### Ejemplos

```http
GET /api/magazines
```

```http
GET /api/magazines?categoryId=1
```

```http
GET /api/magazines?year=2026
```

```http
GET /api/magazines?minPrice=10&maxPrice=13
```

```http
GET /api/magazines?search=Tecnología
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

```text
500 Internal Server Error
```

---

## 1.6. Consultar una revista por ID

### Solicitud

```http
GET /api/magazines/{id}
```

### Descripción

Devuelve la información detallada de una revista específica.

Incluye:

* Datos generales.
* Categoría.
* Editorial.

### Path param

| Parámetro | Tipo          | Descripción                  |
| --------- | ------------- | ---------------------------- |
| `id`      | Número entero | Identificador de la revista. |

### Ejemplo

```http
GET /api/magazines/1
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

| Código                      | Motivo                                |
| --------------------------- | ------------------------------------- |
| `400 Bad Request`           | El identificador no es válido.        |
| `404 Not Found`             | La revista no existe o está inactiva. |
| `500 Internal Server Error` | Error inesperado en la consulta.      |

---

# 2. Endpoints de compras

## 2.1. Consultar las compras de un usuario

### Solicitud

```http
GET /api/users/{id}/purchases
```

### Descripción

Devuelve los datos del usuario y todas sus compras.

Cada compra incluye:

* Estado.
* Total.
* Fecha.
* Productos adquiridos.
* Cantidad.
* Precio unitario.
* Subtotal.
* Tipo de producto.

### Path param

| Parámetro | Tipo          | Descripción                |
| --------- | ------------- | -------------------------- |
| `id`      | Número entero | Identificador del usuario. |

### Ejemplo

```http
GET /api/users/3/purchases
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

| Código                      | Motivo                          |
| --------------------------- | ------------------------------- |
| `400 Bad Request`           | El ID del usuario no es válido. |
| `404 Not Found`             | El usuario no existe.           |
| `500 Internal Server Error` | Error al consultar las compras. |

---

## 2.2. Registrar una compra

### Solicitud

```http
POST /api/purchases
```

### Descripción

Registra una compra de libros o revistas.

La operación:

1. Valida el usuario.
2. Valida los productos.
3. Comprueba el stock.
4. Calcula el total.
5. Crea la compra.
6. Crea los detalles.
7. Descuenta el stock.
8. Confirma la transacción.

### Body

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

### Campos del body

| Campo         | Tipo          | Obligatorio | Descripción                       |
| ------------- | ------------- | ----------: | --------------------------------- |
| `userId`      | Número entero |          Sí | Usuario que realiza la compra.    |
| `items`       | Arreglo       |          Sí | Productos incluidos en la compra. |
| `productType` | Texto         |          Sí | Puede ser `book` o `magazine`.    |
| `productId`   | Número entero |          Sí | Identificador del producto.       |
| `quantity`    | Número entero |          Sí | Cantidad adquirida.               |

### Respuesta exitosa

```text
201 Created
```

```json
{
  "success": true,
  "message": "Compra registrada correctamente."
}
```

### Posibles errores

| Código                      | Motivo                                                    |
| --------------------------- | --------------------------------------------------------- |
| `400 Bad Request`           | Datos inválidos, producto inactivo o cantidad incorrecta. |
| `404 Not Found`             | Usuario o producto inexistente.                           |
| `409 Conflict`              | Stock insuficiente.                                       |
| `500 Internal Server Error` | Error al registrar la compra.                             |

---

# 3. Endpoints de co-working

## 3.1. Listar y filtrar espacios

### Solicitud

```http
GET /api/coworking/spaces
```

### Descripción

Devuelve los espacios de co-working activos.

Para cada espacio se incluye:

* Nombre.
* Código.
* Tipo.
* Capacidad.
* Ubicación.
* Tarifa.
* Disponibilidad actual.
* Reserva activa.
* Usuario que ocupa el espacio.
* Hora de inicio y finalización.

### Query params disponibles

| Parámetro     | Tipo     | Obligatorio | Descripción                             |
| ------------- | -------- | ----------: | --------------------------------------- |
| `available`   | Booleano |          No | Filtra espacios disponibles u ocupados. |
| `spaceType`   | Texto    |          No | Filtra por tipo de espacio.             |
| `minCapacity` | Número   |          No | Filtra por capacidad mínima.            |

### Ejemplos

```http
GET /api/coworking/spaces
```

```http
GET /api/coworking/spaces?available=true
```

```http
GET /api/coworking/spaces?available=false
```

```http
GET /api/coworking/spaces?spaceType=individual
```

```http
GET /api/coworking/spaces?minCapacity=5
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

```text
500 Internal Server Error
```

---

## 3.2. Consultar un espacio por ID

### Solicitud

```http
GET /api/coworking/spaces/{id}
```

### Descripción

Devuelve la información detallada de un espacio.

Incluye:

* Datos generales.
* Disponibilidad actual.
* Reserva activa.
* Usuario que lo ocupa.
* Próximas reservas.

### Path param

| Parámetro | Tipo          | Descripción                |
| --------- | ------------- | -------------------------- |
| `id`      | Número entero | Identificador del espacio. |

### Ejemplo

```http
GET /api/coworking/spaces/3
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

| Código                      | Motivo                                |
| --------------------------- | ------------------------------------- |
| `400 Bad Request`           | El identificador no es válido.        |
| `404 Not Found`             | El espacio no existe o está inactivo. |
| `500 Internal Server Error` | Error al consultar el espacio.        |

---

## 3.3. Crear una reserva

### Solicitud

```http
POST /api/coworking/reservations
```

### Descripción

Crea una reserva para un espacio de co-working.

La operación valida:

* Usuario existente.
* Espacio existente.
* Espacio activo.
* Capacidad.
* Formato de fechas.
* Fecha futura.
* Hora final posterior a la inicial.
* Cruce con reservas existentes.

### Body

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

### Campos del body

| Campo       | Tipo           | Obligatorio | Descripción                     |
| ----------- | -------------- | ----------: | ------------------------------- |
| `userId`    | Número entero  |          Sí | Usuario que realiza la reserva. |
| `spaceId`   | Número entero  |          Sí | Espacio solicitado.             |
| `startTime` | Fecha ISO 8601 |          Sí | Fecha y hora de inicio.         |
| `endTime`   | Fecha ISO 8601 |          Sí | Fecha y hora de finalización.   |
| `attendees` | Número entero  |          Sí | Número de asistentes.           |
| `notes`     | Texto          |          No | Observaciones de la reserva.    |

### Respuesta exitosa

```text
201 Created
```

```json
{
  "success": true,
  "message": "Reserva creada correctamente."
}
```

### Posibles errores

| Código                      | Motivo                                            |
| --------------------------- | ------------------------------------------------- |
| `400 Bad Request`           | Datos inválidos, fecha pasada o espacio inactivo. |
| `404 Not Found`             | Usuario o espacio inexistente.                    |
| `409 Conflict`              | Capacidad excedida o cruce con otra reserva.      |
| `500 Internal Server Error` | Error al crear la reserva.                        |

---

## 3.4. Consultar las reservas de un usuario

### Solicitud

```http
GET /api/users/{id}/reservations
```

### Descripción

Devuelve todas las reservas realizadas por un usuario.

Incluye:

* Horarios.
* Estado.
* Número de asistentes.
* Observaciones.
* Información del espacio.
* Estado temporal de la reserva.

### Estados temporales

| Estado      | Descripción                           |
| ----------- | ------------------------------------- |
| `upcoming`  | La reserva aún no ha iniciado.        |
| `active`    | La reserva está actualmente en curso. |
| `finished`  | La reserva ya finalizó.               |
| `cancelled` | La reserva fue cancelada.             |

### Ejemplo

```http
GET /api/users/4/reservations
```

### Respuesta exitosa

```text
200 OK
```

### Posibles errores

| Código                      | Motivo                           |
| --------------------------- | -------------------------------- |
| `400 Bad Request`           | El ID del usuario no es válido.  |
| `404 Not Found`             | El usuario no existe.            |
| `500 Internal Server Error` | Error al consultar las reservas. |

---

# 4. Resumen de endpoints

| Método | Endpoint                       | Función principal                  |
| ------ | ------------------------------ | ---------------------------------- |
| `GET`  | `/api/books`                   | Listar y filtrar libros.           |
| `GET`  | `/api/books/{id}`              | Consultar un libro.                |
| `GET`  | `/api/books/best-sellers`      | Consultar los libros más vendidos. |
| `GET`  | `/api/categories`              | Listar categorías.                 |
| `GET`  | `/api/magazines`               | Listar y filtrar revistas.         |
| `GET`  | `/api/magazines/{id}`          | Consultar una revista.             |
| `GET`  | `/api/users/{id}/purchases`    | Consultar compras de un usuario.   |
| `POST` | `/api/purchases`               | Registrar una compra.              |
| `GET`  | `/api/coworking/spaces`        | Listar y filtrar espacios.         |
| `GET`  | `/api/coworking/spaces/{id}`   | Consultar un espacio.              |
| `POST` | `/api/coworking/reservations`  | Crear una reserva.                 |
| `GET`  | `/api/users/{id}/reservations` | Consultar reservas de un usuario.  |

---

# 5. Criterios REST aplicados

La API utiliza:

* Recursos identificados mediante rutas claras.
* Métodos HTTP coherentes.
* Path params para recursos individuales.
* Query params para filtros.
* Respuestas JSON.
* Códigos HTTP según el resultado.
* Consultas parametrizadas.
* Validaciones de entrada.
* Manejo de errores.
* Transacciones en operaciones críticas.
* Acceso real a PostgreSQL.
