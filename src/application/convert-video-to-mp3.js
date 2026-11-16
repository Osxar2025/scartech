const SUPPORTED_BITRATES = new Set([128, 192, 320]);

export class ConvertVideoToMp3 {
  constructor(converter) {
    this.converter = converter;
  }

  execute(file, bitrate, onProgress) {
    if (!file?.type.startsWith('video/')) throw new Error('Selecciona un archivo de video.');
    if (!SUPPORTED_BITRATES.has(bitrate)) throw new Error('La calidad seleccionada no es válida.');
    return this.converter.convert(file, bitrate, onProgress);
  }
}
