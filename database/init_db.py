import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'scartech.db'
SCHEMA_PATH = BASE_DIR / 'schema.sql'
SEED_PATH = BASE_DIR / 'seed.sql'


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        schema_sql = SCHEMA_PATH.read_text(encoding='utf-8')
        conn.executescript(schema_sql)

        seed_sql = SEED_PATH.read_text(encoding='utf-8')
        conn.executescript(seed_sql)

        conn.commit()
        print(f"Base de datos creada en: {DB_PATH}")
        print("Tablas y registros iniciales cargados correctamente.")
    finally:
        conn.close()


if __name__ == '__main__':
    init_db()
