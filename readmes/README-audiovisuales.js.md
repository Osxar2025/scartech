README — audiovisuales.js

Resumen

Este archivo gestiona la biblioteca multimedia dentro de audiovisuales.html. Implementa la carga inicial desde la API (/api/media), la subida de nuevos items (music, image, video), la renderización de la biblioteca con filtros y acciones por item (descargar, eliminar).

Estructura y explicación por bloques

1) Estado inicial (líneas 1-9)
- library: objeto con arrays para music, image y video.
- currentFilter, selectedFile, selectedType: variables para controlar estado de UI.

2) DOMContentLoaded (líneas 11-16)
- Al cargar el DOM llama a loadLibrary(), initEventListeners() y renderLibrary().

3) initEventListeners() (líneas 18-61)
- Configura los listeners para: tabs de upload, botones de agregar, inputs de archivo, labels clicables (que abren el file picker) y botones de filtro.

4) switchUploadTab(type, btn) (líneas 63-77)
- Cambia la pestaña de upload (music/image/video): actualiza selectedType, clases active en botones y secciones.

5) handleFileSelect(e, type) (líneas 79-88)
- Asigna selectedFile cuando se selecciona un archivo y pone foco en el campo de metadatos.

6) addMusic/addImage/addVideo (líneas 90-220)
- Cada función valida campos necesarios (título, selección de archivo), construye un payload con: type, title, artist/description, url (URL.createObjectURL(selectedFile)), file_name y size en MB.
- Realiza POST /api/media con payload JSON. En caso de éxito recarga la biblioteca y limpia el formulario (clearMusicForm, clearImageForm, clearVideoForm).
- Manejo de errores con alert.

7) clearXForm() (líneas 222-242)
- Limpian los inputs y selectedFile.

8) filterLibrary(filter, btn) (líneas 244-254)
- Actualiza el filtro activo y vuelve a renderizar.

9) renderLibrary() (líneas 256-292)
- Calcula la lista de items a mostrar (todos o por tipo), ordena por timestamp (más recientes primero), muestra/oculta el empty state y reconstruye el HTML con createItemCard.
- Añade event listeners a los botones de acción de cada tarjeta (descargar/eliminar).

10) createItemCard(item) (líneas 292-343)
- Genera el HTML de la tarjeta según el tipo: music (ícono), image (img) o video (video).
- Incluye metadatos visibles (title, artist/description, size) y botones con data-action para descargar o eliminar.

11) handleItemAction(action, itemId, type) (líneas 345-370)
- Si action === 'delete': busca y elimina el item dentro de library[*], revoca la URL temporal con URL.revokeObjectURL y guarda/actualiza la UI.
- Si action === 'download': llama a downloadItem(itemId).

12) downloadItem(itemId) (líneas 372-388)
- Busca el item por id y crea dinámicamente un <a> con download para bajar el archivo desde item.url.

13) saveLibrary() (líneas 390-393)
- Actualmente placeholder que retorna true. Implementar persistencia local si se desea guardar en localStorage.

14) loadLibrary() (líneas 395-411)
- Intenta fetch GET /api/media y asignar los arrays (data.music, data.image, data.video). Si falla, limpia la biblioteca y registra el error.

15) formatFileSize(bytes) (líneas 413-420)
- Utilidad para formatear bytes a KB/MB/GB con dos decimales.

Consideraciones y recomendaciones

- Manejo de archivos binarios: actualmente el flujo crea URLs temporales localmente (URL.createObjectURL) y manda al servidor solo metadatos; no sube el binario real. Si se quiere guardar archivos en servidor, implementar endpoint multipart/form-data.

- Persistencia: saveLibrary es placeholder. Se puede usar localStorage o indexDB si se quiere persistir localmente sin servidor.

- Identificadores únicos: actualmente la API devuelve ids; si se trabaja offline, hay que garantizar ids únicos en la UI.

- Seguridad: validar tipos y tamaños en el servidor también.

- UX: agregar confirmación visual al eliminar y mejorar mensajes de error en UI en lugar de alert().

Endpoints usados

- GET /api/media -> obtiene la biblioteca (object con music, image, video)
- POST /api/media -> crea nuevo item multimedia

---

¿Deseas que convierta saveLibrary() en una implementación que guarde en localStorage como respaldo cuando la API no esté disponible?