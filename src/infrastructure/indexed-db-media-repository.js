import { MEDIA_TYPES, createMediaItem } from '../domain/media-item.js';

const DATABASE_NAME = 'scartech';
const DATABASE_VERSION = 1;
const STORE_NAME = 'media';

export class IndexedDbMediaRepository {
  constructor(indexedDB = window.indexedDB, urlApi = window.URL) {
    if (!indexedDB) throw new Error('Este navegador no permite guardar archivos multimedia localmente.');
    this.indexedDB = indexedDB;
    this.urlApi = urlApi;
    this.databasePromise = null;
  }

  openDatabase() {
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.addEventListener('upgradeneeded', () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      });
      request.addEventListener('success', () => resolve(request.result));
      request.addEventListener('error', () => reject(new Error('No se pudo abrir la biblioteca multimedia local.')));
      request.addEventListener('blocked', () => reject(new Error('Cierra otras pestañas de ScarTech para actualizar la biblioteca.')));
    });

    return this.databasePromise;
  }

  async list() {
    const database = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.addEventListener('success', () => {
        const library = Object.fromEntries(MEDIA_TYPES.map((type) => [type, []]));
        request.result.forEach((record) => {
          const item = createMediaItem(record, record.id);
          item.url = this.urlApi.createObjectURL(record.file);
          library[item.type].push(item);
        });
        resolve(library);
      });
      request.addEventListener('error', () => reject(new Error('No se pudo leer la biblioteca multimedia local.')));
    });
  }

  async create(input, file) {
    const item = createMediaItem(input, crypto.randomUUID());
    const database = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).add({ ...item, url: '', file });
      transaction.addEventListener('complete', () => {
        resolve({ ...item, url: this.urlApi.createObjectURL(file) });
      });
      transaction.addEventListener('error', () => reject(new Error('No se pudo guardar el archivo multimedia localmente.')));
      transaction.addEventListener('abort', () => reject(new Error('No se pudo guardar el archivo multimedia localmente.')));
    });
  }

  async remove(id) {
    const database = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      let exists = false;
      request.addEventListener('success', () => {
        exists = Boolean(request.result);
        if (exists) store.delete(id);
        else transaction.abort();
      });
      transaction.addEventListener('complete', resolve);
      transaction.addEventListener('error', () => reject(new Error('No se pudo eliminar el archivo multimedia.')));
      transaction.addEventListener('abort', () => reject(new Error(exists
        ? 'No se pudo eliminar el archivo multimedia.'
        : 'No se encontró el archivo multimedia que quieres eliminar.')));
    });
  }
}
