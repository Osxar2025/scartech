README — script.js

Resumen

Este archivo contiene la lógica del conversor de video a MP3 que se usa en video-a-mp3.html. Implementa la selección de archivos (drag & drop o file input), previsualización, integración con FFmpeg compilado a WebAssembly (ffmpeg.wasm) para convertir el video a MP3 en el cliente, y la gestión de progreso/estado/UI.

Cómo usar

- Abrir video-a-mp3.html en un navegador moderno que soporte WebAssembly.
- Seleccionar o arrastrar un archivo de video (MP4, WEBM, etc.).
- Seleccionar bitrate y hacer clic en Convertir.
- El proceso usa ffmpeg.wasm cargado desde CDN y realiza la conversión enteramente en el navegador; luego ofrece un enlace de descarga.

Estructura y explicación por bloques

1) Variables y referencias DOM (líneas 1-30)
- Se obtienen referencias a todos los elementos relevantes: dropzone, fileInput, thumbs, botones, paneles y elementos de progreso.
- Variables de estado: currentFile, bitrate, ffmpeg, vuInterval.

2) Visual VU meter (líneas 31-53)
- Se construyen barras (i) dinámicamente y animateVU(active) anima las alturas para dar feedback visual durante la conversión.

3) Utilidades (log, showError, clearError, formatBytes, formatDuration) (líneas 55-82)
- Funciones auxiliares para registrar mensajes de log en la UI, mostrar/limpiar errores y formatear bytes/duración.

4) Selección de archivo (líneas 84-117)
- Eventos para click, dragover, drop y cambio en file input para aceptar archivos de video.
- handleFile(file): valida tipo, crea URL con URL.createObjectURL para previsualizar, lee metadatos (duración) y muestra la fila de archivo.
- resetUpload(): limpia selección y UI.

5) Selección de bitrate (líneas 129-135)
- Los botones .bitrate-btn actualizan la variable bitrate y la clase activa.

6) Integración con ffmpeg.wasm (líneas 137-159)
- loadFFmpeg() crea/retorna instancia FFmpeg desde FFmpegWASM (uso de FFmpegWASM/FFmpegUtil), configura listeners para progreso y carga los blobs del core desde un CDN (unpkg).
- En on('progress') se actualiza la barra de progreso.

7) Conversión (líneas 161-210)
- Al hacer click en convertBtn se ejecuta:
  - Validaciones (archivo presente), actualización de UI para mostrar panel de proceso y animación VU.
  - Carga del motor ffmpeg (loadFFmpeg).
  - Escritura del archivo de entrada en el filesystem virtual de ffmpeg (engine.writeFile) usando fetchFile.
  - Ejecución del comando ffmpeg: ['-i', inputName, '-vn', '-b:a', bitrate + 'k', 'output.mp3'] para extraer audio y codificar a MP3 con el bitrate seleccionado.
  - Lectura del archivo output.mp3 desde el motor, creación de Blob y URL para descargar.
  - Limpieza temporal de archivos en el FS virtual.
  - Manejo de errores: muestra mensaje y vuelve UI a estado inicial.

8) Reset / descarga (líneas 212-217)
- resetBtn restaura UI y limpia estado.

Puntos técnicos y recomendaciones

- Compatibilidad: ffmpeg.wasm exige un navegador moderno y puede consumir mucha memoria/CPU; en dispositivos limitados puede fallar o tardar mucho.

- Tamaño y performance: el core de ffmpeg.wasm se descarga desde CDN; la primera carga puede ser lenta. Considerar un servidor para servir los archivos estáticos o limitar el tamaño máximo de archivos.

- Seguridad: la conversión se realiza en cliente, los archivos no salen del navegador a menos que explícitamente se suban.

- Mejora: agregar validación de tamaño antes de cargar FFmpeg para evitar consumir recursos innecesarios en archivos muy grandes.

- Limpieza: el código ya intenta borrar archivos temporales del FS virtual, pero es recomendable manejar correctamente excepciones para evitar fugas.

Archivos relacionados

- video-a-mp3.html: markup que usa este script.
- estilo.css: estilos de la interfaz.

---

¿Quieres que añada límites máximos de tamaño de archivo y mensajes claros antes de iniciar la descarga del núcleo de FFmpeg para ahorrar ancho de banda?