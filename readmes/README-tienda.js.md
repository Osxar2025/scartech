README — tienda.js

Resumen

Este archivo JavaScript implementa la lógica del CRUD de productos para la página tienda.html. Conecta con la API REST expuesta por el servidor (rutas /api/products) para listar, crear, actualizar y eliminar productos. También maneja la vista pública del catálogo y la previsualización de imágenes.

Estructura y explicación por bloques

1) Variables globales (líneas 1-17)
- Se obtienen referencias a elementos del DOM: productForm, productList, productCount, catalogGrid, botones y campos del formulario.
- products: arreglo local que mantiene el estado actual cargado desde la API.
- editingId: id del producto actualmente en edición (null cuando se crea uno nuevo).

2) loadProducts() (líneas 19-30)
- Hace fetch a GET /api/products, asigna la respuesta a products y llama renderProducts().
- Si falla la petición, limpia products y renderiza el estado vacío.

3) saveProducts() (líneas 32-34)
- Función placeholder que actualmente devuelve true. (Se deja para extensiones o salvado local).

4) updateImagePreview(url) (líneas 36-49)
- Actualiza la vista previa de la imagen en base a una URL. Si la URL está vacía muestra el texto "Sin imagen".

5) renderProducts() (líneas 51-111)
- Renderiza la lista de productos en #productList para administración y en #catalogGrid como vista pública.
- Si no hay productos muestra un estado vacío.
- Utiliza innerHTML para crear tarjetas con información, botones Editar/Eliminar y contadores.

6) resetForm() (líneas 114-120)
- Resetea el formulario, limpia editingId, cambia el texto del botón y oculta el botón cancelar.

7) productForm submit (líneas 122-158)
- Previene el comportamiento por defecto y construye un payload con los campos del formulario.
- Valida que nombre y categoría existan y que precio/stock no sean negativos.
- Determina si la petición es POST (crear) o PUT (actualizar) según editingId.
- Hace fetch a la ruta correspondiente y en caso de éxito recarga los productos y resetea el formulario.
- Manejo de errores con alert.

8) productList click (líneas 160-197)
- Delegación de eventos para los botones Editar y Eliminar dentro de la lista.
- Si se hace click en Eliminar: realiza DELETE /api/products/:id, recarga productos y resetea el formulario si era el item que se estaba editando.
- Si se hace click en Editar: carga los datos del producto en el formulario, establece editingId, actualiza la UI (botón y preview).

9) image preview y cancel (líneas 199-206)
- Escucha input del campo URL de imagen para actualizar la vista previa en tiempo real.
- El botón cancelar restaura el formulario al estado inicial.

10) Inicio (línea 206)
- Llama a updateImagePreview('') y loadProducts() para inicializar la página.

Notas y recomendaciones

- Sanitizar datos: actualmente se inyectan strings provenientes de la API en innerHTML. Si la API no es totalmente confiable, escape/encode valores para prevenir XSS.
- Manejo de errores: se usan alert() y console.error. Considerar mostrar errores en UI más elegante.
- Paginación/filtros: para catálogos grandes agregar paginación y filtros por categoría.
- Autenticación/Autorización: la sección de administración no está protegida; en producción limitar acceso.

Relación con el servidor

- Endpoints esperados por tienda.js:
  - GET /api/products -> lista de productos
  - POST /api/products -> crear producto (payload JSON)
  - PUT /api/products/:id -> actualizar
  - DELETE /api/products/:id -> eliminar

---

¿Deseas que adapte tienda.js para usar una interfaz de confirmación personalizada en lugar de alert() o que implemente paginación básica?