README — app.py

Resumen

Este archivo implementa un servidor Flask mínimo que sirve los archivos estáticos del frontend y expone una API REST básica para administrar productos y elementos multimedia. Usa SQLite (scartech.db) como persistencia y está diseñado para usarse localmente durante desarrollo.

Cómo ejecutar

- Asegurarse de tener Python 3 instalado.
- Crear la base de datos (ya existe database/scartech.db o usar database/schema.sql o init_db.py para inicializarla).
- Ejecutar: python app.py
- La aplicación se expondrá en http://0.0.0.0:5000 por defecto (modo debug True en main).

Estructura y explicación por bloques

1) Importaciones y configuración (líneas 1-12)
- from __future__ import annotations: mejoras menores en compatibilidad de anotaciones.
- sqlite3, Path, typing.Any
- from flask import Flask, abort, jsonify, request, send_from_directory
- BASE_DIR y DB_PATH: se calculan con Path(__file__).resolve().parent y database/scartech.db.
- app = Flask(__name__, static_folder=".", static_url_path=""): el app sirve archivos estáticos desde la carpeta del proyecto.

2) get_db() (líneas 15-18)
- Abre una conexión sqlite3 a DB_PATH y configura row_factory = sqlite3.Row para acceso por nombre de columna.
- Devuelve la conexión.

3) slugify(value) (líneas 21-26)
- Normaliza un texto a minúsculas, elimina caracteres no alfanuméricos y los reemplaza por guiones.
- Devuelve 'general' si el resultado queda vacío.

4) normalize_product(row) y normalize_media(row) (líneas 29-53)
- Funciones que transforman filas sqlite3.Row en diccionarios JSON serializables con claves claras: id, name, category, price, stock, image, description, featured; y para media: id, type, title, description, artist, url, file_name, size, timestamp.

5) Ruta / (index) y serve_static (líneas 56-77)
- @app.get("/"): devuelve index.html usando send_from_directory(BASE_DIR, "index.html").
- @app.route("/<path:filename>"): sirve otros archivos estáticos desde BASE_DIR, con protecciones:
  - evita servir rutas que empiecen con api/ (devuelve 404)
  - previene path traversal verificando que la ruta resuelta comience por BASE_DIR (si no, devuelve 403)
  - si el archivo existe lo sirve; si filename == "" sirve index.html; si no existe devuelve 404.

6) Productos — endpoints (líneas 79-204)
- GET /api/products: lista productos con JOIN a categories para obtener el nombre de categoría; ordena por id DESC. Devuelve JSON con normalize_product por cada fila.

- POST /api/products: crea producto. Flujo:
  - Lee JSON del request y sanea campos (name, category, price, stock, image, description).
  - Si name está vacío devuelve 400 con mensaje.
  - Busca categoría por nombre o slug (case-insensitive). Si no existe, la crea y obtiene category_id.
  - Inserta producto en tabla products (is_featured=0 y updated_at datetime('now')). Devuelve el producto creado (201).

- PUT /api/products/<int:product_id>: actualiza producto. Flujo similar a POST: valida, asegura categoría, actualiza la fila y devuelve el producto actualizado.

- DELETE /api/products/<int:product_id>: elimina el producto y devuelve un JSON { success: True, id }.

7) Media — endpoints (líneas 206-283)
- GET /api/media: SELECT * FROM media_items ORDER BY created_at DESC; transforma las filas con normalize_media y agrupa en payload { music: [], image: [], video: [] }.

- POST /api/media: recibe JSON con type, title, description, artist, url, file_name, size. Valida el type y title; inserta en media_items y devuelve el item creado con 201.

- PUT /api/media/<int:media_id>: actualiza título, descripción, artist y url de un item multimedia.

- DELETE /api/media/<int:media_id>: elimina el item multimedia.

8) main (líneas 286-288)
- if __name__ == "__main__": app.run(debug=True, host="0.0.0.0", port=5000)
- Esto ejecuta la app en modo debug para desarrollo.

Consideraciones y recomendaciones

- Claves foráneas y migraciones: asegúrate de que scartech.db exista y tenga las tablas products, categories y media_items. La carpeta database contiene schema.sql y seed.sql para crear y poblar la base de datos.

- Seguridad:
  - app.run con debug=True no es seguro para producción. Desactivar debug y usar un WSGI server (gunicorn, waitress) para producción.
  - No hay autenticación. Las rutas de administración están abiertas. Implementar autenticación/roles antes de exponer en producción.
  - Sanitizar entradas: aunque el uso de parámetros parametrizados evita inyección SQL, validar y sanear el contenido textual que se devuelve/inserta.

- updated_at: la aplicación actualiza updated_at en INSERT y UPDATE mediante datetime('now') pero no tiene triggers automáticos aparte de las sentencias explícitas.

- Manejo de archivos: las rutas de media esperan URLs (url) y no reciben archivos binarios. Para subir ficheros, implementar endpoints que reciban multipart/form-data y devuelvan URLs públicas para almacenar en la base de datos.

- Rendimiento: para listados grandes añadir paginación y/o índices (p. ej. índice en products.category_id o en media_items.created_at si no existen).

Endpoints resumen

- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/media
- POST /api/media
- PUT /api/media/:id
- DELETE /api/media/:id

---

¿Deseas que agregue autenticación básica (p. ej. un token simple) para proteger los endpoints de administración o que modifique POST /api/media para aceptar archivos multipart y guardarlos en disk?