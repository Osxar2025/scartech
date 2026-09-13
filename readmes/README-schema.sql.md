README — schema.sql

Resumen

Este archivo (schema.sql) contiene un script en Python que crea y configura una base de datos SQLite llamada "scartech.db" y define tres tablas: users, categories y products. A pesar de la extensión ".sql", el contenido es código Python que usa el módulo sqlite3 para ejecutar sentencias SQL.

Propósito

- Crear la base de datos SQLite y habilitar las claves foráneas.
- Definir las tablas necesarias para una tienda simple: usuarios, categorías y productos.
- Aplicar restricciones (UNIQUE, NOT NULL, CHECK), valores por defecto y una relación entre products y categories.

Cómo ejecutar

1. Se recomienda renombrar el archivo a schema.py para evitar confusiones sobre el lenguaje, por ejemplo:
   - Renombrar: schema.sql -> schema.py
2. Ejecutar con Python 3 desde la carpeta "database":
   - Abrir PowerShell o CMD en C:\Users\oscar CM\Desktop\convetidor mp3\database
   - Ejecutar: python schema.py

Salida esperada

- Se crea (o actualiza) un fichero SQLite llamado scartech.db en la misma carpeta.
- Se imprimirá en consola: "Base de datos creada correctamente"

Explicación detallada por bloques/lineas

1-4: Importar sqlite3 y abrir la conexión

1. import sqlite3
   - Importa el módulo estándar sqlite3 de Python; permite conectarse y ejecutar comandos contra bases de datos SQLite.

3. conn = sqlite3.connect("scartech.db")
   - Abre (o crea si no existe) la base de datos SQLite llamada scartech.db en el directorio actual.
   - Devuelve un objeto Connection asignado a la variable conn.

4. conn.execute("PRAGMA foreign_keys = ON;")
   - Ejecuta la sentencia PRAGMA para activar la enforcement de claves foráneas en SQLite.
   - En SQLite, las claves foráneas están deshabilitadas por defecto a nivel de conexión; esta línea asegura que las restricciones FOREIGN KEY funcionen.

6-38: Ejecutar el script SQL que crea las tablas

6. conn.executescript("""
   - Inicia la ejecución de un bloque con múltiples sentencias SQL. executescript() acepta un string con varias declaraciones separadas por punto y coma.

7. PRAGMA foreign_keys = ON;
   - Reitera la activación de claves foráneas dentro del script SQL (redundante con la línea 4 pero inofensiva). Mantenerlo asegura que, si el script se ejecuta por separado como SQL, también active la opción.

9-16: Tabla users

9. CREATE TABLE IF NOT EXISTS users (
   - Crea la tabla users sólo si no existe aún.

10.     id INTEGER PRIMARY KEY AUTOINCREMENT,
   - id: clave primaria numérica autoincremental. En SQLite, INTEGER PRIMARY KEY se comporta como ROWID.

11.     name TEXT NOT NULL,
   - name: campo de texto obligatorio.

12.     email TEXT NOT NULL UNIQUE,
   - email: campo de texto obligatorio y único; evita registros duplicados por email.

13.     password_hash TEXT NOT NULL,
   - password_hash: campo obligatorio que debería almacenar el hash de la contraseña (no almacenar contraseñas en claro).

14.     role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin', 'editor', 'cliente')),
   - role: campo de texto obligatorio con valor por defecto 'admin'.
   - CHECK(role IN (...)) limita los valores permitidos a 'admin', 'editor' o 'cliente'.

15.     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   - created_at: registra la fecha/hora de creación como texto en formato ISO mediante datetime('now') de SQLite.

16. );
   - Cierre de la definición de la tabla users.

18-23: Tabla categories

18. CREATE TABLE IF NOT EXISTS categories (
   - Define la tabla categories si no existe.

19.     id INTEGER PRIMARY KEY AUTOINCREMENT,
   - id autoincremental.

20.     name TEXT NOT NULL UNIQUE,
   - name: nombre de la categoría obligatorio y único.

21.     slug TEXT NOT NULL UNIQUE,
   - slug: versión amigable para URLs, obligatorio y único.

22.     description TEXT
   - description: campo de texto opcional para describir la categoría.

23. );
   - Cierre de la definición de categories.

25-37: Tabla products

25. CREATE TABLE IF NOT EXISTS products (
   - Define la tabla products si no existe.

26.     id INTEGER PRIMARY KEY AUTOINCREMENT,
   - id autoincremental.

27.     name TEXT NOT NULL,
   - name: nombre del producto obligatorio.

28.     category_id INTEGER,
   - category_id: referencia opcional a categories.id. No es NOT NULL, por lo que un producto puede no pertenecer a ninguna categoría.

29.     price REAL NOT NULL DEFAULT 0,
   - price: precio del producto, tipo REAL (número flotante). Valor por defecto 0 y obligatorio.

30.     stock INTEGER NOT NULL DEFAULT 0,
   - stock: cantidad en inventario, entero, obligatorio, por defecto 0.

31.     image_url TEXT,
   - image_url: URL o ruta de la imagen del producto; opcional.

32.     description TEXT,
   - description: texto descriptivo opcional.

33.     is_featured INTEGER NOT NULL DEFAULT 0,
   - is_featured: indicador entero (0/1) para marcar productos destacados. Valor por defecto 0.

34.     created_at TEXT NOT NULL DEFAULT (datetime('now')),
   - created_at: fecha/hora de creación, por defecto el momento actual.

35.     updated_at TEXT NOT NULL DEFAULT (datetime('now')),
   - updated_at: fecha/hora de última actualización. En este diseño se inicializa con la hora de creación, pero no se actualiza automáticamente. Para mantener actualizaciones automáticas, habría que añadir un TRIGGER que actualice este campo cuando el registro cambie.

36.     FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
   - Añade la restricción de clave foránea entre products.category_id y categories.id.
   - ON DELETE SET NULL: si se borra una categoría referenciada, la columna category_id del producto se pone a NULL en lugar de borrar el producto.

37. );
   - Cierre de la definición de products.

38. """)
   - Fin del string pasado a executescript(). Todas las sentencias anteriores se envían juntas a SQLite.

