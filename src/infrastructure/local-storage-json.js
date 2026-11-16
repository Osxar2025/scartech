export class LocalStorageJson {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  read(key, fallback) {
    const value = this.storage.getItem(key);
    if (value === null) return fallback;

    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`No se pudieron leer los datos guardados (${key}).`, { cause: error });
    }
  }

  write(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new Error('No se pudieron guardar los datos. Libera espacio del navegador e inténtalo de nuevo.', { cause: error });
    }
  }
}
