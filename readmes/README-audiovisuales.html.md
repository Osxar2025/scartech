README — audiovisuales.html

Resumen

Esta página proporciona una interfaz para gestionar una biblioteca multimedia (música, imágenes, videos). Permite subir archivos (a través de inputs de tipo file), agregar metadatos y mostrar la biblioteca con filtros. El comportamiento está implementado en audiovisuales.js.

Cómo usar

- Abrir audiovisuales.html en el navegador o servir la carpeta con Flask.
- Subir archivos desde el panel de subida y hacer clic en "Agregar" para enviar metadatos a la API (/api/media).

Estructura y explicación por bloques

1) Head y navegación (líneas 1-10, 12-32)
- Scripts de Google Fonts y estilo global (estilo.css). Barra superior con enlaces similares a index.html.

2) Upload Panel (líneas 41-101)
- upload-tabs: botones para seleccionar el tipo que se subirá (music, image, video).
- upload-section (music): input type=file oculto (#musicInput), campos title/artist y botón #addMusicBtn.
- upload-section (image): input #imageInput, title y description, botón #addImageBtn.
- upload-section (video): input #videoInput, title y description, botón #addVideoBtn.
- Las etiquetas con clase .upload-label envuelven los inputs y son clicables para abrir el selector de archivos.

3) Library Panel (líneas 103-123)
- library-filters: botones para filtrar la vista en Todo, Música, Imágenes o Videos.
- #libraryGrid: contenedor donde audiovisuales.js renderiza las tarjetas de cada item.
- #emptyState: elemento que se muestra cuando no hay items.

4) Inclusión de script (línea 126)
- <script src="audiovisuales.js"></script>: archivo que contiene toda la lógica de subida, almacenamiento y renderizado.

Comportamiento (implementado en audiovisuales.js)

- Los inputs de archivo usan URL.createObjectURL para crear una URL temporal y poder previsualizar/descargar localmente.
- Al agregar un item, el script realiza POST /api/media con un payload JSON que incluye: type, title, description, artist, url, file_name, size.
- La página admite filtros y ordena los items por created_at (más recientes primero).
- Acciones disponibles por item: Descargar y Eliminar.

Recomendaciones

- En la versión actual los archivos reales no se suben al servidor — se usa URL.createObjectURL para uso local u objetos en memoria. Si la intención es almacenar archivos reales en el servidor, se necesita implementar un endpoint que reciba multipart/form-data y guarde los binarios (ej. en disco o almacenamiento en la nube) y devuelva URLs públicas.

- Validación de tamaño y tipo: el HTML ya limita con accept y se indica el tamaño máximo; el servidor debe validar también.

- Confidencialidad/seguridad: controlar quién puede subir/eliminar items.

Archivos relacionados

- audiovisuales.js: lógica cliente de la página.
- app.py: endpoints /api/media para persistencia.
- estilo.css: estilos de la interfaz.

---

¿Deseas que agregue un ejemplo de endpoint en app.py para manejar uploads de archivos binarios (multipart/form-data)?