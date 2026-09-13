README — index.html

Resumen

Este archivo es la página principal (home) del sitio ScarTech. Contiene la estructura HTML, navegación, secciones destacadas (hero), y un script inline que carga y renderiza tarjetas de productos y elementos multimedia en la página principal.

Cómo usar

- Abrir index.html en un navegador o servir la carpeta con la aplicación Flask (app.py). La página intentará consultar las rutas /api/products y /api/media para obtener datos reales del servidor; si no están disponibles, usa datos de respaldo locales.

Estructura y explicación por bloques

1) Cabecera / head (líneas 1-8)
- <!DOCTYPE html>, <html lang="en"> y <meta>: definición estándar del documento HTML y configuración de viewport.
- <title>ScarTech</title>: título de la pestaña.
- <link rel="stylesheet" href="estilo.css">: incluye los estilos del proyecto.

2) Header / navegación (líneas 10-30)
- header.topbar: contenedor superior con la marca y la navegación.
- nav.tab-nav con enlaces a Inicio, Video a MP3, Audiovisuales y Tienda.
- social-links: íconos (SVG) que apuntan a Instagram, WhatsApp y GitHub.
- Accesibilidad: se usan atributos aria-label y etiquetas semánticas.

3) Main — hero y secciones (líneas 32-63)
- .hero-panel: sección principal con título, subtítulo, botones de acción (Ver catálogo, Ver publicaciones) y estadísticas.
- .home-section (Lo más vendido): contenedor con id="#homeFeaturedProducts" donde se renderizan 3 productos destacados.
- .home-section (Publicaciones recientes): contenedor con id="#homeMediaGrid" donde se renderan elementos multimedia (música, imagen, video).

4) Script inline (líneas 66-174)
- Constantes PRODUCT_KEY y MEDIA_KEY: claves para localStorage si se quiere usar cache local.
- loadJson(key, fallback): función auxiliar para leer JSON de localStorage con manejo de errores.

- renderHomeCards(): función asíncrona que:
  - Define fallbackProducts y fallbackMedia: datos de respaldo para mostrar cuando la API no responde.
  - Intenta hacer fetch a /api/products y /api/media; si tienen éxito, reemplaza los fallback.
  - Renderiza las tarjetas en #homeFeaturedProducts y #homeMediaGrid según el tipo (music/image/video). Usa plantillas en línea (template strings) para construir el HTML.
  - Para productos limita a los 3 primeros (slice(0,3)) y para multimedia combina music, image y video y toma los primeros 4.
  - Manejo de errores: si falla la carga remota, se muestran los valores de respaldo y se escribe una advertencia en consola.

- DOMContentLoaded: se vincula renderHomeCards para ejecutar cuando el DOM esté listo.

Puntos importantes y recomendaciones

- Accesibilidad: la página usa roles y etiquetas semánticas básicas; se podría añadir texto alternativo más descriptivo, mayor contraste en algunos componentes y atributos aria para los botones.

- Rendimiento: la página realiza fetch a /api/products y /api/media. Si se espera alto tráfico, considerar paginación y caching del lado servidor.

- Seguridad: al insertar las propiedades del producto en innerHTML se confía en la API; si la API puede contener datos no confiables, conviene escapar o sanitizar los valores para evitar XSS.

- Mejora: extraer el script inline a un archivo JS separado para facilitar el mantenimiento y la prueba.

Archivos relacionados

- estilo.css: estilos globales.
- tienda.html / audiovisuales.html: páginas secundarias relacionadas.
- app.py: servidor Flask que expone las APIs /api/products y /api/media.

---

Si quieres, puedo generar un README para el archivo tienda.html (y otros) — ya lo crearé junto con este si lo deseas.