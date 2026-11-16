import { createProduct } from '../domain/product.js';
import { LocalStorageJson } from './local-storage-json.js';

const STORAGE_KEY = 'scartechProducts';

export class LocalStorageProductRepository {
  constructor(storage = new LocalStorageJson()) {
    this.storage = storage;
  }

  list() {
    return this.storage.read(STORAGE_KEY, []).map((product) => createProduct(product, product.id));
  }

  create(input) {
    const products = this.list();
    const product = createProduct(input, crypto.randomUUID());
    this.storage.write(STORAGE_KEY, [...products, product]);
    return product;
  }

  update(input) {
    const products = this.list();
    const index = products.findIndex((product) => product.id === input.id);
    if (index < 0) throw new Error('No se encontró el producto que quieres actualizar.');

    products[index] = createProduct(input, input.id);
    this.storage.write(STORAGE_KEY, products);
    return products[index];
  }

  remove(id) {
    const products = this.list();
    const nextProducts = products.filter((product) => product.id !== id);
    if (nextProducts.length === products.length) throw new Error('No se encontró el producto que quieres eliminar.');
    this.storage.write(STORAGE_KEY, nextProducts);
  }
}
