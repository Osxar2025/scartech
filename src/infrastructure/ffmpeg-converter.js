export class FFmpegConverter {
  constructor({ ffmpegLibrary, utilLibrary }) {
    this.ffmpegLibrary = ffmpegLibrary;
    this.utilLibrary = utilLibrary;
    this.engine = null;
  }

  async load() {
    if (this.engine) return this.engine;

    const engine = new this.ffmpegLibrary.FFmpeg();
    const baseUrl = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const toBlobURL = this.utilLibrary.toBlobURL;
    await engine.load({
      coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, 'application/wasm')
    });
    this.engine = engine;
    return engine;
  }

  async convert(file, bitrate, onProgress) {
    const engine = await this.load();
    engine.on('progress', ({ progress }) => onProgress(Math.min(100, Math.round(progress * 100))));

    const extension = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '.mp4';
    const inputName = `input${extension}`;
    let inputCreated = false;
    try {
      await engine.writeFile(inputName, await this.utilLibrary.fetchFile(file));
      inputCreated = true;
      await engine.exec(['-i', inputName, '-vn', '-b:a', `${bitrate}k`, 'output.mp3']);
      const data = await engine.readFile('output.mp3');
      return new Blob([data.buffer], { type: 'audio/mpeg' });
    } finally {
      for (const fileName of [inputCreated ? inputName : null, 'output.mp3'].filter(Boolean)) {
        try {
          await engine.deleteFile(fileName);
        } catch (error) {
          console.warn(`No se pudo limpiar el archivo temporal ${fileName}.`, error);
        }
      }
    }
  }
}
