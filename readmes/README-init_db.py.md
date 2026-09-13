README — init_db.py

Resumen

init_db.py es un pequeño script en Python que inicializa la base de datos SQLite del proyecto. Ejecuta el esquema (schema.sql) y los datos de ejemplo (seed.sql) para crear scartech.db listo para usarse en desarrollo.

Cómo usar

1. Abrir una terminal en la carpeta database.
2. Ejecutar: python init_db.py
3. Se creará (o actualizará) el archivo scartech.db y se cargarán las tablas y los datos del seed.

Nota: si Python no está en el PATH, ejecutar con la ruta completa al intérprete. Este script está pensado para uso local/desarrollo.

Contenido y explicación por bloques

4-7: Rutas y constantes

4. BASE_DIR = Path(__file__).resolve().parent
5. DB_PATH = BASE_DIR / 'scartech.db'
6. SCHEMA_PATH = BASE_DIR / 'schema.sql'
7. SEED_PATH = BASE_DIR / 'seed.sql'

- Calcula rutas absolutas a la carpeta database y a los archivos scartech.db, schema.sql y seed.sql. Esto hace el script portátil dentro del repo.

10-19: init_db() — carga esquema y seed

10. def init_db():
11.     conn = sqlite3.connect(DB_PATH)
12.     conn.row_factory = sqlite3.Row

- Abre la conexión SQLite. Si scartech.db no existe, sqlite3 lo crea.
- row_factory permite acceder a columnas por nombre (fila['column']).

14.     try:
15.         schema_sql = SCHEMA_PATH.read_text(encoding='utf-8')
16.         conn.executescript(schema_sql)

- Lee el contenido de schema.sql y lo ejecuta con executescript() para crear las tablas (si no existen).

18.         seed_sql = SEED_PATH.read_text(encoding='utf-8')
19.         conn.executescript(seed_sql)

- Lee seed.sql y lo ejecuta para insertar los datos de ejemplo.

21-25: commit y cierre

21.         conn.commit()
22.         print(f"Base de datos creada en: {DB_PATH}")
23.         print("Tablas y registros iniciales cargados correctamente.")
24.     finally:
25.         conn.close()

- Hace commit de las operaciones y siempre cierra la conexión en el bloque finally, asegurando cierre aún si ocurre un error.

28-29: punto de entrada

28. if __name__ == '__main__':
29.     init_db()

- Ejecuta init_db() cuando se ejecuta el script directamente.

Buenas prácticas y recomendaciones

- Idempotencia: executescript() con CREATE TABLE IF NOT EXISTS y los INSERTs del seed pueden provocar duplicados si se reejecuta seed.sql sin control. Para hacer re-ejecuciones seguras, prefiera usar INSERT OR IGNORE o bloquear duplicados con condiciones.

- Contraseñas en seed: seed.sql inserta contraseñas en texto plano. Para entornos de prueba más realistas, generar hashes con bcrypt/argon2. Se puede mejorar init_db.py para aplicar un hash antes de insertar o para ejecutar un seed en Python que haga hashing.

- Manejo de errores: el script no captura errores específicos — se podría ampliar para detectar fallos en lectura de archivos y mostrar mensajes más detallados.

- Migraciones: para cambios de esquema en el tiempo, considere usar una herramienta de migraciones (Alembic, Flyway, Django migrations o scripts SQL versionados) en lugar de sobrescribir schema.sql manualmente.

- Ejecución en CI: si se usa en integración continua, usar DB_PATH en una ruta temporal o limpiar scartech.db entre runs.

Posibles mejoras automáticas (ejemplos)

- Implementar un flag --force para eliminar la DB existente y recrearla desde cero.
- Aplicar hashing a las contraseñas del seed antes de insertarlas (ej. usar hashlib/bcrypt).
- Comprobar si sqlite3 está disponible y dar instrucciones si no.

Ejemplo: crear DB desde cero (pseudocódigo)

- Si se desea recrear la DB en cada ejecución:
  if DB_PATH.exists(): DB_PATH.unlink()
  then ejecutar el flujo actual.

---

¿Quieres que actualice init_db.py para: (elige una)
- a) Hacer un --force que borre y recree scartech.db
- b) Hashear las contraseñas del seed antes de insertarlas
- c) Añadir control de errores más detallado y salida en consola

Puedo aplicar la opción que prefieras y probarla.