40-43: Confirmar y cerrar

40. conn.commit()
   - Confirma (commit) la transacción; aplica de forma permanente las modificaciones realizadas en la base de datos.

41. conn.close()
   - Cierra la conexión con la base de datos.

42. print("Base de datos creada correctamente")
   - Mensaje informativo en consola que indica que el script terminó.

Observaciones y recomendaciones

- Nombre y extensión del archivo:
  - El archivo se llama schema.sql pero contiene Python. Para evitar confusiones, renombrar a schema.py es recomendable. Si la intención es mantenerlo como SQL puro, separar el SQL del código Python y ejecutar el SQL directamente con una herramienta SQLite.

- updated_at:
  - Actualmente updated_at se establece sólo al crear el registro. Si se desea que refleje la última modificación, agregar un TRIGGER SQLite que actualice updated_at a datetime('now') en UPDATE.

- Enfoque de seguridad para contraseñas:
  - El campo password_hash debe contener un hash seguro (p. ej. bcrypt, Argon2). No almacenar contraseñas en texto.

- Tipos y localización de datos:
  - created_at y updated_at se almacenan como TEXT usando datetime('now'), que produce un formato legible. Otra opción es usar INTEGER con unix epoch si se prefiere eficiencia en comparaciones.

- Claves foráneas:
  - Es esencial ejecutar PRAGMA foreign_keys = ON por conexión. El script activa la opción tanto a nivel de conexión (conn.execute) como dentro del bloque SQL por redundancia.

- Índices adicionales:
  - Dependiendo de consultas frecuentes (p. ej. buscar productos por category_id o slug), podría convenir crear índices adicionales para optimizar búsquedas.

- Ejemplo rápido de trigger para updated_at:
  - Si se decide mejorar el esquema, un ejemplo de trigger sería:
    CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
      UPDATE products SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

Contacto y mantenimiento

- Autor: (no especificado en el script)
- Fecha de última edición: (según timestamp del archivo)

Si se desea, se puede: renombrar el archivo a .py y/o añadir el trigger para updated_at; puedo aplicar esos cambios y verificar que la base de datos se crea correctamente. También puedo generar READMEs para otros archivos si los proporciona o indicarlos todos para crear un README por archivo.