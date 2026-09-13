README — seed.sql

Resumen

El archivo seed.sql contiene sentencias SQL INSERT que precargan la base de datos con datos de ejemplo para usuarios, categorías, productos, elementos multimedia y configuraciones del sitio. Se usa después de crear las tablas (schema.sql) para poblar registros de prueba.

Cómo ejecutar

- Desde Python: init_db.py ya ejecuta schema.sql y seed.sql automáticamente.
- Desde la CLI de sqlite3 (si se quiere aplicar manualmente):
  - Abrir terminal en la carpeta database
  - sqlite3 scartech.db
  - .read seed.sql

Explicación por bloques/ líneas

1-4: Insertar usuarios

1. INSERT INTO users (name, email, password_hash, role)
2. VALUES
3.     ('Administrador', 'admin@scartech.com', 'admin123', 'admin'),
4.     ('Editor', 'editor@scartech.com', 'editor123', 'editor');

- Inserta dos usuarios de ejemplo: Administrador y Editor.
- Nota de seguridad: los valores de password_hash aquí son texto plano ('admin123'). En producción debe almacenarse un hash seguro (bcrypt/argon2) y nunca contraseñas en claro.

6-11: Insertar categorías

6. INSERT INTO categories (name, slug, description)
7. VALUES
8.     ('Accesorios', 'accesorios', 'Periféricos y soluciones complementarias'),
9.     ('Audio', 'audio', 'Equipos, micrófonos y audio profesional'),
10.     ('Video', 'video', 'Cámaras, webcams y contenido visual'),
11.     ('Pantallas', 'pantallas', 'Monitores y pantallas profesionales');

- Crea 4 categorías con nombre, slug (versión para URLs) y descripción.

13-20: Insertar productos

13. INSERT INTO products (name, category_id, price, stock, image_url, description, is_featured)
14. VALUES
15.     ('Teclado mecánico', 1, 1299.00, 10, 'https://images.unsplash.com/...', 'Teclado profesional para trabajo y gaming.', 1),
16.     ('Mouse gamer', 1, 699.00, 12, 'https://images.unsplash.com/...', 'Mouse ergonómico con alta precisión.', 1),
17.     ('Audífonos Bluetooth', 2, 1499.00, 8, 'https://images.unsplash.com/...', 'Sistema de audio portátil y limpio.', 1),
18.     ('Monitor 27"', 4, 2899.00, 6, 'https://images.unsplash.com/...', 'Pantalla para edición y productividad.', 1),
19.     ('Webcam 4K', 3, 999.00, 14, 'https://images.unsplash.com/...', 'Cámara para streaming y videollamadas.', 0),
20.     ('Micrófono USB', 2, 899.00, 9, 'https://images.unsplash.com/...', 'Micrófono ideal para grabación compacta.', 0);

- Inserta 6 productos de ejemplo. category_id referencia las categorías creadas anteriormente (1..4).
- is_featured: 1 marca producto destacado.

22-28: Insertar elementos multimedia (media_items)

22. INSERT INTO media_items (type, title, description, artist, url, file_name, size_mb)
23. VALUES
24.     ('music', 'Signal in the Night', 'Tema destacado para contenido visual.', 'Nova Echo', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'signal-night.mp3', 3.8),
25.     ('music', 'Electric Dreams', 'Pista moderna para moodboard.', 'Pulse Theory', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'electric-dreams.mp3', 4.1),
26.     ('image', 'Set de estudio', 'Diseño minimalista para contenido creativo.', 'N/A', 'https://images.unsplash.com/...', 'studio-set.jpg', 1.8),
27.     ('image', 'Idea en movimiento', 'Concepto para campañas digitales.', 'N/A', 'https://images.unsplash.com/...', 'idea-motion.jpg', 2.1),
28.     ('video', 'Behind the scenes', 'Recorrido visual del proceso creativo.', 'N/A', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 'behind-the-scenes.mp4', 8.2);

- Inserta ejemplos de música, imágenes y video que la UI puede consumir.
- url contiene enlaces públicos a recursos de ejemplo; file_name y size_mb son metadatos.

30-36: Insertar configuración del sitio (site_settings)

30. INSERT INTO site_settings (setting_key, setting_value)
31. VALUES
32.     ('site_name', 'ScarTech'),
33.     ('site_tagline', 'Tecnología para crear y vender mejor'),
34.     ('currency', 'USD'),
35.     ('contact_phone', '+57 311 6427476'),
36.     ('instagram_url', 'https://www.instagram.com/oscar_cm25');

- Llave-valor con ajustes globales del sitio.

Recomendaciones y observaciones

- Integridad referencial: las inserciones asumen que las tablas ya existen y que los IDs de categorías corresponden a los inserts previos. Ejecutar schema.sql antes de ejecutar seed.sql.

- Sensible a entornos: en un entorno de producción evitar valores por defecto inseguros (contraseñas) y revisar URLs externas.

- Uso con init_db.py: para creación automática del DB en desarrollo, ejecutar python init_db.py desde la carpeta database.

- Para actualizar datos de prueba: editar seed.sql y re-ejecutar (o usar scripts de migración más sofisticados).

---

Si deseas, puedo crear una versión de seed.sql que genere contraseñas hasheadas y que use INSERT OR IGNORE para evitar duplicados al re-ejecutar.