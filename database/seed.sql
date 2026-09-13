INSERT INTO users (name, email, password_hash, role)
VALUES
    ('Administrador', 'admin@scartech.com', 'admin123', 'admin'),
    ('Editor', 'editor@scartech.com', 'editor123', 'editor');

INSERT INTO categories (name, slug, description)
VALUES
    ('Accesorios', 'accesorios', 'Periféricos y soluciones complementarias'),
    ('Audio', 'audio', 'Equipos, micrófonos y audio profesional'),
    ('Video', 'video', 'Cámaras, webcams y contenido visual'),
    ('Pantallas', 'pantallas', 'Monitores y pantallas profesionales');

INSERT INTO products (name, category_id, price, stock, image_url, description, is_featured)
VALUES
    ('Teclado mecánico', 1, 1299.00, 10, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80', 'Teclado profesional para trabajo y gaming.', 1),
    ('Mouse gamer', 1, 699.00, 12, 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80', 'Mouse ergonómico con alta precisión.', 1),
    ('Audífonos Bluetooth', 2, 1499.00, 8, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', 'Sistema de audio portátil y limpio.', 1),
    ('Monitor 27"', 4, 2899.00, 6, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 'Pantalla para edición y productividad.', 1),
    ('Webcam 4K', 3, 999.00, 14, 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=800&q=80', 'Cámara para streaming y videollamadas.', 0),
    ('Micrófono USB', 2, 899.00, 9, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 'Micrófono ideal para grabación compacta.', 0);

INSERT INTO media_items (type, title, description, artist, url, file_name, size_mb)
VALUES
    ('music', 'Signal in the Night', 'Tema destacado para contenido visual.', 'Nova Echo', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'signal-night.mp3', 3.8),
    ('music', 'Electric Dreams', 'Pista moderna para moodboard.', 'Pulse Theory', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'electric-dreams.mp3', 4.1),
    ('image', 'Set de estudio', 'Diseño minimalista para contenido creativo.', 'N/A', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80', 'studio-set.jpg', 1.8),
    ('image', 'Idea en movimiento', 'Concepto para campañas digitales.', 'N/A', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 'idea-motion.jpg', 2.1),
    ('video', 'Behind the scenes', 'Recorrido visual del proceso creativo.', 'N/A', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 'behind-the-scenes.mp4', 8.2);

INSERT INTO site_settings (setting_key, setting_value)
VALUES
    ('site_name', 'ScarTech'),
    ('site_tagline', 'Tecnología para crear y vender mejor'),
    ('currency', 'USD'),
    ('contact_phone', '+57 311 6427476'),
    ('instagram_url', 'https://www.instagram.com/oscar_cm25');
