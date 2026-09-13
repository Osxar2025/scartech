from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, abort, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "scartech.db"

app = Flask(__name__, static_folder=".", static_url_path="")


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def slugify(value: str) -> str:
    import re

    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "general"


def normalize_product(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "price": float(row["price"] or 0),
        "stock": int(row["stock"] or 0),
        "image": row["image"],
        "description": row["description"],
        "featured": bool(row["featured"]),
    }


def normalize_media(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "type": row["type"],
        "title": row["title"],
        "description": row["description"],
        "artist": row["artist"],
        "url": row["url"],
        "file_name": row["file_name"],
        "size": row["size_mb"],
        "timestamp": row["created_at"],
    }


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static(filename: str):
    if filename.startswith("api/"):
        abort(404)

    candidate = (BASE_DIR / filename).resolve()
    if not str(candidate).startswith(str(BASE_DIR)):
        abort(403)

    if candidate.is_file():
        return send_from_directory(BASE_DIR, filename)

    if filename == "":
        return send_from_directory(BASE_DIR, "index.html")

    abort(404)


@app.get("/api/products")
def list_products():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT p.id, p.name, c.name AS category, p.price, p.stock, p.image_url AS image,
               p.description, p.is_featured AS featured
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.id DESC
        """
    ).fetchall()
    conn.close()
    return jsonify([normalize_product(row) for row in rows])


@app.post("/api/products")
def create_product():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    category_name = (data.get("category") or "General").strip()
    price = float(data.get("price") or 0)
    stock = int(data.get("stock") or 0)
    image = (data.get("image") or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return jsonify({"error": "El nombre del producto es obligatorio."}), 400

    conn = get_db()
    category_row = conn.execute(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?)",
        (category_name, slugify(category_name)),
    ).fetchone()

    if category_row is None:
        category_cursor = conn.execute(
            "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
            (category_name, slugify(category_name), "Creada desde el panel admin"),
        )
        category_id = category_cursor.lastrowid
    else:
        category_id = category_row["id"]

    cursor = conn.execute(
        """
        INSERT INTO products (name, category_id, price, stock, image_url, description, is_featured, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
        """,
        (name, category_id, price, stock, image or None, description or None),
    )
    product_id = cursor.lastrowid
    row = conn.execute(
        """
        SELECT p.id, p.name, c.name AS category, p.price, p.stock, p.image_url AS image,
               p.description, p.is_featured AS featured
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
        """,
        (product_id,),
    ).fetchone()
    conn.commit()
    conn.close()
    return jsonify(normalize_product(row)), 201


@app.put("/api/products/<int:product_id>")
def update_product(product_id: int):
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    category_name = (data.get("category") or "General").strip()
    price = float(data.get("price") or 0)
    stock = int(data.get("stock") or 0)
    image = (data.get("image") or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return jsonify({"error": "El nombre del producto es obligatorio."}), 400

    conn = get_db()
    category_row = conn.execute(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?)",
        (category_name, slugify(category_name)),
    ).fetchone()

    if category_row is None:
        category_cursor = conn.execute(
            "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
            (category_name, slugify(category_name), "Creada desde el panel admin"),
        )
        category_id = category_cursor.lastrowid
    else:
        category_id = category_row["id"]

    conn.execute(
        """
        UPDATE products
        SET name = ?, category_id = ?, price = ?, stock = ?, image_url = ?, description = ?, updated_at = datetime('now')
        WHERE id = ?
        """,
        (name, category_id, price, stock, image or None, description or None, product_id),
    )
    row = conn.execute(
        """
        SELECT p.id, p.name, c.name AS category, p.price, p.stock, p.image_url AS image,
               p.description, p.is_featured AS featured
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
        """,
        (product_id,),
    ).fetchone()
    conn.commit()
    conn.close()
    return jsonify(normalize_product(row))


@app.delete("/api/products/<int:product_id>")
def delete_product(product_id: int):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": product_id})


@app.get("/api/media")
def list_media():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM media_items ORDER BY created_at DESC"
    ).fetchall()
    conn.close()

    payload = {"music": [], "image": [], "video": []}
    for row in rows:
        payload.setdefault(row["type"], []).append(normalize_media(row))
    return jsonify(payload)


@app.post("/api/media")
def create_media():
    data = request.get_json(silent=True) or {}
    media_type = (data.get("type") or "").strip().lower()
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    artist = (data.get("artist") or "").strip()
    url = (data.get("url") or "").strip()
    file_name = (data.get("file_name") or "").strip() or ("archivo" if url else "")
    size_mb = data.get("size")

    if media_type not in {"music", "image", "video"}:
        return jsonify({"error": "Tipo de media inválido."}), 400
    if not title:
        return jsonify({"error": "El título es obligatorio."}), 400

    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO media_items (type, title, description, artist, url, file_name, size_mb)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (media_type, title, description or None, artist or None, url or None, file_name or None, size_mb),
    )
    media_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM media_items WHERE id = ?", (media_id,)).fetchone()
    conn.commit()
    conn.close()
    return jsonify(normalize_media(row)), 201


@app.put("/api/media/<int:media_id>")
def update_media(media_id: int):
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    artist = (data.get("artist") or "").strip()
    url = (data.get("url") or "").strip()

    if not title:
        return jsonify({"error": "El título es obligatorio."}), 400

    conn = get_db()
    conn.execute(
        """
        UPDATE media_items
        SET title = ?, description = ?, artist = ?, url = ?
        WHERE id = ?
        """,
        (title, description or None, artist or None, url or None, media_id),
    )
    row = conn.execute("SELECT * FROM media_items WHERE id = ?", (media_id,)).fetchone()
    conn.commit()
    conn.close()
    return jsonify(normalize_media(row))


@app.delete("/api/media/<int:media_id>")
def delete_media(media_id: int):
    conn = get_db()
    conn.execute("DELETE FROM media_items WHERE id = ?", (media_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": media_id})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
