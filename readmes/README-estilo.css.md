README — estilo.css

Resumen

Archivo CSS principal del proyecto. Define variables CSS (paleta de colores y tipografías), estilos globales y reglas para los componentes principales: topbar, botones, paneles, grid de productos, dropzone, VU meter y la interfaz de la biblioteca audiovisual.

Estructura y explicación por bloques

1) Variables y reset (líneas 2-17)
- :root define variables como --bg, --surface, --accent y familias tipográficas. Facilita cambios globales de tema.

2) Globales (líneas 19-31)
- box-sizing, tipografía base, fondo con degradado y patrón sutil.

3) Topbar y navegación (líneas 33-86)
- .topbar, .brand, .tab-nav y .tab-link: estilos para la barra superior, los enlaces y los iconos sociales.

4) Componentes de layout (líneas 136-145, 370-412)
- .wrap: contenedor central de la página.
- .panel: contenedor con fondo tipo consola (bordes, rivets) usado en múltiples secciones.

5) Formularios y catálogo (líneas 146-236, 288-364)
- .product-form, .form-grid, .product-list, .product-card: estilos para el formulario administrativo y la lista de productos.
- .image-preview-box: caja para vista previa de imagen.

6) Dropzone y conversor (líneas 424-504, 549-591)
- .dropzone: área para arrastrar/soltar video.
- VU meter (.vu): barras visuales que se animan durante el proceso de conversión.
- Barra de progreso (.progress-track, .progress-fill) y log.

7) Biblioteca audiovisuales (líneas 676-892)
- .upload-panel, .upload-tabs, .upload-section: estilos de las pestañas y paneles de subida.
- .library-grid y .library-item: tarjetas para cada item multimedia con media preview y acciones.

8) Responsividad y accesibilidad básica (varias reglas @media)
- Cambios en grid y diseño a pantallas pequeñas (max-width 700px, 600px, 560px) para que el layout sea usable en móviles.
- prefers-reduced-motion: desactiva animaciones para usuarios que lo requieran.

Puntos a tener en cuenta

- Variables: fácil tematización cambiando las variables en :root.
- Consistencia visual: el esquema de colores usa un fondo oscuro con acentos cálidos; mantener contraste para accesibilidad.
- Performance: el archivo es grande porque contiene estilos para todas las vistas; podría dividirse por páginas para cargas más rápidas (CSS crítico inline + CSS por página).

Mapeo entre clases y archivos JS/HTML

- .dropzone, #fileInput, #convertBtn, .bitrate-btn son referenciados desde script.js.
- .product-form, #productList, #catalogGrid, #imagePreview son referenciados desde tienda.js.
- .upload-panel, #musicInput, #imageInput, #videoInput, #libraryGrid son referenciados desde audiovisuales.js.

---

¿Deseas que genere una versión CSS dividida por páginas (index.css, tienda.css, audiovisuales.css) para mejorar tiempos de carga?