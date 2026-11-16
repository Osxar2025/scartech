import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalStorageJson } from '../src/infrastructure/local-storage-json.js';
import { LocalStorageProductRepository } from '../src/infrastructure/local-storage-product-repository.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test('product repository persists CRUD operations through the storage adapter', () => {
  const repository = new LocalStorageProductRepository(new LocalStorageJson(new MemoryStorage()));
  const product = repository.create({ name: 'Monitor', category: 'Pantallas', price: 250, stock: 2 });
  assert.equal(repository.list().length, 1);
  repository.update({ ...product, name: 'Monitor Pro' });
  assert.equal(repository.list()[0].name, 'Monitor Pro');
  repository.remove(product.id);
  assert.deepEqual(repository.list(), []);
});

test('storage adapter reports malformed persisted JSON instead of hiding corruption', () => {
  const storage = new MemoryStorage();
  storage.setItem('test', '{');
  assert.throws(() => new LocalStorageJson(storage).read('test', []), /No se pudieron leer/);
});
