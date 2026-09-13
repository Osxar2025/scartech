README — scartech.db

Resumen

scartech.db es la base de datos SQLite utilizada por la aplicación. Contiene las tablas creadas por schema.sql y los datos de ejemplo cargados por seed.sql. Es un archivo binario que no debe editarse directamente; usar SQL o herramientas SQLite para inspección y manipulación.

Contenido esperado (según schema.sql y seed.sql)

Tablas principales:
- users: id, name, email (UNIQUE), password_hash, role, created_at
- categories: id, name, slug, description
- products: id, name, category_id (FK -> categories.id), price, stock, image_url, description, is_featured, created_at, updated_at
- media_items: id, type (music/image/video), title, description, artist, url, file_name, size_mb, created_at
- site_settings: setting_key, setting_value

Registros precargados (resumen desde seed.sql):
- Usuarios: 'Administrador', 'Editor' (nota: passwords en seed son texto plano en el ejemplo)
- Categorías: Accesorios, Audio, Video, Pantallas
- Productos: 6 productos de ejemplo (Teclado, Mouse, Audífonos, Monitor, Webcam, Micrófono)
- Media: varias entradas music/image/video con URLs de ejemplo
- site_settings: site_name, site_tagline, currency, contact_phone, instagram_url

Cómo inspeccionar scartech.db

1) SQLite CLI (si está instalado):
   - Abrir terminal en la carpeta database
   - sqlite3 scartech.db
   - Comandos útiles:
       .tables               -- listar tablas
       .schema users         -- ver DDL de una tabla
       SELECT COUNT(*) FROM products;  -- contar filas
       SELECT * FROM products LIMIT 5;  -- ver filas de ejemplo
       .exit

2) Desde Python (ejemplo):
   import sqlite3
   con = sqlite3.connect('database/scartech.db')
   cur = con.cursor()
   cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
   print(cur.fetchall())

3) DB Browser for SQLite (GUI):
   - Herramienta multiplataforma que abre el archivo y permite ver tablas, ejecutar queries y exportar datos.

Precauciones

- Evitar versionar binarios en repositorios: scartech.db puede ser grande y su contenido cambia con frecuencia. Mantener esquemas y seeds en SQL (schema.sql y seed.sql) y regenerar la DB en entornos locales mediante init_db.py.

- Backups: antes de ejecutar scripts destructivos o modificar manualmente la DB, hacer una copia de seguridad del archivo.

- Seguridad: el archivo puede contener contraseñas de ejemplo en texto plano (seed.sql). No utilices estos valores en producción.

Sugerencias operativas

- Para CI/entornos de desarrollo, recrear la DB desde schema.sql + seed.sql para garantizar estado reproducible.
- Para producción, usar una configuración de DB que se adapte al entorno (SQLite para prototipos/local, PostgreSQL/MySQL para producción si se necesita concurrencia y escalado).

Si quieres, intento leer el archivo scartech.db y generar un resumen automático de tablas y primer registro por tabla. Nota: en este entorno no siempre está disponible el intérprete de Python o sqlite3 en PATH; puedo intentarlo si lo deseas.