README — tienda.html

Resumen

La página tienda.html contiene la interfaz del catálogo y un panel administrativo para gestionar productos. Se apoya en tienda.js para cargar, crear, editar y eliminar productos mediante la API REST (rutas /api/products).

Cómo usar

- Abrir tienda.html en el navegador o servir la carpeta con Flask.
- tienda.js se encarga de las acciones: carga inicial de productos (GET /api/products), creación (POST /api/products), actualización (PUT /api/products/:id) y eliminación (DELETE /api/products/:id).

Estructura y explicación por bloques

1) Head (líneas 1-10)
- Declaración de idioma (es), meta viewport y links a Google Fonts y estilo (estilo.css).

2) Header / navegación (líneas 12-32)
- Misma navegación que en index.html pero con la pestaña "Tienda" marcada como activa.

3) Main — Cabecera y hero (líneas 34-50)
- Contenido introductorio del catálogo con título, subtítulo y botón para volver al inicio.

4) Panel catálogo y lista (líneas 52-59)
- Sección con id="#catalogGrid" donde se renderizan las tarjetas de la tienda (vista pública).
- Elemento #productCount muestra la cantidad de productos.

5) Panel de administración / formulario (líneas 61-104)
- Formulario #productForm con campos: Nombre (id=name), Categoría (id=category), Precio (id=price), Stock (id=stock), URL de la imagen (id=imageUrl).
- Image preview: #imagePreview y #imagePreviewText para mostrar la imagen o un texto si no hay imagen.
- Botones: Guardar producto (#saveProductBtn) y Cancelar (#cancelEditBtn).
- El formulario permite crear productos nuevos y —cuando se edita— actualizar los existentes.

6) Panel de administración — lista detallada (líneas 106-113)
- #productList es el contenedor donde tienda.js renderiza la lista de productos con acciones Editar / Eliminar. #productCountAdmin es un texto informativo.

7) Inclusión de script (línea 116)
- <script src="tienda.js"></script> — el código JavaScript que implementa la lógica de la página.

Interacción con tienda.js (puntos relevantes)

- Elementos esperados por tienda.js: #productForm, #productList, #productCount, #catalogGrid, #name, #category, #price, #stock, #imageUrl, #imagePreview, #imagePreviewText, #saveProductBtn, #cancelEditBtn.
- El archivo tienda.js realiza fetch a /api/products para obtener y sincronizar el listado con el backend.

Buenas prácticas y recomendaciones

- Validación: el formulario realiza validaciones básicas en cliente; validar también en servidor.
- Prevención de XSS: escapar o sanitizar contenido que venga del servidor antes de inyectarlo en el DOM.
- Optimización: agregar paginación o filtros si el catálogo crece mucho.
- Seguridad: controlar quién puede acceder al panel administrativo en producción (la página actual asume que cualquiera puede acceder al formulario).

Archivos relacionados

- tienda.js: lógica del CRUD de productos.
- app.py: endpoints /api/products que consumirá tienda.js.
- estilo.css: estilos visuales.

---

Si deseas, puedo añadir notas para convertir la sección administrativa en una vista autenticada o añadir paginación.